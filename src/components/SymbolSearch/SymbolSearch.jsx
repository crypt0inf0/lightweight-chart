import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Check } from 'lucide-react';
import styles from './SymbolSearch.module.css';

const SymbolSearch = ({ isOpen, onClose, onSelect, addedSymbols = [], isCompareMode = false }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [symbols, setSymbols] = useState([]);

    useEffect(() => {
        let mounted = true;
        const abortController = new AbortController();

        if (isOpen && symbols.length === 0) {
            fetch('https://api.binance.com/api/v3/exchangeInfo', {
                signal: abortController.signal
            })
                .then(res => res.json())
                .then(data => {
                    if (!mounted) return;
                    const pairs = data.symbols
                        .filter(s => s.status === 'TRADING')
                        .map(s => ({
                            symbol: s.symbol,
                            base: s.baseAsset,
                            quote: s.quoteAsset,
                        }));
                    setSymbols(pairs);
                })
                .catch(err => {
                    if (err.name !== 'AbortError') {
                        console.error('Error fetching symbols:', err);
                    }
                });
        }

        return () => {
            mounted = false;
            abortController.abort();
        };
    }, [isOpen, symbols.length]);

    const filteredSymbols = useMemo(() => {
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            return symbols.filter(s =>
                s.symbol.toLowerCase().includes(lower) ||
                s.base.toLowerCase().includes(lower)
            ).slice(0, 50);
        }
        return symbols.slice(0, 50);
    }, [searchTerm, symbols]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div className={styles.searchContainer}>
                        <Search size={20} className={styles.searchIcon} />
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="Symbol Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                        {searchTerm && (
                            <X
                                size={16}
                                className={styles.clearIcon}
                                onClick={() => setSearchTerm('')}
                            />
                        )}
                    </div>
                    <div className={styles.closeBtn} onClick={onClose}>
                        <X size={24} />
                    </div>
                </div>

                <div className={styles.listHeader}>
                    <span className={styles.colSymbol}>Symbol</span>
                    <span className={styles.colDesc}>Description</span>
                    <span className={styles.colExch}>Exchange</span>
                </div>

                <div className={styles.list}>
                    {filteredSymbols.map(s => (
                        <div
                            key={s.symbol}
                            className={styles.item}
                            onClick={() => {
                                onSelect(s.symbol);
                                if (!isCompareMode) {
                                    onClose();
                                }
                            }}
                        >
                            <div className={styles.itemSymbol}>
                                <span className={styles.base}>{s.base}</span>
                                <span className={styles.quote}>{s.quote}</span>
                            </div>
                            <div className={styles.itemDesc}>{s.base} / {s.quote}</div>
                            <div className={styles.itemExch}>BINANCE</div>
                            {addedSymbols.includes(s.symbol) && (
                                <div className={styles.checkIcon}>
                                    <Check size={16} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SymbolSearch;
