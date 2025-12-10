import React, { useState } from 'react';
import { X, Bell, Trash2, PlayCircle, PauseCircle, Clock } from 'lucide-react';
import styles from './AlertsPanel.module.css';
import classNames from 'classnames';

const AlertsPanel = ({ alerts, logs, onRemoveAlert, onRestartAlert, onPauseAlert }) => {
    const [activeTab, setActiveTab] = useState('alerts');

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <span className={styles.title}>Alerts</span>
                <div className={styles.actions}>
                    {/* Add actions if needed */}
                </div>
            </div>

            <div className={styles.tabs}>
                <div
                    className={classNames(styles.tab, { [styles.activeTab]: activeTab === 'alerts' })}
                    onClick={() => setActiveTab('alerts')}
                >
                    Alerts
                </div>
                <div
                    className={classNames(styles.tab, { [styles.activeTab]: activeTab === 'log' })}
                    onClick={() => setActiveTab('log')}
                >
                    Log
                    {logs.length > 0 && <span className={styles.logCount}>{logs.length}</span>}
                </div>
            </div>

            <div className={styles.content}>
                {activeTab === 'alerts' ? (
                    <div className={styles.list}>
                        {alerts.length === 0 ? (
                            <div className={styles.emptyState}>No active alerts</div>
                        ) : (
                            alerts.map(alert => {
                                // Normalize status so we always show a readable label
                                const status = alert.status || 'Active';
                                const statusKey = status.toLowerCase();

                                return (
                                    <div key={alert.id} className={classNames(styles.item, styles[statusKey])}>
                                        <div className={styles.itemHeader}>
                                            <span className={styles.symbol}>{alert.symbol}</span>
                                            <span className={classNames(styles.status, styles[statusKey])}>
                                                {status}
                                            </span>
                                        </div>
                                        <div className={styles.condition}>
                                            {alert.condition}
                                        </div>
                                        <div className={styles.itemFooter}>
                                            <span className={styles.time}>
                                                {new Date(alert.created_at).toLocaleDateString()} {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                            <div className={styles.itemActions}>
                                                {status === 'Active' && (
                                                    <PauseCircle
                                                        size={16}
                                                        className={styles.actionIcon}
                                                        onClick={() => onPauseAlert(alert.id)}
                                                        title="Pause Alert"
                                                    />
                                                )}
                                                {(status === 'Triggered' || status === 'Paused') && (
                                                    <PlayCircle
                                                        size={16}
                                                        className={styles.actionIcon}
                                                        onClick={() => onRestartAlert(alert.id)}
                                                        title="Resume Alert"
                                                    />
                                                )}
                                                <Trash2
                                                    size={16}
                                                    className={styles.actionIcon}
                                                    onClick={() => onRemoveAlert(alert.id)}
                                                    title="Remove Alert"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                ) : (
                    <div className={styles.list}>
                        {logs.length === 0 ? (
                            <div className={styles.emptyState}>No logs</div>
                        ) : (
                            logs.map(log => (
                                <div key={log.id} className={styles.logItem}>
                                    <div className={styles.logHeader}>
                                        <span className={styles.symbol}>{log.symbol}</span>
                                        <span className={styles.time}>{new Date(log.time).toLocaleTimeString()}</span>
                                    </div>
                                    <div className={styles.message}>
                                        {log.message}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlertsPanel;
