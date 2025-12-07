import React from 'react';
import styles from './ChartGrid.module.css';
import ChartComponent from './ChartComponent';

const ChartGrid = ({
    charts,
    layout,
    activeChartId,
    onActiveChartChange,
    chartRefs,
    onAlertsSync,
    onAlertTriggered,
    ...chartProps
}) => {
    const getGridClass = () => {
        switch (layout) {
            case '2': return styles.grid2;
            case '3': return styles.grid3;
            case '4': return styles.grid4;
            default: return styles.grid1;
        }
    };

    return (
        <div className={`${styles.gridContainer} ${getGridClass()}`}>
            {charts.map((chart) => (
                <div
                    key={chart.id}
                    className={`${styles.chartWrapper} ${activeChartId === chart.id && layout !== '1' ? styles.active : ''}`}
                    onClick={() => onActiveChartChange(chart.id)}
                >
                    <ChartComponent
                        ref={(el) => {
                            if (chartRefs.current) {
                                chartRefs.current[chart.id] = el;
                            }
                        }}
                        symbol={chart.symbol}
                        interval={chart.interval}
                        onAlertsSync={onAlertsSync ? (alerts) => onAlertsSync(chart.id, chart.symbol, alerts) : undefined}
                        onAlertTriggered={onAlertTriggered ? (evt) => onAlertTriggered(chart.id, chart.symbol, evt) : undefined}
                        {...chartProps}
                        indicators={chart.indicators}
                        comparisonSymbols={chart.comparisonSymbols}
                    // Override props that might be specific to the chart state if needed
                    // symbol/interval/indicators are per-chart.
                    />
                </div>
            ))}
        </div>
    );
};

export default ChartGrid;
