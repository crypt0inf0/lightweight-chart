export const intervalToSeconds = (interval) => {
    if (!interval || typeof interval !== 'string') {
        return 60;
    }

    const trimmed = interval.trim();
    const unit = trimmed.slice(-1);
    const value = parseFloat(trimmed.slice(0, -1));

    if (Number.isNaN(value) || value <= 0) {
        return 60;
    }

    const multiplierMap = {
        m: 60,
        h: 3600,
        d: 86400,
        w: 604800,
        M: 2592000, // Binance months are calendar months, approximate as 30 days
    };

    const normalizedUnit = multiplierMap[unit] ? unit : unit.toLowerCase();
    const multiplier = multiplierMap[normalizedUnit] ?? 60;

    return value * multiplier;
};

