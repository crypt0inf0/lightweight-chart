const createManagedWebSocket = (urlBuilder, attachHandlers) => {
    let socket = null;
    let manualClose = false;
    let reconnectAttempts = 0;
    const maxAttempts = 5;

    const connect = () => {
        const url = typeof urlBuilder === 'function' ? urlBuilder() : urlBuilder;
        try {
            socket = new WebSocket(url);
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
            return;
        }

        attachHandlers(socket);

        socket.onopen = () => {
            reconnectAttempts = 0;
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        socket.onclose = (event) => {
            if (manualClose) return;
            if (!event.wasClean && reconnectAttempts < maxAttempts) {
                const delay = Math.min(1000 * 2 ** reconnectAttempts, 10000);
                reconnectAttempts += 1;
                setTimeout(connect, delay);
            }
        };
    };

    connect();

    return {
        close: () => {
            manualClose = true;
            if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
                socket.close();
            }
        },
        get readyState() {
            return socket ? socket.readyState : WebSocket.CLOSED;
        }
    };
};

export const getKlines = async (symbol, interval = '1d', limit = 1000, signal) => {
    const safeLimit = Number.isFinite(limit) ? limit : 1000;
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${safeLimit}`;
    try {
        const response = await fetch(url, { signal });
        if (!response.ok) {
            throw new Error(`Binance klines error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
            return [];
        }
        return data.map(d => ({
            time: d[0] / 1000,
            open: parseFloat(d[1]),
            high: parseFloat(d[2]),
            low: parseFloat(d[3]),
            close: parseFloat(d[4]),
        })).filter(candle =>
            [candle.open, candle.high, candle.low, candle.close].every(value => Number.isFinite(value))
        );
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Error fetching klines:', error);
        }
        return [];
    }
};

export const getTickerPrice = async (symbol, signal) => {
    try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`, { signal });
        if (!response.ok) {
            throw new Error(`Binance ticker error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error("Error fetching ticker price:", error);
        }
        return null;
    }
};

export const subscribeToTicker = (symbol, interval, callback) => {
    return createManagedWebSocket(() => `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`, (socket) => {
        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (!message || !message.k) return;

                const kline = message.k;
                const candle = {
                    time: kline.t / 1000,
                    open: parseFloat(kline.o),
                    high: parseFloat(kline.h),
                    low: parseFloat(kline.l),
                    close: parseFloat(kline.c),
                };
                callback(candle);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };
    });
};

export const subscribeToMultiTicker = (symbols, callback) => {
    if (!symbols || symbols.length === 0) return null;

    const streamPath = symbols.map(s => `${s.toLowerCase()}@miniTicker`).join('/');
    return createManagedWebSocket(() => `wss://stream.binance.com:9443/stream?streams=${streamPath}`, (socket) => {
        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (!message || !message.data) return;

                const ticker = message.data;
                const data = {
                    symbol: ticker.s,
                    last: parseFloat(ticker.c),
                    open: parseFloat(ticker.o),
                    chg: parseFloat(ticker.c) - parseFloat(ticker.o),
                    chgP: ((parseFloat(ticker.c) - parseFloat(ticker.o)) / parseFloat(ticker.o)) * 100
                };
                callback(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };
    });
};
