import React, { useState, useEffect } from 'react';
import Layout from './components/Layout/Layout';
import Topbar from './components/Topbar/Topbar';
import DrawingToolbar from './components/Toolbar/DrawingToolbar';
import Watchlist from './components/Watchlist/Watchlist';
import ChartComponent from './components/Chart/ChartComponent';
import SymbolSearch from './components/SymbolSearch/SymbolSearch';
import Toast from './components/Toast/Toast';
import SnapshotToast from './components/Toast/SnapshotToast';
import html2canvas from 'html2canvas';
import { getTickerPrice, subscribeToMultiTicker } from './services/binance';

import BottomBar from './components/BottomBar/BottomBar';
import ChartGrid from './components/Chart/ChartGrid';
import AlertDialog from './components/Alert/AlertDialog';
import RightToolbar from './components/Toolbar/RightToolbar';
import AlertsPanel from './components/Alerts/AlertsPanel';

const VALID_INTERVAL_UNITS = new Set(['s', 'm', 'h', 'd', 'w', 'M']);
const DEFAULT_FAVORITE_INTERVALS = []; // No default favorites

const isValidIntervalValue = (value) => {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/^\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10) > 0;
  }
  const match = /^([1-9]\d*)([smhdwM])$/.exec(trimmed);
  if (!match) return false;
  const unit = match[2];
  return VALID_INTERVAL_UNITS.has(unit);
};

const sanitizeFavoriteIntervals = (raw) => {
  if (!Array.isArray(raw)) return DEFAULT_FAVORITE_INTERVALS;
  const filtered = raw.filter(isValidIntervalValue);
  const unique = Array.from(new Set(filtered));
  return unique; // Allow empty array
};

const sanitizeCustomIntervals = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item) => item && typeof item === 'object' && isValidIntervalValue(item.value))
    .map((item) => ({
      value: item.value,
      label: item.label || item.value,
      isCustom: true,
    }));
};

const safeParseJSON = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error('Failed to parse JSON from localStorage:', error);
    return fallback;
  }
};

const ALERT_RETENTION_MS = 24 * 60 * 60 * 1000; // 24 hours

const formatPrice = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return value;
  return num.toFixed(2);
};

