import React from 'react';
import styles from './BottomBar.module.css';
import classNames from 'classnames';
import { Settings } from 'lucide-react';

const BottomBar = ({
    onTimeRangeChange,
    currentTimeRange,
    timezone = 'UTC+5:30',
    isLogScale,
    isAutoScale,
    onToggleLogScale,
    onToggleAutoScale,
    onResetZoom,
    isToolbarVisible = true
}) => {
    // Each time range has an associated interval for the candles
    // 1D = 1 minute intervals, 5D = 5 minute intervals, etc.
    const timeRanges = [
        { label: '1D', value: '1D', interval: '1m' },
        { label: '5D', value: '5D', interval: '5m' },
        { label: '1M', value: '1M', interval: '30m' },
        { label: '3M', value: '3M', interval: '1h' },
        { label: '6M', value: '6M', interval: '4h' },
        { label: 'YTD', value: 'YTD', interval: '1d' },
        { label: '1Y', value: '1Y', interval: '1d' },
        { label: '5Y', value: '5Y', interval: '1w' },
        { label: 'All', value: 'All', interval: '1d' },
    ];

    return (
        <div
            className={classNames(styles.bottomBar, {
                [styles.withLeftToolbar]: isToolbarVisible,
            })}
        >
            <div className={styles.leftSection}>
                {timeRanges.map((range) => (
                    <div
                        key={range.value}
                        className={classNames(styles.timeRangeItem, {
                            [styles.active]: currentTimeRange === range.value
                        })}
                        onClick={() => onTimeRangeChange && onTimeRangeChange(range.value, range.interval)}
                    >
                        {range.label}
                    </div>
                ))}
            </div>

            <div className={styles.rightSection}>
                <div className={styles.item}>
                    <span className={styles.timezone}>{timezone}</span>
                </div>
                <div className={styles.separator} />
                <div
                    className={classNames(styles.item, styles.actionItem, { [styles.active]: isLogScale })}
                    onClick={onToggleLogScale}
                >
                    log
                </div>
                <div
                    className={classNames(styles.item, styles.actionItem, { [styles.active]: isAutoScale })}
                    onClick={onToggleAutoScale}
                >
                    auto
                </div>
                <div
                    className={classNames(styles.item, styles.actionItem)}
                    onClick={onResetZoom}
                    title="Reset Chart View"
                >
                    reset
                </div>
            </div>
        </div>
    );
};

export default BottomBar;
