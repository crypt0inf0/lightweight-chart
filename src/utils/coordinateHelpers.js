// Shared coordinate conversion to avoid duplication
export function pointToCoordinate(point, chart, series) {
    if (!point) return { x: null, y: null };
    const timeScale = chart.timeScale();
    return {
        x: timeScale.logicalToCoordinate(point.logical),
        y: series.priceToCoordinate(point.price),
    };
}

export function timeToLogical(point, chart) {
    const timeScale = chart.timeScale();
    const logical = timeScale.timeToCoordinate(point.time);
    return { logical, price: point.price };
}

// Shared anchor drawing
export function drawAnchor(ctx, x, y, scope, options = {}) {
    const radius = (options.radius || 6) * scope.horizontalPixelRatio;
    const fillColor = options.fillColor || '#FFFFFF';
    const strokeColor = options.strokeColor || '#2962FF';
    const lineWidth = options.lineWidth || 2;

    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}