function App() {
  // Multi-Chart State
  const [layout, setLayout] = useState(() => {
    const saved = safeParseJSON(localStorage.getItem('tv_saved_layout'), null);
    return saved && saved.layout ? saved.layout : '1';
  });
  const [activeChartId, setActiveChartId] = useState(1);
  const [charts, setCharts] = useState(() => {
    const saved = safeParseJSON(localStorage.getItem('tv_saved_layout'), null);
    return saved && Array.isArray(saved.charts) ? saved.charts : [
      { id: 1, symbol: 'BTCUSDT', interval: localStorage.getItem('tv_interval') || '1d', indicators: { sma: false, ema: false }, comparisonSymbols: [] }
    ];
  });

  // Derived state for active chart
  const activeChart = charts.find(c => c.id === activeChartId) || charts[0];
  const currentSymbol = activeChart.symbol;
  const currentInterval = activeChart.interval;

  // Refs for multiple charts
  const chartRefs = React.useRef({});

  // Flag to skip next sync (used during resume to prevent duplicate)
  const skipNextSyncRef = React.useRef(false);

  useEffect(() => {
    localStorage.setItem('tv_interval', currentInterval);
  }, [currentInterval]);
  const [chartType, setChartType] = useState('candlestick');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchMode, setSearchMode] = useState('switch'); // 'switch' or 'add'
  // const [indicators, setIndicators] = useState({ sma: false, ema: false }); // Moved to charts state
  const [toast, setToast] = useState(null);

  const [snapshotToast, setSnapshotToast] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertPrice, setAlertPrice] = useState(null);

  // Alert State (persisted with 24h retention)
  const [alerts, setAlerts] = useState(() => {
    const saved = safeParseJSON(localStorage.getItem('tv_alerts'), []);
    if (!Array.isArray(saved)) return [];
    const cutoff = Date.now() - ALERT_RETENTION_MS;
    return saved.filter(a => {
      const ts = a && a.created_at ? new Date(a.created_at).getTime() : NaN;
      return Number.isFinite(ts) && ts >= cutoff;
    });
  });
  const alertsRef = React.useRef(alerts); // Ref to avoid race condition in WebSocket callback
  React.useEffect(() => { alertsRef.current = alerts; }, [alerts]);

  const [alertLogs, setAlertLogs] = useState(() => {
    const saved = safeParseJSON(localStorage.getItem('tv_alert_logs'), []);
    if (!Array.isArray(saved)) return [];
    const cutoff = Date.now() - ALERT_RETENTION_MS;
    return saved.filter(l => {
      const ts = l && l.time ? new Date(l.time).getTime() : NaN;
      return Number.isFinite(ts) && ts >= cutoff;
    });
  });
  const [unreadAlertCount, setUnreadAlertCount] = useState(0);

  // Bottom Bar State
  const [currentTimeRange, setCurrentTimeRange] = useState('All');
  const [isLogScale, setIsLogScale] = useState(false);
  const [isAutoScale, setIsAutoScale] = useState(true);

  // Right Panel State
  const [activeRightPanel, setActiveRightPanel] = useState('watchlist');

  // Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('tv_theme') || 'dark';
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tv_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Toast timeout refs for cleanup
  const toastTimeoutRef = React.useRef(null);
  const snapshotToastTimeoutRef = React.useRef(null);

  // Show toast helper with cleanup to prevent memory leaks
  const showToast = (message, type = 'error') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 5000);
  };

  const showSnapshotToast = (message) => {
    if (snapshotToastTimeoutRef.current) {
      clearTimeout(snapshotToastTimeoutRef.current);
    }
    setSnapshotToast(message);
    snapshotToastTimeoutRef.current = setTimeout(() => setSnapshotToast(null), 3000);
  };

  // Cleanup toast timeouts on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (snapshotToastTimeoutRef.current) clearTimeout(snapshotToastTimeoutRef.current);
    };
  }, []);

  // Timeframe Management
  const [favoriteIntervals, setFavoriteIntervals] = useState(() => {
    const saved = safeParseJSON(localStorage.getItem('tv_fav_intervals_v2'), null);
    return sanitizeFavoriteIntervals(saved);
  });

  const [customIntervals, setCustomIntervals] = useState(() => {
    const saved = safeParseJSON(localStorage.getItem('tv_custom_intervals'), []);
    return sanitizeCustomIntervals(saved);
  });

  // Track last selected non-favorite interval (persisted)
  const [lastNonFavoriteInterval, setLastNonFavoriteInterval] = useState(() => {
    const saved = localStorage.getItem('tv_last_nonfav_interval');
    return isValidIntervalValue(saved) ? saved : null;
  });

  useEffect(() => {
    try {
      localStorage.setItem('tv_fav_intervals_v2', JSON.stringify(favoriteIntervals));
    } catch (error) {
      console.error('Failed to persist favorite intervals:', error);
    }
  }, [favoriteIntervals]);

  useEffect(() => {
    try {
      localStorage.setItem('tv_custom_intervals', JSON.stringify(customIntervals));
    } catch (error) {
      console.error('Failed to persist custom intervals:', error);
    }
  }, [customIntervals]);

  useEffect(() => {
    if (lastNonFavoriteInterval && !isValidIntervalValue(lastNonFavoriteInterval)) {
      return;
    }
    if (lastNonFavoriteInterval) {
      try {
        localStorage.setItem('tv_last_nonfav_interval', lastNonFavoriteInterval);
      } catch (error) {
        console.error('Failed to persist last non-favorite interval:', error);
      }
    } else {
      localStorage.removeItem('tv_last_nonfav_interval');
    }
  }, [lastNonFavoriteInterval]);

  // Handle interval change - track non-favorite selections
  // Handle interval change - track non-favorite selections
  const handleIntervalChange = (newInterval) => {
    setCharts(prev => prev.map(chart =>
      chart.id === activeChartId ? { ...chart, interval: newInterval } : chart
    ));

    // If the new interval is not a favorite, save it as the last non-favorite
    if (!favoriteIntervals.includes(newInterval)) {
      setLastNonFavoriteInterval(newInterval);
    }
  };

  const handleToggleFavorite = (interval) => {
    if (!isValidIntervalValue(interval)) {
      showToast('Invalid interval provided', 'error');
      return;
    }
    setFavoriteIntervals(prev =>
      prev.includes(interval) ? prev.filter(i => i !== interval) : [...prev, interval]
    );
  };

  const handleAddCustomInterval = (value, unit) => {
    const numericValue = parseInt(value, 10);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      showToast('Enter a valid number greater than 0', 'error');
      return;
    }
    const unitNormalized = VALID_INTERVAL_UNITS.has(unit) ? unit : null;
    if (!unitNormalized) {
      showToast('Invalid interval unit', 'error');
      return;
    }
    const newValue = `${numericValue}${unitNormalized}`;

    if (!isValidIntervalValue(newValue)) {
      showToast('Invalid interval format', 'error');
      return;
    }

    // Check if already exists in default or custom
    if (DEFAULT_FAVORITE_INTERVALS.includes(newValue) || customIntervals.some(i => i.value === newValue)) {
      showToast('Interval already available!', 'info');
      return;
    }

    const newInterval = { value: newValue, label: newValue, isCustom: true };
    setCustomIntervals(prev => [...prev, newInterval]);
    showToast('Custom interval added successfully!', 'success');
  };

  const handleRemoveCustomInterval = (intervalValue) => {
    setCustomIntervals(prev => prev.filter(i => i.value !== intervalValue));
    // Also remove from favorites if present
    setFavoriteIntervals(prev => prev.filter(i => i !== intervalValue));
    // If current interval is removed, switch to default
    if (currentInterval === intervalValue) {
      handleIntervalChange('1d');
    }
  };

  // Load watchlist from localStorage or default
  const [watchlistSymbols, setWatchlistSymbols] = useState(() => {
    const saved = safeParseJSON(localStorage.getItem('tv_watchlist'), null);
    return Array.isArray(saved) && saved.length ? saved : ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'ADAUSDT', 'DOTUSDT'];
  });

  const [watchlistData, setWatchlistData] = useState([]);

  // Persist watchlist
  useEffect(() => {
    localStorage.setItem('tv_watchlist', JSON.stringify(watchlistSymbols));
  }, [watchlistSymbols]);

  // Fetch watchlist data
  useEffect(() => {
    let ws = null;
    let mounted = true;
    let initialDataLoaded = false;
    const abortController = new AbortController();

    const hydrateWatchlist = async () => {
      try {
        const promises = watchlistSymbols.map(async (sym) => {
          const data = await getTickerPrice(sym, abortController.signal);
          if (data && mounted) {
            return {
              symbol: sym,
              last: parseFloat(data.lastPrice).toFixed(2),
              chg: parseFloat(data.priceChange).toFixed(2),
              chgP: parseFloat(data.priceChangePercent).toFixed(2) + '%',
              up: parseFloat(data.priceChange) >= 0
            };
          }
          return null;
        });

        const results = await Promise.all(promises);
        if (mounted) {
          setWatchlistData(results.filter(r => r !== null));
          initialDataLoaded = true;
        }
      } catch (error) {
        console.error('Error fetching watchlist data:', error);
        if (mounted) {
          showToast('Failed to load watchlist data', 'error');
          initialDataLoaded = true;
        }
      }

      if (!mounted || watchlistSymbols.length === 0) {
        if (mounted && watchlistSymbols.length === 0) {
          setWatchlistData([]);
          initialDataLoaded = true;
        }
        return;
      }

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }

      ws = subscribeToMultiTicker(watchlistSymbols, (ticker) => {
        if (!mounted || !initialDataLoaded) return;
        setWatchlistData(prev => {
          const index = prev.findIndex(item => item.symbol === ticker.symbol);
          if (index !== -1) {
            const newData = [...prev];
            newData[index] = {
              ...newData[index],
              last: ticker.last.toFixed(2),
              chg: ticker.chg.toFixed(2),
              chgP: ticker.chgP.toFixed(2) + '%',
              up: ticker.chg >= 0
            };
            return newData;
          }
          return prev;
        });
      });
    };

    hydrateWatchlist();

    return () => {
      mounted = false;
      abortController.abort();
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [watchlistSymbols]);

  // Persist alerts/logs to localStorage with 24h retention
  useEffect(() => {
    const cutoff = Date.now() - ALERT_RETENTION_MS;
    const filtered = alerts.filter(a => {
      const ts = a && a.created_at ? new Date(a.created_at).getTime() : NaN;
      return Number.isFinite(ts) && ts >= cutoff;
    });

    if (filtered.length !== alerts.length) {
      setAlerts(filtered);
      return; // avoid persisting stale data in this pass
    }

    try {
      localStorage.setItem('tv_alerts', JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to persist alerts:', error);
    }
  }, [alerts]);

  useEffect(() => {
    const cutoff = Date.now() - ALERT_RETENTION_MS;
    const filtered = alertLogs.filter(l => {
      const ts = l && l.time ? new Date(l.time).getTime() : NaN;
      return Number.isFinite(ts) && ts >= cutoff;
    });

    if (filtered.length !== alertLogs.length) {
      setAlertLogs(filtered);
      return;
    }

    try {
      localStorage.setItem('tv_alert_logs', JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to persist alert logs:', error);
    }
  }, [alertLogs]);

  // Check Alerts Logic (only for non line-tools alerts to avoid conflicting with plugin)
  // Uses alertsRef to check current alerts without triggering reconnections
  const alertSymbolsRef = React.useRef([]);

  // Update symbol list when alerts change, but only if symbols actually changed
  useEffect(() => {
    const activeNonLineToolAlerts = alerts.filter(a => a.status === 'Active' && a._source !== 'lineTools');
    const newSymbols = [...new Set(activeNonLineToolAlerts.map(a => a.symbol))].sort();
    const currentSymbols = alertSymbolsRef.current;

    // Only update ref if symbol list actually changed
    if (JSON.stringify(newSymbols) !== JSON.stringify(currentSymbols)) {
      alertSymbolsRef.current = newSymbols;
    }
  }, [alerts]);

  // Separate effect for WebSocket - only reconnects when symbols actually change
  const [alertWsSymbols, setAlertWsSymbols] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentSymbols = alertSymbolsRef.current;
      if (JSON.stringify(currentSymbols) !== JSON.stringify(alertWsSymbols)) {
        setAlertWsSymbols([...currentSymbols]);
      }
    }, 1000); // Check every second instead of on every alert change

    return () => clearInterval(interval);
  }, [alertWsSymbols]);

  useEffect(() => {
    if (alertWsSymbols.length === 0) return;

    const ws = subscribeToMultiTicker(alertWsSymbols, (ticker) => {
      setAlerts(prevAlerts => {
        let hasChanges = false;
        const newAlerts = prevAlerts.map(alert => {
          if (alert._source === 'lineTools') return alert; // never auto-trigger plugin alerts
          if (alert.status !== 'Active' || alert.symbol !== ticker.symbol) return alert;

          const currentPrice = parseFloat(ticker.last);
          const targetPrice = parseFloat(alert.price);
          if (!Number.isFinite(currentPrice) || !Number.isFinite(targetPrice) || targetPrice === 0) return alert;

          // Simple crossing logic (triggered if price is within 0.1% range)
          const threshold = targetPrice * 0.001; // 0.1% tolerance

          if (Math.abs(currentPrice - targetPrice) <= threshold) {
            hasChanges = true;

            const displayPrice = formatPrice(targetPrice);

            // Log the alert
            const logEntry = {
              id: Date.now(),
              alertId: alert.id,
              symbol: alert.symbol,
              message: `Alert triggered: ${alert.symbol} crossed ${displayPrice}`,
              time: new Date().toISOString()
            };
            setAlertLogs(prev => [logEntry, ...prev]);
            setUnreadAlertCount(prev => prev + 1);
            showToast(`Alert Triggered: ${alert.symbol} at ${displayPrice}`, 'info');

            return { ...alert, status: 'Triggered' };
          }
          return alert;
        });

        return hasChanges ? newAlerts : prevAlerts;
      });
    });

    return () => {
      if (ws) ws.close();
    };
  }, [alertWsSymbols]);

  const handleWatchlistReorder = (newSymbols) => {
    setWatchlistSymbols(newSymbols);
    // Optimistically update data order to prevent flicker
    setWatchlistData(prev => {
      const dataMap = new Map(prev.map(item => [item.symbol, item]));
      return newSymbols.map(sym => dataMap.get(sym)).filter(Boolean);
    });
  };

  const handleSymbolChange = (symbol) => {
    if (searchMode === 'switch') {
      setCharts(prev => prev.map(chart =>
        chart.id === activeChartId ? { ...chart, symbol: symbol } : chart
      ));
    } else if (searchMode === 'compare') {
      const colors = ['#f57f17', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5'];
      setCharts(prev => prev.map(chart => {
        if (chart.id === activeChartId) {
          const currentComparisons = chart.comparisonSymbols || [];
          const exists = currentComparisons.find(c => c.symbol === symbol);

          if (exists) {
            // Remove
            return {
              ...chart,
              comparisonSymbols: currentComparisons.filter(c => c.symbol !== symbol)
            };
          } else {
            // Add
            const nextColor = colors[currentComparisons.length % colors.length];
            return {
              ...chart,
              comparisonSymbols: [
                ...currentComparisons,
                { symbol: symbol, color: nextColor }
              ]
            };
          }
        }
        return chart;
      }));
      // Do not close search in compare mode to allow multiple selections
    } else {
      if (!watchlistSymbols.includes(symbol)) {
        setWatchlistSymbols(prev => [...prev, symbol]);
        showToast(`${symbol} added to watchlist`, 'success');
      }
      setIsSearchOpen(false);
    }
  };

  const handleRemoveFromWatchlist = (symbol) => {
    setWatchlistSymbols(prev => prev.filter(s => s !== symbol));
  };

  const handleAddClick = () => {
    setSearchMode('add');
    setIsSearchOpen(true);
  };

  const handleSymbolClick = () => {
    setSearchMode('switch');
    setIsSearchOpen(true);
  };

  const handleCompareClick = () => {
    setSearchMode('compare');
    setIsSearchOpen(true);
  };

  const toggleIndicator = (name) => {
    setCharts(prev => prev.map(chart =>
      chart.id === activeChartId ? { ...chart, indicators: { ...chart.indicators, [name]: !chart.indicators[name] } } : chart
    ));
  };

  const [activeTool, setActiveTool] = useState(null);
  const [isMagnetMode, setIsMagnetMode] = useState(false);
  const [showDrawingToolbar, setShowDrawingToolbar] = useState(true);
  const [isReplayMode, setIsReplayMode] = useState(false);
  const [isDrawingsLocked, setIsDrawingsLocked] = useState(false);
  const [isDrawingsHidden, setIsDrawingsHidden] = useState(false);
  const [isTimerVisible, setIsTimerVisible] = useState(false);

  const toggleDrawingToolbar = () => {
    setShowDrawingToolbar(prev => !prev);
  };

  const handleToolChange = (tool) => {
    if (tool === 'magnet') {
      setIsMagnetMode(prev => !prev);
    } else if (tool === 'undo') {
      const activeRef = chartRefs.current[activeChartId];
      if (activeRef) {
        activeRef.undo();
      }
      setActiveTool(null); // Reset active tool after undo
    } else if (tool === 'redo') {
      const activeRef = chartRefs.current[activeChartId];
      if (activeRef) {
        activeRef.redo();
      }
      setActiveTool(null); // Reset active tool after redo
    } else if (tool === 'clear') { // Renamed from 'remove' to 'clear' based on new logic
      const activeRef = chartRefs.current[activeChartId];
      if (activeRef) {
        activeRef.clearTools();
      }
      setActiveTool(null); // Reset active tool after clear
    } else if (tool === 'clear_all') { // Clear All Drawings button
      const activeRef = chartRefs.current[activeChartId];
      if (activeRef) {
        activeRef.clearTools();
      }
      setIsDrawingsHidden(false); // Reset hidden state when all cleared
      setIsDrawingsLocked(false); // Reset locked state when all cleared
      setActiveTool(null); // Reset active tool after clearing all
    } else if (tool === 'lock_all') { // Lock All Drawings toggle
      setIsDrawingsLocked(prev => !prev);
      setActiveTool(tool); // Pass to ChartComponent to call toggleDrawingsLock
    } else if (tool === 'hide_drawings') { // Hide All Drawings toggle
      setIsDrawingsHidden(prev => !prev);
      setActiveTool(tool); // Pass to ChartComponent to call toggleDrawingsVisibility
    } else if (tool === 'show_timer') { // Show Timer toggle
      setIsTimerVisible(prev => !prev);
      setActiveTool(tool); // Pass to ChartComponent to toggle timer visibility
    } else {
      setActiveTool(tool);
    }
  };

  const handleToolUsed = React.useCallback(() => {
    setActiveTool(null);
  }, []);

  // const chartComponentRef = React.useRef(null); // Removed in favor of chartRefs

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
    const count = parseInt(newLayout);
    setCharts(prev => {
      const newCharts = [...prev];
      if (newCharts.length < count) {
        // Add charts
        for (let i = newCharts.length; i < count; i++) {
          newCharts.push({
            id: i + 1,
            symbol: activeChart.symbol,
            interval: activeChart.interval,
            indicators: { sma: false, ema: false },
            comparisonSymbols: []
          });
        }
      } else if (newCharts.length > count) {
        // Remove charts
        newCharts.splice(count);
      }
      return newCharts;
    });
    // Ensure active chart is valid
    if (activeChartId > count) {
      setActiveChartId(1);
    }
  };

  const handleSaveLayout = () => {
    const layoutData = {
      layout,
      charts
    };
    try {
      localStorage.setItem('tv_saved_layout', JSON.stringify(layoutData));
      showSnapshotToast('Layout saved successfully');
    } catch (error) {
      console.error('Failed to save layout:', error);
      showToast('Failed to save layout', 'error');
    }
  };

  // handleUndo and handleRedo are now integrated into handleToolChange, but we need wrappers for Topbar
  const handleUndo = () => handleToolChange('undo');
  const handleRedo = () => handleToolChange('redo');

  const handleDownloadImage = async () => {
    const activeRef = chartRefs.current[activeChartId];
    if (activeRef) {
      const chartContainer = activeRef.getChartContainer();
      if (chartContainer) {
        try {
          const canvas = await html2canvas(chartContainer, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#131722', // Match chart background
          });

          const image = canvas.toDataURL('image/png');
          const link = document.createElement('a');

          // Format filename: SYMBOL_YYYY-MM-DD_HH-MM-SS
          const now = new Date();
          const dateStr = now.toISOString().split('T')[0];
          const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
          const filename = `${currentSymbol}_${dateStr}_${timeStr}.png`;

          link.href = image;
          link.download = filename;
          link.click();
        } catch (error) {
          console.error('Screenshot failed:', error);
          showToast('Failed to download image', 'error');
        }
      }
    }
  };

  const handleCopyImage = async () => {
    const activeRef = chartRefs.current[activeChartId];
    if (activeRef) {
      const chartContainer = activeRef.getChartContainer();
      if (chartContainer) {
        try {
          const canvas = await html2canvas(chartContainer, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#131722', // Match chart background
          });

          canvas.toBlob(async (blob) => {
            try {
              await navigator.clipboard.write([
                new ClipboardItem({
                  'image/png': blob
                })
              ]);
              showSnapshotToast('Link to the chart image copied to clipboard');
            } catch (err) {
              console.error('Failed to copy to clipboard:', err);
              showToast('Failed to copy to clipboard', 'error');
            }
          });
        } catch (error) {
          console.error('Screenshot failed:', error);
          showToast('Failed to capture image', 'error');
        }
      }
    }
  };

  const handleFullScreen = () => {
    const activeRef = chartRefs.current[activeChartId];
    if (activeRef) {
      const chartContainer = activeRef.getChartContainer();
      if (chartContainer) {
        if (chartContainer.requestFullscreen) {
          chartContainer.requestFullscreen();
        } else if (chartContainer.webkitRequestFullscreen) { /* Safari */
          chartContainer.webkitRequestFullscreen();
        } else if (chartContainer.msRequestFullscreen) { /* IE11 */
          chartContainer.msRequestFullscreen();
        }
      }
    }
  };


  const handleReplayClick = () => {
    const activeRef = chartRefs.current[activeChartId];
    if (activeRef) {
      activeRef.toggleReplay();
    }
  };

  const handleReplayModeChange = (chartId, isActive) => {
    // Only track active chart's replay mode for the topbar toggle
    if (chartId === activeChartId) {
      setIsReplayMode(isActive);
    }
  };

  const handleAlertClick = () => {
    const activeRef = chartRefs.current[activeChartId];
    if (activeRef) {
      const price = activeRef.getCurrentPrice();
      if (price !== null) {
        setAlertPrice(price);
        setIsAlertOpen(true);
      } else {
        showToast('No price data available', 'error');
      }
    }
  };

  const handleSaveAlert = (alertData) => {
    const priceDisplay = formatPrice(alertData.value);

    const newAlert = {
      id: Date.now(),
      symbol: currentSymbol,
      price: priceDisplay,
      condition: `Crossing ${priceDisplay}`,
      status: 'Active',
      created_at: new Date().toISOString(),
    };

    // Add alert to state so it appears in the Alerts panel
    setAlerts(prev => [...prev, newAlert]);

    // Show toast with formatted price
    showToast(`Alert created for ${currentSymbol} at ${priceDisplay}`, 'success');

    // Also create a visual alert on the active chart via the line-tools alerts primitive
    const activeRef = chartRefs.current[activeChartId];
    if (activeRef && typeof activeRef.addPriceAlert === 'function') {
      activeRef.addPriceAlert(newAlert);
    }
  };

  const handleRemoveAlert = (id) => {
    setAlerts(prev => {
      const target = prev.find(a => a.id === id);

      // If this alert came from the chart-side line-tools primitive, also
      // remove it from the chart so the marker disappears.
      if (target && target._source === 'lineTools' && target.chartId != null && target.externalId) {
        const chartRef = chartRefs.current[target.chartId];
        if (chartRef && typeof chartRef.removePriceAlert === 'function') {
          chartRef.removePriceAlert(target.externalId);
        }
      }

      return prev.filter(a => a.id !== id);
    });
  };

  const handleRestartAlert = (id) => {
    // Find the alert first (outside setAlerts to access chartRefs)
    const target = alerts.find(a => a.id === id);
    if (!target) return;

    // Extract original condition from the alert's condition string
    let originalCondition = 'crossing';
    if (target.condition) {
      const condLower = target.condition.toLowerCase();
      if (condLower.includes('crossing_down') || condLower.includes('crossing down')) {
        originalCondition = 'crossing_down';
      } else if (condLower.includes('crossing_up') || condLower.includes('crossing up')) {
        originalCondition = 'crossing_up';
      }
    }

    // Store the alert ID that is being resumed (sync will update its externalId)
    skipNextSyncRef.current = { type: 'resume', alertId: id, chartId: target.chartId };

    // Add alert back to chart
    if (target._source === 'lineTools' && target.chartId != null) {
      const chartRef = chartRefs.current[target.chartId];
      if (chartRef && typeof chartRef.restartPriceAlert === 'function') {
        chartRef.restartPriceAlert(target.price, originalCondition);
      }
    }

    // Update status to Active (keep same ID)
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Active' } : a));
  };

  const handlePauseAlert = (id) => {
    const target = alerts.find(a => a.id === id);
    if (!target) return;

    // Set flag to skip next sync (prevents the alert from being deleted)
    skipNextSyncRef.current = { type: 'pause' };

    // Remove the visual alert from the chart
    if (target._source === 'lineTools' && target.chartId != null && target.externalId) {
      const chartRef = chartRefs.current[target.chartId];
      if (chartRef && typeof chartRef.removePriceAlert === 'function') {
        chartRef.removePriceAlert(target.externalId);
      }
    }

    // Update status to Paused
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Paused' } : a));
  };

  const handleChartAlertsSync = (chartId, symbol, chartAlerts) => {
    const syncInfo = skipNextSyncRef.current;

    // If pausing, skip sync entirely (preserve paused alert in state)
    if (syncInfo && syncInfo.type === 'pause') {
      skipNextSyncRef.current = null;
      return;
    }

    // If resuming, update the externalId of the resumed alert AND set status to Active
    if (syncInfo && syncInfo.type === 'resume' && syncInfo.chartId === chartId) {
      skipNextSyncRef.current = null;

      // Find the new chart alert that was just created
      const existingForChart = alerts.filter(a => a._source === 'lineTools' && a.chartId === chartId && a.status === 'Active');
      const existingExternalIds = new Set(existingForChart.map(a => a.externalId));
      const newChartAlert = (chartAlerts || []).find(a => !existingExternalIds.has(a.id));

      if (newChartAlert) {
        // Update the resumed alert with the new externalId AND ensure status is Active
        setAlerts(prev => prev.map(a =>
          a.id === syncInfo.alertId ? { ...a, externalId: newChartAlert.id, status: 'Active' } : a
        ));
      }
      return;
    }

    setAlerts(prev => {
      // Create a set of chart alert externalIds
      const chartAlertIds = new Set((chartAlerts || []).map(a => a.id));

      // Track existing alerts for this chart
      const existingForChart = prev.filter(a => a._source === 'lineTools' && a.chartId === chartId);
      const existingExternalIds = new Set(existingForChart.map(a => a.externalId));

      // Keep alerts that:
      // - Are NOT lineTools for this chart
      // - Are Triggered or Paused
      // - Are Active and still exist in chart
      const remaining = prev.filter(a => {
        if (a._source !== 'lineTools' || a.chartId !== chartId) return true;
        if (a.status === 'Triggered' || a.status === 'Paused') return true;
        return chartAlertIds.has(a.externalId);
      });

      // Find NEW chart alerts (not in existing externalIds)
      const newChartAlerts = (chartAlerts || []).filter(a => !existingExternalIds.has(a.id));

      // Create entries for truly new alerts
      const newMapped = newChartAlerts.map(a => {
        const priceDisplay = formatPrice(a.price);

        // Format condition display
        let conditionDisplay = `Crossing ${priceDisplay}`;
        if (a.condition === 'crossing_up') {
          conditionDisplay = `Crossing Up ${priceDisplay}`;
        } else if (a.condition === 'crossing_down') {
          conditionDisplay = `Crossing Down ${priceDisplay}`;
        } else if (a.condition && a.condition !== 'crossing') {
          conditionDisplay = a.condition;
        }

        showToast(`Alert created for ${symbol} at ${priceDisplay}`, 'success');

        return {
          id: `lt-${chartId}-${a.id}`,
          externalId: a.id,
          symbol,
          price: priceDisplay,
          condition: conditionDisplay,
          status: 'Active',
          created_at: new Date().toISOString(),
          _source: 'lineTools',
          chartId,
        };
      });

      return [...remaining, ...newMapped];
    });
  };

  const handleChartAlertTriggered = (chartId, symbol, evt) => {
    const displayPrice = formatPrice(evt.price ?? evt.alertPrice);
    const timestamp = evt.timestamp ? new Date(evt.timestamp).toISOString() : new Date().toISOString();

    // Log entry for the Logs tab
    const logEntry = {
      id: Date.now(),
      alertId: evt.externalId || evt.alertId,
      symbol,
      message: `Alert triggered: ${symbol} crossed ${displayPrice}`,
      time: timestamp,
    };
    setAlertLogs(prev => [logEntry, ...prev]);
    setUnreadAlertCount(prev => prev + 1);
    showToast(`Alert Triggered: ${symbol} at ${displayPrice}`, 'info');

    // Mark corresponding alert as Triggered in the Alerts tab, or add a new history row
    setAlerts(prev => {
      let updated = false;
      const next = prev.map(a => {
        if (a._source === 'lineTools' && a.chartId === chartId && a.externalId === (evt.externalId || evt.alertId)) {
          updated = true;
          return { ...a, status: 'Triggered' };
        }
        return a;
      });

      if (!updated) {
        next.unshift({
          id: `lt-${chartId}-${evt.externalId || evt.alertId}-triggered-${Date.now()}`,
          externalId: evt.externalId || evt.alertId,
          symbol,
          price: displayPrice,
          condition: evt.condition || `Crossing ${displayPrice}`,
          status: 'Triggered',
          created_at: timestamp,
          _source: 'lineTools',
          chartId,
        });
      }

      return next;
    });
  };

  const handleRightPanelToggle = (panel) => {
    setActiveRightPanel(panel);
    if (panel === 'alerts') {
      setUnreadAlertCount(0); // Clear badge when opening alerts
    }
  };

  return (
    <>
      <Layout
        isLeftToolbarVisible={showDrawingToolbar}
        topbar={
          <Topbar
            symbol={currentSymbol}
            interval={currentInterval}
            chartType={chartType}
            indicators={activeChart.indicators}
            favoriteIntervals={favoriteIntervals}
            customIntervals={customIntervals}
            lastNonFavoriteInterval={lastNonFavoriteInterval}
            onSymbolClick={handleSymbolClick}
            onIntervalChange={handleIntervalChange}
            onChartTypeChange={setChartType}
            onToggleIndicator={toggleIndicator}
            onToggleFavorite={handleToggleFavorite}
            onAddCustomInterval={handleAddCustomInterval}
            onRemoveCustomInterval={handleRemoveCustomInterval}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onMenuClick={toggleDrawingToolbar}
            theme={theme}
            onToggleTheme={toggleTheme}
            onDownloadImage={handleDownloadImage}
            onCopyImage={handleCopyImage}
            onFullScreen={handleFullScreen}
            onReplayClick={handleReplayClick}
            isReplayMode={isReplayMode}
            onAlertClick={handleAlertClick}
            onCompareClick={handleCompareClick}
            layout={layout}
            onLayoutChange={handleLayoutChange}
            onSaveLayout={handleSaveLayout}
          />
        }
        leftToolbar={
          <DrawingToolbar
            activeTool={activeTool}
            isMagnetMode={isMagnetMode}
            onToolChange={handleToolChange}
            isDrawingsLocked={isDrawingsLocked}
            isDrawingsHidden={isDrawingsHidden}
            isTimerVisible={isTimerVisible}
          />
        }
        bottomBar={
          <BottomBar
            currentTimeRange={currentTimeRange}
            onTimeRangeChange={(range, interval) => {
              setCurrentTimeRange(range);
              if (interval) {
                handleIntervalChange(interval);
              }
            }}
            isLogScale={isLogScale}
            isAutoScale={isAutoScale}
            onToggleLogScale={() => setIsLogScale(!isLogScale)}
            onToggleAutoScale={() => setIsAutoScale(!isAutoScale)}
            onResetZoom={() => {
              const activeRef = chartRefs.current[activeChartId];
              if (activeRef) {
                activeRef.resetZoom();
              }
            }}
            isToolbarVisible={showDrawingToolbar}
          />
        }
        watchlist={
          activeRightPanel === 'watchlist' ? (
            <Watchlist
              currentSymbol={currentSymbol}
              items={watchlistData}
              onSymbolSelect={(sym) => {
                setCharts(prev => prev.map(chart =>
                  chart.id === activeChartId ? { ...chart, symbol: sym } : chart
                ));
              }}
              onAddClick={handleAddClick}
              onRemoveClick={handleRemoveFromWatchlist}
              onReorder={handleWatchlistReorder}
            />
          ) : activeRightPanel === 'alerts' ? (
            <AlertsPanel
              alerts={alerts}
              logs={alertLogs}
              onRemoveAlert={handleRemoveAlert}
              onRestartAlert={handleRestartAlert}
              onPauseAlert={handlePauseAlert}
            />
          ) : null
        }
        rightToolbar={
          <RightToolbar
            activePanel={activeRightPanel}
            onPanelChange={handleRightPanelToggle}
            badges={{ alerts: unreadAlertCount }}
          />
        }
        chart={
          <ChartGrid
            charts={charts}
            layout={layout}
            activeChartId={activeChartId}
            onActiveChartChange={setActiveChartId}
            chartRefs={chartRefs}
            onAlertsSync={handleChartAlertsSync}
            onAlertTriggered={handleChartAlertTriggered}
            onReplayModeChange={handleReplayModeChange}
            // Common props
            chartType={chartType}
            // indicators={indicators} // Handled per chart now
            activeTool={activeTool}
            onToolUsed={handleToolUsed}
            isLogScale={isLogScale}
            isAutoScale={isAutoScale}
            magnetMode={isMagnetMode}
            timeRange={currentTimeRange}
            isToolbarVisible={showDrawingToolbar}
            theme={theme}
            isDrawingsLocked={isDrawingsLocked}
            isDrawingsHidden={isDrawingsHidden}
            isTimerVisible={isTimerVisible}
          />
        }
      />
      <SymbolSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={handleSymbolChange}
        addedSymbols={searchMode === 'compare' ? (activeChart.comparisonSymbols || []).map(s => s.symbol) : []}
        isCompareMode={searchMode === 'compare'}
      />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {snapshotToast && (
        <SnapshotToast
          message={snapshotToast}
          onClose={() => setSnapshotToast(null)}
        />
      )}
      <AlertDialog
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onSave={handleSaveAlert}
        initialPrice={alertPrice}
        theme={theme}
      />
    </>
  );
}

export default App;
