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
    const timeRanges = [
        { label: '1D', value: '1D' },
        { label: '5D', value: '5D' },
        { label: '1M', value: '1M' },
        { label: '3M', value: '3M' },
        { label: '6M', value: '6M' },
        { label: 'YTD', value: 'YTD' },
        { label: '1Y', value: '1Y' },
        { label: '5Y', value: '5Y' },
        { label: 'All', value: 'All' },
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
                        onClick={() => onTimeRangeChange && onTimeRangeChange(range.value)}
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
