import React, { useState, useMemo, useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import styles from './Watchlist.module.css';
import classNames from 'classnames';

const Watchlist = ({ currentSymbol, items, onSymbolSelect, onAddClick, onRemoveClick, onReorder }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [draggedIndex, setDraggedIndex] = useState(null);

    const handleSort = useCallback((key) => {
        let direction = 'asc';
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'asc') {
                direction = 'desc';
            } else {
                // Toggle to null (unsorted)
                setSortConfig({ key: null, direction: 'asc' });
                return;
            }
        }
        setSortConfig({ key, direction });
    }, [sortConfig]);

    const handleDragStart = useCallback((e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
        // Optional: set drag image or style
    }, []);

    const handleDragOver = useCallback((e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    }, []);

    const handleDrop = useCallback((e, dropIndex) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) return;

        const newItems = [...items];
        const [draggedItem] = newItems.splice(draggedIndex, 1);
        newItems.splice(dropIndex, 0, draggedItem);

        const newSymbols = newItems.map(item => item.symbol);
        if (onReorder) onReorder(newSymbols);
        setDraggedIndex(null);
    }, [draggedIndex, items, onReorder]);

    const sortedItems = useMemo(() => {
        if (!sortConfig.key) return items;

        return [...items].sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            if (['last', 'chg', 'chgP'].includes(sortConfig.key)) {
                aValue = parseFloat(aValue) || 0;
                bValue = parseFloat(bValue) || 0;
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [items, sortConfig]);

    return (
        <div className={styles.watchlist}>
            <div className={styles.header}>
                <span className={styles.title}>Watchlist</span>
                <div className={styles.actions}>
                    <Plus size={16} className={styles.icon} onClick={onAddClick} />
                </div>
            </div>

            <div className={styles.columnHeaders}>
                <span className={styles.colSymbol} onClick={() => handleSort('symbol')}>
                    Symbol {sortConfig.key === 'symbol' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </span>
                <span className={styles.colLast} onClick={() => handleSort('last')}>
                    Last {sortConfig.key === 'last' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </span>
                <span className={styles.colChg} onClick={() => handleSort('chg')}>
                    Chg {sortConfig.key === 'chg' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </span>
                <span className={styles.colChgP} onClick={() => handleSort('chgP')}>
                    Chg% {sortConfig.key === 'chgP' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </span>
            </div>

            <div className={styles.list}>
                {sortedItems.map((item, index) => (
                    <div
                        key={item.symbol}
                        className={classNames(styles.item, {
                            [styles.active]: currentSymbol === item.symbol,
                            [styles.dragging]: draggedIndex === index
                        })}
                        onClick={() => onSymbolSelect(item.symbol)}
                        draggable={!sortConfig.key}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                    >
                        <div className={styles.symbolInfo}>
                            <span className={styles.symbolName}>{item.symbol}</span>
                        </div>
                        <div className={classNames(styles.priceInfo, { [styles.up]: item.up, [styles.down]: !item.up })}>
                            <span className={styles.last}>{item.last}</span>
                            <span className={styles.chg}>{item.chg}</span>
                            <span className={styles.chgP}>{item.chgP}</span>
                        </div>
                        <div
                            className={styles.removeBtn}
                            onClick={(e) => { e.stopPropagation(); onRemoveClick(item.symbol); }}
                        >
                            <X size={12} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default React.memo(Watchlist);
