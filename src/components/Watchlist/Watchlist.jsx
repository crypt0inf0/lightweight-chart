import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import styles from './Watchlist.module.css';
import classNames from 'classnames';

const DEFAULT_COLUMN_WIDTHS = {
    symbol: 80,
    last: 90,
    chg: 75,
    chgP: 70
};

const MIN_COLUMN_WIDTH = 40;

const Watchlist = ({ currentSymbol, items, onSymbolSelect, onAddClick, onRemoveClick, onReorder }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [columnWidths, setColumnWidths] = useState(DEFAULT_COLUMN_WIDTHS);
    const [resizing, setResizing] = useState(null);
    const startXRef = useRef(0);
    const startWidthRef = useRef(0);

    const handleResizeStart = useCallback((e, column) => {
        e.preventDefault();
        e.stopPropagation();
        setResizing(column);
        startXRef.current = e.clientX;
        startWidthRef.current = columnWidths[column];
    }, [columnWidths]);

    useEffect(() => {
        if (!resizing) return;

        const handleMouseMove = (e) => {
            const diff = e.clientX - startXRef.current;
            const newWidth = Math.max(MIN_COLUMN_WIDTH, startWidthRef.current + diff);
            setColumnWidths(prev => ({
                ...prev,
                [resizing]: newWidth
            }));
        };

        const handleMouseUp = () => {
            setResizing(null);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizing]);

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
        <div className={classNames(styles.watchlist, { [styles.isResizing]: resizing })}>
            <div className={styles.header}>
                <span className={styles.title}>Watchlist</span>
                <div className={styles.actions}>
                    <Plus size={16} className={styles.icon} onClick={onAddClick} />
                </div>
            </div>

            <div className={styles.columnHeaders}>
                <span
                    className={styles.colSymbol}
                    style={{ width: columnWidths.symbol, minWidth: columnWidths.symbol }}
                    onClick={() => handleSort('symbol')}
                >
                    Symbol {sortConfig.key === 'symbol' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </span>
                <div
                    className={styles.resizeHandle}
                    onMouseDown={(e) => handleResizeStart(e, 'symbol')}
                />
                <span
                    className={styles.colLast}
                    style={{ width: columnWidths.last, minWidth: MIN_COLUMN_WIDTH }}
                    onClick={() => handleSort('last')}
                >
                    Last {sortConfig.key === 'last' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </span>
                <div
                    className={styles.resizeHandle}
                    onMouseDown={(e) => handleResizeStart(e, 'last')}
                />
                <span
                    className={styles.colChg}
                    style={{ width: columnWidths.chg, minWidth: MIN_COLUMN_WIDTH }}
                    onClick={() => handleSort('chg')}
                >
                    Chg {sortConfig.key === 'chg' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </span>
                <div
                    className={styles.resizeHandle}
                    onMouseDown={(e) => handleResizeStart(e, 'chg')}
                />
                <span
                    className={styles.colChgP}
                    style={{ width: columnWidths.chgP, minWidth: MIN_COLUMN_WIDTH }}
                    onClick={() => handleSort('chgP')}
                >
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
                        <span
                            className={styles.symbolName}
                            style={{ width: columnWidths.symbol, minWidth: columnWidths.symbol }}
                        >
                            {item.symbol}
                        </span>
                        <span
                            className={classNames(styles.last, { [styles.up]: item.up, [styles.down]: !item.up })}
                            style={{ width: columnWidths.last, minWidth: MIN_COLUMN_WIDTH }}
                        >
                            {item.last}
                        </span>
                        <span
                            className={classNames(styles.chg, { [styles.up]: item.up, [styles.down]: !item.up })}
                            style={{ width: columnWidths.chg, minWidth: MIN_COLUMN_WIDTH }}
                        >
                            {item.chg}
                        </span>
                        <span
                            className={classNames(styles.chgP, { [styles.up]: item.up, [styles.down]: !item.up })}
                            style={{ width: columnWidths.chgP, minWidth: MIN_COLUMN_WIDTH }}
                        >
                            {item.chgP}
                        </span>
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
