import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import {
    createChart,
    CandlestickSeries,
    BarSeries,
    LineSeries,
    AreaSeries,
    BaselineSeries
} from 'lightweight-charts';
import styles from './ChartComponent.module.css';
import { getKlines, subscribeToTicker } from '../../services/binance';
import { calculateSMA, calculateEMA } from '../../utils/indicators';
import { calculateHeikinAshi } from '../../utils/chartUtils';
import { intervalToSeconds } from '../../utils/timeframes';
import { LineToolManager } from '../../plugins/line-tools/line-tools.js';
import '../../plugins/line-tools/line-tools.css';
import ReplayControls from '../Replay/ReplayControls';
import ReplaySlider from '../Replay/ReplaySlider';

const ChartComponent = forwardRef(({
    symbol,
    interval,
    chartType,
    indicators,
    activeTool,
    onToolUsed,
    isLogScale,
    isAutoScale,
    timeRange,
    magnetMode,
    isToolbarVisible = true,
    theme = 'dark',
    comparisonSymbols = [],
    onAlertsSync,
    onAlertTriggered,
}, ref) => {
    const chartContainerRef = useRef();
    const [isLoading, setIsLoading] = useState(true);
    const isActuallyLoadingRef = useRef(true); // Track if we're actually loading data (not just updating indicators) - start as true on mount
    const chartRef = useRef(null);
    const mainSeriesRef = useRef(null);
    const smaSeriesRef = useRef(null);
    const emaSeriesRef = useRef(null);
    const lineToolManagerRef = useRef(null);
    const wsRef = useRef(null);
    const chartTypeRef = useRef(chartType);
    const dataRef = useRef([]);
    const comparisonSeriesRefs = useRef(new Map());

    // Replay State
    const [isReplayMode, setIsReplayMode] = useState(false);
    const isReplayModeRef = useRef(false); // Ref to track replay mode in callbacks
    useEffect(() => { isReplayModeRef.current = isReplayMode; }, [isReplayMode]);

    const [isPlaying, setIsPlaying] = useState(false);
    const [replaySpeed, setReplaySpeed] = useState(1);
    const [replayIndex, setReplayIndex] = useState(null);
    const [isSelectingReplayPoint, setIsSelectingReplayPoint] = useState(false);
    const fullDataRef = useRef([]); // Store full data for replay
    const replayIntervalRef = useRef(null);
    const fadedSeriesRef = useRef(null); // Store faded series for future candles
    
    // Refs for stable callbacks to prevent race conditions
    const replayIndexRef = useRef(null);
    const isPlayingRef = useRef(false);
    const updateReplayDataRef = useRef(null); // Ref to store updateReplayData function
    useEffect(() => { replayIndexRef.current = replayIndex; }, [replayIndex]);
    useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

    const DEFAULT_CANDLE_WINDOW = 230;
    const DEFAULT_RIGHT_OFFSET = 10;

    const applyDefaultCandlePosition = (explicitLength) => {
        if (!chartRef.current) return;

        const inferredLength = Number.isFinite(explicitLength)
            ? explicitLength
            : (mainSeriesRef.current?.data()?.length ?? 0);

        if (!inferredLength || inferredLength <= 0) {
            return;
        }

        const lastIndex = Math.max(inferredLength - 1, 0);
        const to = lastIndex + DEFAULT_RIGHT_OFFSET;
        const from = to - DEFAULT_CANDLE_WINDOW;

        try {
            const timeScale = chartRef.current.timeScale();
            timeScale.applyOptions({ rightOffset: DEFAULT_RIGHT_OFFSET });
            timeScale.setVisibleLogicalRange({ from, to });
        } catch (err) {
            console.warn('Failed to apply default candle position', err);
        }

        chartRef.current.priceScale('right').applyOptions({ autoScale: true });
        if (lineToolManagerRef.current) {
            lineToolManagerRef.current.setDefaultRange({ from, to });
        }
    };

    // Axis Label State
    const [axisLabel, setAxisLabel] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState('');
    const isChartVisibleRef = useRef(true);

    useEffect(() => {
        chartTypeRef.current = chartType;
    }, [chartType]);

    // Expose undo/redo and line tool manager to parent
    useImperativeHandle(ref, () => ({
        undo: () => {
            if (lineToolManagerRef.current) lineToolManagerRef.current.undo();
        },
        redo: () => {
            if (lineToolManagerRef.current) lineToolManagerRef.current.redo();
        },
        getLineToolManager: () => lineToolManagerRef.current,
        clearTools: () => {
            if (lineToolManagerRef.current) lineToolManagerRef.current.clearTools();
        },
        addPriceAlert: (alert) => {
            // Bridge App-level alerts to the line-tools UserPriceAlerts primitive
            // WITHOUT opening an extra dialog – just create the alert directly.
            try {
                const manager = lineToolManagerRef.current;
                const userAlerts = manager && manager._userPriceAlerts;
                if (!userAlerts || !alert || alert.price == null) return;

                if (typeof userAlerts.setSymbolName === 'function') {
                    userAlerts.setSymbolName(symbol);
                }

                const priceNum = Number(alert.price);
                if (!Number.isFinite(priceNum)) return;

                // Directly add the alert with a simple crossing condition so it
                // is rendered on the chart without another confirmation dialog.
                if (typeof userAlerts.addAlertWithCondition === 'function') {
                    userAlerts.addAlertWithCondition(priceNum, 'crossing');
                } else if (typeof userAlerts.openEditDialog === 'function') {
                    // Fallback for older builds: still ensure it works, even if
                    // it means showing the internal dialog.
                    userAlerts.openEditDialog(alert.id, {
                        price: priceNum,
                        condition: 'crossing',
                    });
                }
            } catch (err) {
                console.warn('Failed to add price alert to chart', err);
            }
        },
        removePriceAlert: (externalId) => {
            try {
                const manager = lineToolManagerRef.current;
                const userAlerts = manager && manager._userPriceAlerts;
                if (!userAlerts || !externalId) return;

                if (typeof userAlerts.removeAlert === 'function') {
                    userAlerts.removeAlert(externalId);
                }
            } catch (err) {
                console.warn('Failed to remove price alert from chart', err);
            }
        },
        restartPriceAlert: (price, condition = 'crossing') => {
            try {
                const manager = lineToolManagerRef.current;
                const userAlerts = manager && manager._userPriceAlerts;
                if (!userAlerts || price == null) return;

                const priceNum = Number(price);
                if (!Number.isFinite(priceNum)) return;

                if (typeof userAlerts.addAlertWithCondition === 'function') {
                    userAlerts.addAlertWithCondition(priceNum, condition === 'crossing' ? 'crossing' : condition);
                }
            } catch (err) {
                console.warn('Failed to restart price alert on chart', err);
            }
        },
        resetZoom: () => {
            applyDefaultCandlePosition(dataRef.current.length);
        },
        getChartContainer: () => chartContainerRef.current,
        getCurrentPrice: () => {
            if (dataRef.current && dataRef.current.length > 0) {
                const lastData = dataRef.current[dataRef.current.length - 1];
                return lastData.close ?? lastData.value;
            }
            return null;
        },
        toggleReplay: () => {
            setIsReplayMode(prev => {
                const newMode = !prev;
                if (!prev) {
                    // Entering replay mode
                    fullDataRef.current = [...dataRef.current];
                    setIsPlaying(false);
                    isPlayingRef.current = false;
                    const startIndex = Math.max(0, dataRef.current.length - 1);
                    setReplayIndex(startIndex);
                    replayIndexRef.current = startIndex;
                    // Initialize replay data display - show all candles initially
                    setTimeout(() => {
                        if (updateReplayDataRef.current) {
                            updateReplayDataRef.current(startIndex, false);
                        }
                    }, 0);
                } else {
                    // Exiting replay mode
                    stopReplay();
                    setIsPlaying(false);
                    isPlayingRef.current = false;
                    setReplayIndex(null);
                    replayIndexRef.current = null;
                    setIsSelectingReplayPoint(false);
                    
                    // Clean up faded series (if we were using it)
                    if (fadedSeriesRef.current && chartRef.current) {
                        try {
                            chartRef.current.removeSeries(fadedSeriesRef.current);
                        } catch (e) {
                            console.warn('Error removing faded series:', e);
                        }
                        fadedSeriesRef.current = null;
                    }

                    
                    // Restore full data
                    if (mainSeriesRef.current && fullDataRef.current.length > 0) {
                        dataRef.current = fullDataRef.current;
                        const transformedData = transformData(fullDataRef.current, chartTypeRef.current);
                        mainSeriesRef.current.setData(transformedData);
                        updateIndicators(fullDataRef.current);
                    }
                }
                return newMode;
            });
        }
    }));

    // Handle active tool change
    useEffect(() => {
        if (lineToolManagerRef.current && activeTool) {
            const toolMap = {
                'cursor': 'None',
                'trendline': 'TrendLine',
                'arrow': 'Arrow',
                'ray': 'Ray',
                'extended_line': 'ExtendedLine',
                'horizontal': 'HorizontalLine',
                'horizontal_ray': 'HorizontalRay',
                'vertical': 'VerticalLine',
                'cross_line': 'CrossLine',
                'parallel_channel': 'ParallelChannel',
                'fibonacci': 'FibRetracement',
                'fib_extension': 'FibExtension',
                'pitchfork': 'Pitchfork',
                'brush': 'Brush',
                'highlighter': 'Highlighter',
                'rectangle': 'Rectangle',
                'circle': 'Circle',
                'path': 'Path',
                'text': 'Text',
                'callout': 'Callout',
                'price_label': 'PriceLabel',
                'pattern': 'Pattern',
                'triangle': 'Triangle',
                'abcd': 'ABCD',
                'xabcd': 'XABCD',
                'elliott_impulse': 'ElliottImpulseWave',
                'elliott_correction': 'ElliottCorrectionWave',
                'head_and_shoulders': 'HeadAndShoulders',
                'prediction': 'LongPosition',
                'prediction_short': 'ShortPosition',
                'date_range': 'DateRange',
                'price_range': 'PriceRange',
                'date_price_range': 'DatePriceRange',
                'measure': 'Measure',
                'remove': 'None'
            };

            const mappedTool = toolMap[activeTool] || 'None';
            console.log(`🎨 Starting tool: ${activeTool} -> ${mappedTool}`);

            if (lineToolManagerRef.current && typeof lineToolManagerRef.current.startTool === 'function') {
                lineToolManagerRef.current.startTool(mappedTool);
                console.log('✅ Tool started successfully');
            }
        }
    }, [activeTool]);

    // Candle Countdown Timer Logic
    useEffect(() => {
        const updateTimer = () => {
            const now = Date.now() / 1000;
            const intervalSeconds = intervalToSeconds(interval);
            if (!Number.isFinite(intervalSeconds) || intervalSeconds <= 0) {
                setTimeRemaining('00:00:00');
                return;
            }
            const nextCandleTime = Math.ceil(now / intervalSeconds) * intervalSeconds;
            const diff = nextCandleTime - now;

            if (diff > 0) {
                const hours = Math.floor(diff / 3600);
                const minutes = Math.floor((diff % 3600) / 60);
                const seconds = Math.floor(diff % 60);

                const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                setTimeRemaining(formatted);
            } else {
                setTimeRemaining('00:00:00');
            }
        };

        if (isReplayMode) {
            setTimeRemaining('');
            return;
        }

        updateTimer();
        const timerId = setInterval(updateTimer, 1000);

        return () => clearInterval(timerId);
        return () => clearInterval(timerId);
    }, [interval, isReplayMode]);

    // Track chart visibility to avoid unnecessary RAF work
    useEffect(() => {
        if (!chartContainerRef.current) return undefined;

        const handleVisibility = (entries) => {
            if (entries && entries[0]) {
                isChartVisibleRef.current = entries[0].isIntersecting;
            }
        };

        const observer = new IntersectionObserver(handleVisibility, { threshold: 0 });
        observer.observe(chartContainerRef.current);

        const handleDocumentVisibility = () => {
            if (document.visibilityState === 'hidden') {
                isChartVisibleRef.current = false;
            }
        };

        document.addEventListener('visibilitychange', handleDocumentVisibility);

        return () => {
            observer.disconnect();
            document.removeEventListener('visibilitychange', handleDocumentVisibility);
        };
    }, []);

    // Update Axis Label Position and Content
    const updateAxisLabel = useCallback(() => {
        if (!chartRef.current || !mainSeriesRef.current || !chartContainerRef.current) return;

        const data = mainSeriesRef.current.data();
        if (!data || data.length === 0) {
            setAxisLabel(null);
            return;
        }

        const lastData = data[data.length - 1];
        const price = lastData.close ?? lastData.value;
        if (price === undefined) {
            setAxisLabel(null);
            return;
        }

        const coordinate = mainSeriesRef.current.priceToCoordinate(price);

        if (coordinate === null) {
            setAxisLabel(null);
            return;
        }

        let color = '#2962FF';
        if (lastData.open !== undefined && lastData.close !== undefined) {
            color = lastData.close >= lastData.open ? '#089981' : '#F23645';
        }

        try {
            let labelText = price.toFixed(2);

            // Handle Percentage Mode Label
            if (comparisonSymbols.length > 0) {
                const timeScale = chartRef.current.timeScale();
                const visibleRange = timeScale.getVisibleLogicalRange();

                if (visibleRange) {
                    const firstIndex = Math.max(0, Math.round(visibleRange.from));
                    if (dataRef.current && firstIndex < dataRef.current.length) {
                        const baseData = dataRef.current[firstIndex];
                        if (baseData) {
                            const baseValue = baseData.close ?? baseData.value;

                            if (baseValue && baseValue !== 0) {
                                const percentage = ((price - baseValue) / baseValue) * 100;
                                labelText = `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
                            }
                        }
                    }
                }
            }

            const newLabel = {
                top: coordinate,
                price: labelText,
                symbol: comparisonSymbols.length > 0 ? symbol : null, // Only show symbol if in comparison mode
                color: color
            };

            setAxisLabel(prev => {
                if (!prev || prev.top !== newLabel.top || prev.price !== newLabel.price || prev.symbol !== newLabel.symbol || prev.color !== newLabel.color) {
                    return newLabel;
                }
                return prev;
            });
        } catch (err) {
            console.error('Error in updateAxisLabel:', err);
        }
    }, [comparisonSymbols]);

    // RAF Loop for smooth updates
    useEffect(() => {
        let animationFrameId;

        const animate = () => {
            if (isChartVisibleRef.current && document.visibilityState !== 'hidden') {
                updateAxisLabel();
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrameId);
    }, [updateAxisLabel]);



    // Helper to transform OHLC data based on chart type
    const transformData = (data, type) => {
        if (!data || data.length === 0) return [];

        switch (type) {
            case 'line':
            case 'area':
            case 'baseline':
                return data.map(d => ({ time: d.time, value: d.close }));
            case 'heikin-ashi':
                return calculateHeikinAshi(data);
            default:
                return data;
        }
    };

    // Create appropriate series based on chart type
    const createSeries = (chart, type) => {
        const commonOptions = { lastValueVisible: false, priceScaleId: 'right' };

        switch (type) {
            case 'candlestick':
                return chart.addSeries(CandlestickSeries, {
                    ...commonOptions,
                    upColor: '#089981',
                    downColor: '#F23645',
                    borderVisible: false,
                    wickUpColor: '#089981',
                    wickDownColor: '#F23645',
                });
            case 'bar':
                return chart.addSeries(BarSeries, {
                    ...commonOptions,
                    upColor: '#089981',
                    downColor: '#F23645',
                    thinBars: false,
                });
            case 'hollow-candlestick':
                return chart.addSeries(CandlestickSeries, {
                    ...commonOptions,
                    upColor: 'transparent',
                    downColor: '#F23645',
                    borderUpColor: '#089981',
                    borderDownColor: '#F23645',
                    wickUpColor: '#089981',
                    wickDownColor: '#F23645',
                });
            case 'line':
                return chart.addSeries(LineSeries, {
                    ...commonOptions,
                    color: '#2962FF',
                    lineWidth: 2,
                });
            case 'area':
                return chart.addSeries(AreaSeries, {
                    ...commonOptions,
                    topColor: 'rgba(41, 98, 255, 0.4)',
                    bottomColor: 'rgba(41, 98, 255, 0.0)',
                    lineColor: '#2962FF',
                    lineWidth: 2,
                });
            case 'baseline':
                return chart.addSeries(BaselineSeries, {
                    ...commonOptions,
                    topLineColor: '#089981',
                    topFillColor1: 'rgba(8, 153, 129, 0.28)',
                    topFillColor2: 'rgba(8, 153, 129, 0.05)',
                    bottomLineColor: '#F23645',
                    bottomFillColor1: 'rgba(242, 54, 69, 0.05)',
                    bottomFillColor2: 'rgba(242, 54, 69, 0.28)',
                });
            case 'heikin-ashi':
                return chart.addSeries(CandlestickSeries, {
                    ...commonOptions,
                    upColor: '#089981',
                    downColor: '#F23645',
                    borderVisible: false,
                    wickUpColor: '#089981',
                    wickDownColor: '#F23645',
                });
            default:
                return chart.addSeries(CandlestickSeries, {
                    ...commonOptions,
                    upColor: '#089981',
                    downColor: '#F23645',
                    borderVisible: false,
                    wickUpColor: '#089981',
                    wickDownColor: '#F23645',
                });
        }
    };

    // Keep track of active tool for the wrapper
    const activeToolRef = useRef(activeTool);
    useEffect(() => {
        activeToolRef.current = activeTool;
    }, [activeTool]);

    // Initialize LineToolManager when series is ready
    const initializeLineTools = (series) => {
        if (!lineToolManagerRef.current) {
            const manager = new LineToolManager();

            // Wrap startTool to detect when tool is cancelled/finished
            const originalStartTool = manager.startTool.bind(manager);
            manager.startTool = (tool) => {
                console.log('🔧 LineToolManager.startTool called with:', tool);
                originalStartTool(tool);

                // If tool is None, it means we are back to cursor mode
                if ((tool === 'None' || tool === null) && activeToolRef.current !== null && activeToolRef.current !== 'cursor') {
                    console.log('🔄 Tool cancelled/finished, resetting state');
                    if (onToolUsed) onToolUsed();
                }
            };

            series.attachPrimitive(manager);
            lineToolManagerRef.current = manager;
            console.log('✅ LineToolManager initialized');

            // Ensure alerts primitive (if present) knows the current symbol
            try {
                const userAlerts = manager._userPriceAlerts;
                if (userAlerts && typeof userAlerts.setSymbolName === 'function') {
                    userAlerts.setSymbolName(symbol);
                }

                // Bridge internal alert list out to React so the Alerts tab
                // can show alerts created from the chart-side UI.
                if (userAlerts && typeof userAlerts.alertsChanged === 'function' && typeof userAlerts.alerts === 'function' && typeof onAlertsSync === 'function') {
                    userAlerts.alertsChanged().subscribe(() => {
                        try {
                            const rawAlerts = userAlerts.alerts() || [];
                            const mapped = rawAlerts.map(a => ({
                                id: a.id,
                                price: a.price,
                                condition: a.condition || 'crossing',
                                type: a.type || 'price',
                            }));
                            onAlertsSync(mapped);
                        } catch (err) {
                            console.warn('Failed to sync chart alerts to app', err);
                        }
                    }, manager);
                }

                // Also bridge trigger events so the app can mark alerts as Triggered
                // and write log entries when the internal primitive fires.
                if (userAlerts && typeof userAlerts.alertTriggered === 'function' && typeof onAlertTriggered === 'function') {
                    userAlerts.alertTriggered().subscribe((evt) => {
                        try {
                            onAlertTriggered({
                                externalId: evt.alertId,
                                price: evt.alertPrice,
                                timestamp: evt.timestamp,
                                direction: evt.direction,
                                condition: evt.condition,
                            });
                        } catch (err) {
                            console.warn('Failed to propagate alertTriggered event to app', err);
                        }
                    }, manager);
                }
            } catch (err) {
                console.warn('Failed to initialize alert symbol name', err);
            }

            window.lineToolManager = manager;
            window.chartInstance = chartRef.current;
            window.seriesInstance = series;
        }
    };

    // Initialize chart once on mount
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                textColor: theme === 'dark' ? '#D1D4DC' : '#131722',
                background: { color: theme === 'dark' ? '#131722' : '#ffffff' },
            },
            grid: {
                vertLines: { color: theme === 'dark' ? '#2A2E39' : '#e0e3eb' },
                horzLines: { color: theme === 'dark' ? '#2A2E39' : '#e0e3eb' },
            },
            crosshair: {
                mode: magnetMode ? 1 : 0,
                vertLine: {
                    width: 1,
                    color: theme === 'dark' ? '#758696' : '#9598a1',
                    style: 3,
                    labelBackgroundColor: theme === 'dark' ? '#758696' : '#9598a1',
                },
                horzLine: {
                    width: 1,
                    color: theme === 'dark' ? '#758696' : '#9598a1',
                    style: 3,
                    labelBackgroundColor: theme === 'dark' ? '#758696' : '#9598a1',
                },
            },
            timeScale: {
                borderColor: theme === 'dark' ? '#2A2E39' : '#e0e3eb',
                timeVisible: true,
            },
            rightPriceScale: {
                borderColor: theme === 'dark' ? '#2A2E39' : '#e0e3eb',
            },
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
            },
            handleScale: {
                mouseWheel: true,
                pinch: true,
            },
        });

        chartRef.current = chart;

        const mainSeries = createSeries(chart, chartType);
        mainSeriesRef.current = mainSeries;

        // Initialize LineToolManager
        initializeLineTools(mainSeries);

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight,
                });
            }
        };

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(chartContainerRef.current);

        // Handle right-click to cancel tool
        const handleContextMenu = (event) => {
            event.preventDefault(); // Prevent default right-click menu
            if (activeToolRef.current && activeToolRef.current !== 'cursor') {
                if (onToolUsed) onToolUsed();
            }
        };
        const container = chartContainerRef.current;
        container.addEventListener('contextmenu', handleContextMenu, true);

        return () => {
            try {
                container.removeEventListener('contextmenu', handleContextMenu, true);
            } catch (error) {
                console.warn('Failed to remove contextmenu listener', error);
            }
            try {
                resizeObserver.disconnect();
            } catch (error) {
                console.warn('Failed to disconnect resize observer', error);
            }
            try {
                if (wsRef.current) wsRef.current.close();
            } catch (error) {
                console.warn('Failed to close chart WebSocket', error);
            }
            try {
                chart.remove();
            } catch (error) {
                console.warn('Failed to remove chart instance', error);
            } finally {
                chartRef.current = null;
                mainSeriesRef.current = null;
                lineToolManagerRef.current = null;
            }
        };
    }, []); // Only create chart once

    // Re-create main series when chart type changes
    useEffect(() => {
        if (!chartRef.current || !mainSeriesRef.current) {
            return;
        }

        const chart = chartRef.current;

        if (lineToolManagerRef.current) {
            try {
                lineToolManagerRef.current.clearTools();
            } catch (err) {
                console.warn('Failed to clear tools before switching chart type', err);
            }
            try {
                mainSeriesRef.current.detachPrimitive(lineToolManagerRef.current);
            } catch (err) {
                console.warn('Failed to detach line tools from series', err);
            }
            lineToolManagerRef.current = null;
        }

        chart.removeSeries(mainSeriesRef.current);

        const replacementSeries = createSeries(chart, chartType);
        mainSeriesRef.current = replacementSeries;
        initializeLineTools(replacementSeries);

        const existingData = transformData(dataRef.current, chartType);
        if (existingData.length) {
            replacementSeries.setData(existingData);
            updateIndicators(dataRef.current);
            applyDefaultCandlePosition(existingData.length);
            updateAxisLabel();
        }
        
        // Recreate faded series if in replay mode
        if (isReplayMode && fadedSeriesRef.current) {
            try {
                chart.removeSeries(fadedSeriesRef.current);
            } catch (e) {
                console.warn('Error removing faded series on chart type change:', e);
            }
            fadedSeriesRef.current = null;
            
            // Trigger replay data update to recreate faded series with new type
            if (replayIndex !== null) {
                updateReplayData(replayIndex);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chartType, updateAxisLabel]);

    // Load data when symbol/interval changes
    useEffect(() => {
        if (!chartRef.current) return;

        let cancelled = false;
        let indicatorFrame = null;
        const abortController = new AbortController();

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        const loadData = async () => {
            isActuallyLoadingRef.current = true;
            setIsLoading(true);
            // Remove forceVisible class when actually loading data
            if (chartContainerRef.current) {
                chartContainerRef.current.classList.remove(styles.forceVisible);
            }
            try {
                const data = await getKlines(symbol, interval, 1000, abortController.signal);
                if (cancelled) return;

                if (Array.isArray(data) && data.length > 0 && mainSeriesRef.current) {
                    dataRef.current = data;
                    const activeType = chartTypeRef.current;
                    const transformedData = transformData(data, activeType);
                    mainSeriesRef.current.setData(transformedData);

                    if (indicatorFrame) cancelAnimationFrame(indicatorFrame);
                    indicatorFrame = requestAnimationFrame(() => {
                        if (!cancelled) {
                            // Ensure chart is visible before updating indicators
                            if (chartContainerRef.current) {
                                chartContainerRef.current.classList.add(styles.forceVisible);
                                chartContainerRef.current.style.visibility = 'visible';
                                chartContainerRef.current.style.opacity = '1';
                            }
                            updateIndicators(data);
                        }
                    });

                    applyDefaultCandlePosition(transformedData.length);

                    setTimeout(() => {
                        if (!cancelled) {
                            isActuallyLoadingRef.current = false;
                            setIsLoading(false);
                            // Ensure chart is visible after data loads
                            if (chartContainerRef.current) {
                                chartContainerRef.current.classList.add(styles.forceVisible);
                                chartContainerRef.current.style.visibility = 'visible';
                                chartContainerRef.current.style.opacity = '1';
                            }
                            updateAxisLabel();
                        }
                    }, 50);

                    wsRef.current = subscribeToTicker(symbol.toLowerCase(), interval, (ticker) => {
                        if (cancelled || !ticker) return;

                        const parsedCandle = {
                            time: Number(ticker.time),
                            open: Number(ticker.open),
                            high: Number(ticker.high),
                            low: Number(ticker.low),
                            close: Number(ticker.close),
                        };

                        const intervalSeconds = intervalToSeconds(interval);
                        if (!Number.isFinite(intervalSeconds) || intervalSeconds <= 0) {
                            return;
                        }

                        if (!['open', 'high', 'low', 'close'].every(key => Number.isFinite(parsedCandle[key]))) {
                            console.warn('Received invalid candle data:', parsedCandle);
                            return;
                        }

                        const candleTime = Math.floor(parsedCandle.time / intervalSeconds) * intervalSeconds;
                        const normalizedCandle = { ...parsedCandle, time: candleTime };

                        const currentData = dataRef.current.length ? [...dataRef.current] : [];
                        const lastIndex = currentData.length - 1;
                        if (lastIndex >= 0 && currentData[lastIndex].time === candleTime) {
                            currentData[lastIndex] = normalizedCandle;
                        } else {
                            currentData.push(normalizedCandle);
                        }

                        dataRef.current = currentData;

                        const currentChartType = chartTypeRef.current;
                        const transformedRealtimeData = transformData(currentData, currentChartType);
                        const latestUpdate = transformedRealtimeData[transformedRealtimeData.length - 1];

                        let isValidUpdate = false;
                        if (latestUpdate) {
                            if (latestUpdate.value !== undefined) {
                                isValidUpdate = Number.isFinite(latestUpdate.value);
                            } else if (latestUpdate.open !== undefined) {
                                isValidUpdate = ['open', 'high', 'low', 'close'].every(key => Number.isFinite(latestUpdate[key]));
                            }
                        }

                        if (isValidUpdate && mainSeriesRef.current && !isReplayModeRef.current) {
                            mainSeriesRef.current.setData(transformedRealtimeData);
                            updateRealtimeIndicators(currentData);
                            updateAxisLabel();
                        }
                    });
                } else {
                    dataRef.current = [];
                    mainSeriesRef.current?.setData([]);
                    isActuallyLoadingRef.current = false;
                    setIsLoading(false);
                    // Ensure chart is visible after loading completes (even if no data)
                    if (chartContainerRef.current) {
                        chartContainerRef.current.classList.add(styles.forceVisible);
                        chartContainerRef.current.style.visibility = 'visible';
                        chartContainerRef.current.style.opacity = '1';
                    }
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    return;
                }
                console.error('Error loading chart data:', error);
                if (!cancelled) {
                    isActuallyLoadingRef.current = false;
                    setIsLoading(false);
                    // Ensure chart is visible even after error
                    if (chartContainerRef.current) {
                        chartContainerRef.current.classList.add(styles.forceVisible);
                        chartContainerRef.current.style.visibility = 'visible';
                        chartContainerRef.current.style.opacity = '1';
                    }
                }
            }
        };

        emaLastValueRef.current = null;
        loadData();

        return () => {
            cancelled = true;
            if (indicatorFrame) {
                cancelAnimationFrame(indicatorFrame);
            }
            abortController.abort();
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [symbol, interval]);

    const emaLastValueRef = useRef(null);

    const updateRealtimeIndicators = useCallback((data) => {
        if (!chartRef.current) return;

        const lastIndex = data.length - 1;
        const lastDataPoint = data[lastIndex];

        // SMA Indicator
        if (indicators.sma && smaSeriesRef.current) {
            if (data.length < 20) {
                const smaData = calculateSMA(data, 20);
                if (smaData && smaData.length > 0) {
                    smaSeriesRef.current.setData(smaData);
                }
            } else {
                const subset = data.slice(-20);
                const sum = subset.reduce((acc, d) => acc + d.close, 0);
                const average = sum / subset.length;
                smaSeriesRef.current.update({ time: lastDataPoint.time, value: average });
            }
        }

        // EMA Indicator
        if (indicators.ema && emaSeriesRef.current) {
            if (data.length < 20 || emaLastValueRef.current === null) {
                const emaData = calculateEMA(data, 20);
                if (emaData && emaData.length > 0) {
                    emaLastValueRef.current = emaData[emaData.length - 1].value;
                    emaSeriesRef.current.setData(emaData);
                }
            } else {
                const smoothing = 2 / (20 + 1);
                const emaValue = (lastDataPoint.close - emaLastValueRef.current) * smoothing + emaLastValueRef.current;
                emaLastValueRef.current = emaValue;
                emaSeriesRef.current.update({ time: lastDataPoint.time, value: emaValue });
            }
        }
    }, [indicators]);

    const updateIndicators = useCallback((data) => {
        if (!chartRef.current) return;

        // CRITICAL: Ensure chart container remains visible during indicator updates
        // This must be done FIRST, before any chart operations
        // Always ensure visibility when updating indicators, even during initial load
        if (chartContainerRef.current) {
            // Add CSS class for guaranteed visibility (using !important) - do this FIRST
            chartContainerRef.current.classList.add(styles.forceVisible);
            // Set immediately and synchronously - always visible when updating indicators
            chartContainerRef.current.style.visibility = 'visible';
            chartContainerRef.current.style.opacity = '1';
            // Remove any inline styles that might hide it
            chartContainerRef.current.style.display = '';
        }

        // Batch all operations to prevent multiple redraws
        chartRef.current.applyOptions({});
        
        // Double-check visibility after chart operations
        if (chartContainerRef.current) {
            chartContainerRef.current.classList.add(styles.forceVisible);
            chartContainerRef.current.style.visibility = 'visible';
            chartContainerRef.current.style.opacity = '1';
        }
        
        // Also use requestAnimationFrame as backup
        requestAnimationFrame(() => {
            if (chartContainerRef.current) {
                chartContainerRef.current.classList.add(styles.forceVisible);
                chartContainerRef.current.style.visibility = 'visible';
                chartContainerRef.current.style.opacity = '1';
            }
        });

        // Ensure visibility before each indicator calculation
        if (chartContainerRef.current) {
            chartContainerRef.current.classList.add(styles.forceVisible);
            chartContainerRef.current.style.visibility = 'visible';
            chartContainerRef.current.style.opacity = '1';
        }

        // SMA Indicator
        if (indicators.sma) {
            if (!smaSeriesRef.current) {
                smaSeriesRef.current = chartRef.current.addSeries(LineSeries, {
                    color: '#2962FF',
                    lineWidth: 2,
                    title: 'SMA 20',
                    priceLineVisible: false,
                    lastValueVisible: false
                });
            }
            // Ensure visibility before calculation
            if (chartContainerRef.current) {
                chartContainerRef.current.classList.add(styles.forceVisible);
                chartContainerRef.current.style.visibility = 'visible';
                chartContainerRef.current.style.opacity = '1';
            }
            if (typeof calculateSMA === 'function') {
                const smaData = calculateSMA(data, 20);
                if (smaData && smaData.length > 0) {
                    smaSeriesRef.current.setData(smaData);
                }
            }
        } else {
            if (smaSeriesRef.current) {
                chartRef.current.removeSeries(smaSeriesRef.current);
                smaSeriesRef.current = null;
            }
        }

        // Ensure visibility before EMA calculation
        if (chartContainerRef.current) {
            chartContainerRef.current.classList.add(styles.forceVisible);
            chartContainerRef.current.style.visibility = 'visible';
            chartContainerRef.current.style.opacity = '1';
        }

        // EMA Indicator
        if (indicators.ema) {
            if (!emaSeriesRef.current) {
                emaSeriesRef.current = chartRef.current.addSeries(LineSeries, {
                    color: '#FF6D00',
                    lineWidth: 2,
                    title: 'EMA 20',
                    priceLineVisible: false,
                    lastValueVisible: false
                });
            }
            // Ensure visibility before calculation
            if (chartContainerRef.current) {
                chartContainerRef.current.classList.add(styles.forceVisible);
                chartContainerRef.current.style.visibility = 'visible';
                chartContainerRef.current.style.opacity = '1';
            }
            if (typeof calculateEMA === 'function') {
                const emaData = calculateEMA(data, 20);
                if (emaData && emaData.length > 0) {
                    emaSeriesRef.current.setData(emaData);
                }
            }
        } else {
            if (emaSeriesRef.current) {
                chartRef.current.removeSeries(emaSeriesRef.current);
                emaSeriesRef.current = null;
            }
        }
        
        // Final visibility check after all indicator operations
        if (chartContainerRef.current) {
            chartContainerRef.current.classList.add(styles.forceVisible);
            chartContainerRef.current.style.visibility = 'visible';
            chartContainerRef.current.style.opacity = '1';
        }
    }, [indicators]);

    // Separate effect for indicators to prevent data reload
    useEffect(() => {
        // CRITICAL: Ensure chart remains visible IMMEDIATELY when indicators change
        // This must happen synchronously before any other operations to prevent flicker
        // Always ensure visibility, regardless of loading state (indicators should never hide chart)
        if (chartContainerRef.current) {
            // Add CSS class for guaranteed visibility (using !important)
            chartContainerRef.current.classList.add(styles.forceVisible);
            // Also set inline styles immediately (synchronously) as primary method
            chartContainerRef.current.style.visibility = 'visible';
            chartContainerRef.current.style.opacity = '1';
            
            // Use requestAnimationFrame to ensure this runs before any paint
            requestAnimationFrame(() => {
                if (chartContainerRef.current) {
                    chartContainerRef.current.classList.add(styles.forceVisible);
                    chartContainerRef.current.style.visibility = 'visible';
                    chartContainerRef.current.style.opacity = '1';
                }
            });
        }
        
        // CRITICAL: Ensure chart is visible BEFORE any indicator calculations
        // This must happen synchronously, before any async operations
        if (chartContainerRef.current) {
            chartContainerRef.current.classList.add(styles.forceVisible);
            chartContainerRef.current.style.visibility = 'visible';
            chartContainerRef.current.style.opacity = '1';
        }
        
        emaLastValueRef.current = null;
        if (dataRef.current.length > 0) {
            // Ensure visibility again right before calling updateIndicators
            if (chartContainerRef.current) {
                chartContainerRef.current.classList.add(styles.forceVisible);
                chartContainerRef.current.style.visibility = 'visible';
                chartContainerRef.current.style.opacity = '1';
            }
            
            // Wrap in try-catch to handle any potential errors from indicator calculations
            try {
                updateIndicators(dataRef.current);
                if (emaSeriesRef.current && dataRef.current.length >= 20) {
                    const emaData = calculateEMA(dataRef.current, 20);
                    if (emaData && emaData.length > 0) {
                        emaLastValueRef.current = emaData[emaData.length - 1].value;
                        emaSeriesRef.current.setData(emaData);
                    }
                }
            } catch (error) {
                console.error('Error updating indicators:', error);
                // Ensure chart stays visible even if there's an error
                if (chartContainerRef.current) {
                    chartContainerRef.current.classList.add(styles.forceVisible);
                    chartContainerRef.current.style.visibility = 'visible';
                    chartContainerRef.current.style.opacity = '1';
                }
            }
        }
        
        // Double-check visibility after a microtask to ensure it wasn't reset
        Promise.resolve().then(() => {
            if (chartContainerRef.current) {
                chartContainerRef.current.classList.add(styles.forceVisible);
                chartContainerRef.current.style.visibility = 'visible';
                chartContainerRef.current.style.opacity = '1';
            }
        });
    }, [updateIndicators]);

    // Handle Magnet Mode
    useEffect(() => {
        if (chartRef.current) {
            chartRef.current.applyOptions({
                crosshair: {
                    mode: magnetMode ? 1 : 0,
                },
            });
        }
    }, [magnetMode]);



    // Handle Comparison Symbols
    useEffect(() => {
        if (!chartRef.current) return;

        const currentSymbols = new Set(comparisonSymbols.map(s => s.symbol));
        const activeSeries = comparisonSeriesRefs.current;

        // Remove series that are no longer in comparisonSymbols
        activeSeries.forEach((series, symbol) => {
            if (!currentSymbols.has(symbol)) {
                chartRef.current.removeSeries(series);
                activeSeries.delete(symbol);
            }
        });

        // Add new series
        comparisonSymbols.forEach(async (comp) => {
            if (!activeSeries.has(comp.symbol)) {
                const series = chartRef.current.addSeries(LineSeries, {
                    color: comp.color,
                    lineWidth: 2,
                    priceScaleId: 'right',
                    title: comp.symbol,
                });
                activeSeries.set(comp.symbol, series);

                // Fetch data
                try {
                    // Use the same interval as the main chart
                    const data = await getKlines(comp.symbol, interval, 1000);
                    if (data && data.length > 0) {
                        const transformedData = data.map(d => ({ time: d.time, value: d.close }));
                        series.setData(transformedData);
                    }
                } catch (err) {
                    console.error(`Failed to load comparison data for ${comp.symbol}`, err);
                }
            }
        });

        // Update Price Scale Mode
        // 0: Normal, 1: Log, 2: Percentage
        const mode = comparisonSymbols.length > 0 ? 2 : (isLogScale ? 1 : 0);

        chartRef.current.priceScale('right').applyOptions({
            mode: mode,
            autoScale: isAutoScale,
        });

    }, [comparisonSymbols, interval, isLogScale, isAutoScale]);

    // Handle Theme Changes
    useEffect(() => {
        if (chartRef.current) {
            chartRef.current.applyOptions({
                layout: {
                    textColor: theme === 'dark' ? '#D1D4DC' : '#131722',
                    background: { color: theme === 'dark' ? '#131722' : '#ffffff' },
                },
                grid: {
                    vertLines: { color: theme === 'dark' ? '#2A2E39' : '#e0e3eb' },
                    horzLines: { color: theme === 'dark' ? '#2A2E39' : '#e0e3eb' },
                },
                crosshair: {
                    vertLine: {
                        color: theme === 'dark' ? '#758696' : '#9598a1',
                        labelBackgroundColor: theme === 'dark' ? '#758696' : '#9598a1',
                    },
                    horzLine: {
                        color: theme === 'dark' ? '#758696' : '#9598a1',
                        labelBackgroundColor: theme === 'dark' ? '#758696' : '#9598a1',
                    },
                },
                timeScale: {
                    borderColor: theme === 'dark' ? '#2A2E39' : '#e0e3eb',
                },
                rightPriceScale: {
                    borderColor: theme === 'dark' ? '#2A2E39' : '#e0e3eb',
                },
            });
        }
    }, [theme]);

    // Handle Time Range
    useEffect(() => {
        if (chartRef.current && timeRange && !isLoading) {
            const now = Math.floor(Date.now() / 1000);
            let from = now;
            const to = now;

            switch (timeRange) {
                case '1D': from = now - 86400; break;
                case '5D': from = now - 86400 * 5; break;
                case '1M': from = now - 86400 * 30; break;
                case '3M': from = now - 86400 * 90; break;
                case '6M': from = now - 86400 * 180; break;
                case 'YTD': {
                    const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime() / 1000;
                    from = startOfYear;
                    break;
                }
                case '1Y': from = now - 86400 * 365; break;
                case '5Y': from = now - 86400 * 365 * 5; break;
                case 'All':
                    applyDefaultCandlePosition();
                    return;
                default: return;
            }

            if (from && to && !isNaN(from) && !isNaN(to)) {
                try {
                    chartRef.current.timeScale().setVisibleRange({ from, to });
                } catch (e) {
                    if (e.message !== 'Value is null') {
                        console.warn('Failed to set visible range:', e);
                    }
                }
            }
        }
    }, [timeRange, isLoading]);

    // Replay Logic
    const stopReplay = () => {
        if (replayIntervalRef.current) {
            clearInterval(replayIntervalRef.current);
            replayIntervalRef.current = null;
        }
    };

    // Define updateReplayData first since other functions depend on it
    const updateReplayData = useCallback((index, hideFeature = true, preserveView = false) => {
        if (!mainSeriesRef.current || !fullDataRef.current || !chartRef.current) return;
        
        // Clamp index to valid range
        const clampedIndex = Math.max(0, Math.min(index, fullDataRef.current.length - 1));
        
        // Store current visible range if we need to preserve it
        let currentVisibleRange = null;
        if (preserveView && chartRef.current) {
            try {
                const timeScale = chartRef.current.timeScale();
                currentVisibleRange = timeScale.getVisibleLogicalRange();
            } catch (e) {
                // Ignore errors
            }
        }
        
        const pastData = fullDataRef.current.slice(0, clampedIndex + 1);
        
        if (hideFeature) {
            // Hide future candles - show only past data
            dataRef.current = pastData;
            const transformedData = transformData(pastData, chartTypeRef.current);
            mainSeriesRef.current.setData(transformedData);
        } else {
            // Show all candles (for preview mode)
            dataRef.current = fullDataRef.current;
            const transformedData = transformData(fullDataRef.current, chartTypeRef.current);
            mainSeriesRef.current.setData(transformedData);
        }
        
        // Update indicators only with past data
        updateIndicators(pastData);
        updateAxisLabel();
        
        // Update ref to keep in sync
        replayIndexRef.current = clampedIndex;
        
        // Restore visible range if we're preserving the view
        if (preserveView && currentVisibleRange && chartRef.current) {
            try {
                setTimeout(() => {
                    const timeScale = chartRef.current.timeScale();
                    timeScale.setVisibleLogicalRange(currentVisibleRange);
                }, 0);
            } catch (e) {
                // Ignore errors
            }
        }
    }, []);
    
    // Store updateReplayData in ref so it can be accessed from useImperativeHandle
    useEffect(() => {
        updateReplayDataRef.current = updateReplayData;
    }, [updateReplayData]);

    const handleReplayPlayPause = () => {
        setIsPlaying(prev => !prev);
    };

    const handleReplayForward = () => {
        const currentIndex = replayIndexRef.current;
        if (currentIndex !== null && currentIndex < fullDataRef.current.length - 1) {
            const nextIndex = currentIndex + 1;
            setReplayIndex(nextIndex);
            updateReplayData(nextIndex);
        }
    };

    const handleReplayJumpTo = () => {
        setIsSelectingReplayPoint(true);
        setIsPlaying(false);
        
        // Show ALL candles so user can see the full timeline and select a new point
        // But preserve the current zoom level and position
        if (mainSeriesRef.current && fullDataRef.current && fullDataRef.current.length > 0) {
            // Store current visible range to preserve zoom level
            let currentVisibleRange = null;
            if (chartRef.current) {
                try {
                    const timeScale = chartRef.current.timeScale();
                    currentVisibleRange = timeScale.getVisibleRange();
                } catch (e) {
                    // Ignore errors
                }
            }
            
            // Store current replay index before showing all candles
            const currentReplayIndex = replayIndexRef.current;
            
            // Show all candles so user can see the full timeline
            dataRef.current = fullDataRef.current;
            const transformedData = transformData(fullDataRef.current, chartTypeRef.current);
            mainSeriesRef.current.setData(transformedData);
            updateIndicators(fullDataRef.current);
            
            // Restore the visible range to maintain zoom level
            // Use setTimeout to ensure data update has completed
            setTimeout(() => {
                if (chartRef.current && fullDataRef.current && fullDataRef.current.length > 0) {
                    try {
                        const timeScale = chartRef.current.timeScale();
                        
                        // If we have a current visible range, restore it to maintain zoom
                        if (currentVisibleRange && currentVisibleRange.from && currentVisibleRange.to) {
                            // Restore the exact same range to maintain zoom level
                            timeScale.setVisibleRange(currentVisibleRange);
                        } else if (currentReplayIndex !== null && currentReplayIndex >= 0) {
                            // No current range, but we have a replay index - show around it
                            const currentIndex = currentReplayIndex;
                            const currentTime = fullDataRef.current[currentIndex]?.time;
                            
                            if (currentTime) {
                                // Use a reasonable default window that matches typical zoom
                                const DEFAULT_VIEW_WINDOW = 200; // Larger window to avoid zooming in
                                const startIndex = Math.max(0, currentIndex - DEFAULT_VIEW_WINDOW / 2);
                                const endIndex = Math.min(fullDataRef.current.length - 1, currentIndex + DEFAULT_VIEW_WINDOW / 2);
                                
                                const startTime = fullDataRef.current[startIndex]?.time;
                                const endTime = fullDataRef.current[endIndex]?.time;
                                
                                if (startTime && endTime) {
                                    timeScale.setVisibleRange({ from: startTime, to: endTime });
                                }
                            }
                        } else {
                            // No current range or replay index - use fitContent to show all
                            try {
                                timeScale.fitContent();
                            } catch (e) {
                                // Ignore
                            }
                        }
                    } catch (e) {
                        console.warn('Failed to restore visible range in Jump to Bar:', e);
                    }
                }
            }, 50);
        }
        
        // Change cursor to indicate selection
        if (chartContainerRef.current) {
            chartContainerRef.current.style.cursor = 'crosshair';
        }
    };

    const handleSliderChange = useCallback((index, hideFuture = true) => {
        if (index >= 0 && index < fullDataRef.current.length) {
            // Stop playback when user manually changes position
            if (isPlayingRef.current) {
                setIsPlaying(false);
                isPlayingRef.current = false;
                stopReplay();
            }
            
            setReplayIndex(index);
            updateReplayData(index, hideFuture);
        }
    }, [updateReplayData]);

    // Playback Effect - Fixed race condition and synchronization
    useEffect(() => {
        if (isPlaying && isReplayMode) {
            stopReplay();
            
            // When playback starts, ensure we're showing only candles up to current index
            // Hide future candles immediately
            const currentIndex = replayIndexRef.current;
            if (currentIndex !== null) {
                updateReplayData(currentIndex, true); // true = hide future candles
            }
            
            const intervalMs = 1000 / replaySpeed; // 1x = 1 sec, 10x = 0.1 sec

            replayIntervalRef.current = setInterval(() => {
                // Use ref to get current value and avoid stale closures
                const currentIndex = replayIndexRef.current;
                
                if (currentIndex === null || currentIndex >= fullDataRef.current.length - 1) {
                    setIsPlaying(false);
                    isPlayingRef.current = false;
                    return;
                }
                
                const nextIndex = currentIndex + 1;
                
                // Update state and data synchronously - always hide future candles during playback
                setReplayIndex(nextIndex);
                updateReplayData(nextIndex, true); // true = hide future candles
            }, intervalMs);
        } else {
            stopReplay();
        }
        return () => stopReplay();
    }, [isPlaying, isReplayMode, replaySpeed, updateReplayData]);

    // Click Handler for "Jump to Bar" - TradingView style
    useEffect(() => {
        if (!chartRef.current || !isSelectingReplayPoint) return;
        if (!mainSeriesRef.current) return;

        // Chart click handler - param.time gives us the exact time at the clicked position
        const handleChartClick = (param) => {
            if (!param || !isSelectingReplayPoint) return;
            if (!fullDataRef.current || fullDataRef.current.length === 0) return;

            try {
                let clickedTime = null;
                
                // First try to use param.time (most accurate - exact time at click position)
                if (param.time) {
                    clickedTime = param.time;
                } else if (param.point) {
                    // Fallback: use coordinate to get time
                    const timeScale = chartRef.current.timeScale();
                    const x = param.point.x;
                    clickedTime = timeScale.coordinateToTime(x);
                }
                
                if (!clickedTime) return;

                // Find exact time match first (most accurate)
                let clickedIndex = fullDataRef.current.findIndex(d => d.time === clickedTime);
                
                // If no exact match, find the closest candle by time
                if (clickedIndex === -1) {
                    let minDiff = Infinity;
                    fullDataRef.current.forEach((d, i) => {
                        const diff = Math.abs(d.time - clickedTime);
                        if (diff < minDiff) {
                            minDiff = diff;
                            clickedIndex = i;
                        }
                    });
                }

                // Clamp to valid range
                clickedIndex = Math.max(0, Math.min(clickedIndex, fullDataRef.current.length - 1));

                if (clickedIndex >= 0 && clickedIndex < fullDataRef.current.length) {
                    // Store the selected index before updating
                    const selectedIndex = clickedIndex;
                    
                    // Get current visible range BEFORE updating data to preserve zoom level
                    let currentVisibleRange = null;
                    let currentVisibleLogicalRange = null;
                    try {
                        const timeScale = chartRef.current.timeScale();
                        currentVisibleRange = timeScale.getVisibleRange();
                        currentVisibleLogicalRange = timeScale.getVisibleLogicalRange();
                    } catch (e) {
                        // Ignore
                    }
                    
                    // Calculate the range width in time units to maintain zoom
                    let rangeWidth = null;
                    if (currentVisibleRange && currentVisibleRange.from && currentVisibleRange.to) {
                        rangeWidth = currentVisibleRange.to - currentVisibleRange.from;
                    }
                    
                    setReplayIndex(selectedIndex);
                    replayIndexRef.current = selectedIndex;
                    
                    // Calculate target visible range BEFORE updating data
                    const selectedTime = fullDataRef.current[selectedIndex]?.time;
                    let targetRange = null;
                    
                    if (selectedTime && rangeWidth && rangeWidth > 0) {
                        // Calculate target range to maintain zoom
                        const newFrom = selectedTime - rangeWidth / 2;
                        const newTo = selectedTime + rangeWidth / 2;
                        
                        const firstTime = fullDataRef.current[0]?.time;
                        const lastAvailableTime = fullDataRef.current[selectedIndex]?.time;
                        
                        if (firstTime && lastAvailableTime) {
                            let adjustedFrom = Math.max(firstTime, newFrom);
                            let adjustedTo = Math.min(lastAvailableTime, newTo);
                            
                            // Adjust boundaries while maintaining width
                            if (adjustedFrom === firstTime && adjustedTo < newTo) {
                                adjustedTo = Math.min(lastAvailableTime, adjustedFrom + rangeWidth);
                            } else if (adjustedTo === lastAvailableTime && adjustedFrom > newFrom) {
                                adjustedFrom = Math.max(firstTime, adjustedTo - rangeWidth);
                            }
                            
                            if (adjustedTo > adjustedFrom && (adjustedTo - adjustedFrom) >= rangeWidth * 0.3) {
                                targetRange = { from: adjustedFrom, to: adjustedTo };
                            }
                        }
                    }
                    
                    // If no target range calculated, use a default that doesn't zoom in
                    if (!targetRange && selectedTime) {
                        const VIEW_WINDOW = 300;
                        const startIndex = Math.max(0, selectedIndex - VIEW_WINDOW / 2);
                        const endIndex = selectedIndex;
                        const startTime = fullDataRef.current[startIndex]?.time;
                        const endTime = fullDataRef.current[endIndex]?.time;
                        if (startTime && endTime) {
                            targetRange = { from: startTime, to: endTime };
                        }
                    }
                    
                    // Update replay data
                    updateReplayData(selectedIndex, true, false);
                    
                    setIsSelectingReplayPoint(false);
                    if (chartContainerRef.current) {
                        chartContainerRef.current.style.cursor = 'default';
                    }
                    
                    // Immediately set visible range to prevent auto-zoom
                    // Set multiple times to ensure it sticks
                    if (targetRange && chartRef.current) {
                        try {
                            const timeScale = chartRef.current.timeScale();
                            // Set immediately
                            timeScale.setVisibleRange(targetRange);
                            
                            // Set again after a short delay to override any auto-zoom
                            setTimeout(() => {
                                if (chartRef.current) {
                                    try {
                                        chartRef.current.timeScale().setVisibleRange(targetRange);
                                    } catch (e) {
                                        // Ignore
                                    }
                                }
                            }, 10);
                            
                            // Set one more time after data update completes
                            setTimeout(() => {
                                if (chartRef.current) {
                                    try {
                                        chartRef.current.timeScale().setVisibleRange(targetRange);
                                    } catch (e) {
                                        // Ignore
                                    }
                                }
                            }, 100);
                        } catch (e) {
                            console.warn('Failed to set visible range after selection:', e);
                        }
                    }
                }
            } catch (e) {
                console.warn('Error handling chart click in Jump to Bar:', e);
            }
        };

        // Subscribe to chart clicks only (series don't have subscribeClick method)
        chartRef.current.subscribeClick(handleChartClick);
        
        return () => {
            if (chartRef.current) {
                chartRef.current.unsubscribeClick(handleChartClick);
            }
        };
    }, [isSelectingReplayPoint, updateReplayData]);

    return (
        <div className={`${styles.chartWrapper} ${isToolbarVisible ? styles.toolbarVisible : ''}`}>
            <div
                id="container"
                ref={chartContainerRef}
                className={styles.chartContainer}
                style={{
                    position: 'relative',
                    touchAction: 'none',
                    // Only hide if actually loading data, not during indicator updates
                    visibility: (isLoading && isActuallyLoadingRef.current) ? 'hidden' : 'visible',
                    opacity: (isLoading && isActuallyLoadingRef.current) ? 0 : 1,
                    transition: 'opacity 0.1s ease-in-out'
                }}
            />
            {isLoading && <div className={styles.loadingOverlay}><div className={styles.spinner}></div><div>Loading...</div></div>}

            {/* Axis Label */}
            {axisLabel && (
                <div
                    className={styles.axisLabelWrapper}
                    style={{ top: axisLabel.top }}
                >
                    {axisLabel.symbol && (
                        <div className={styles.axisLabelSymbol} style={{ backgroundColor: axisLabel.color }}>
                            {axisLabel.symbol}
                        </div>
                    )}
                    <div
                        className={styles.axisLabel}
                        style={{ backgroundColor: axisLabel.color }}
                    >
                        <span className={styles.axisLabelPrice}>{axisLabel.price}</span>
                        <span className={styles.axisLabelTimer}>{timeRemaining}</span>
                    </div>
                </div>
            )}

            {/* Candle Countdown */}
            {timeRemaining && !isReplayMode && (
                <div className={styles.countdown}>
                    Next candle in: {timeRemaining}
                </div>
            )}

            {/* Replay Controls */}
            {isReplayMode && (
                <ReplayControls
                    isPlaying={isPlaying}
                    speed={replaySpeed}
                    onPlayPause={handleReplayPlayPause}
                    onForward={handleReplayForward}
                    onJumpTo={handleReplayJumpTo}
                    onSpeedChange={setReplaySpeed}
                    onClose={() => {
                        setIsReplayMode(false);
                        // Restore full data
                        if (mainSeriesRef.current && fullDataRef.current.length > 0) {
                            dataRef.current = fullDataRef.current;
                            const transformedData = transformData(fullDataRef.current, chartTypeRef.current);
                            mainSeriesRef.current.setData(transformedData);
                            updateIndicators(fullDataRef.current);
                        }
                    }}
                />
            )}

            {/* Replay Slider */}
            {isReplayMode && (
                <ReplaySlider
                    chartRef={chartRef}
                    isReplayMode={isReplayMode}
                    replayIndex={replayIndex}
                    fullData={fullDataRef.current}
                    onSliderChange={handleSliderChange}
                    containerRef={chartContainerRef}
                    isSelectingReplayPoint={isSelectingReplayPoint}
                    isPlaying={isPlaying}
                />
            )}

            {isLoading && (
                <div className={styles.loaderContainer}>
                    <div className={styles.loader}></div>
                </div>
            )}
        </div>
    );
});

export default ChartComponent;
