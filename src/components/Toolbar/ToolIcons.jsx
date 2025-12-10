// Official TradingView SVG icons
import React from 'react';
import PropTypes from 'prop-types';

const IconPropTypes = {
    size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    color: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object
};

export const TrendLineIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={size} height={size} {...props}>
        <g fill="currentColor" fillRule="nonzero">
            <path d="M7.354 21.354l14-14-.707-.707-14 14z"></path>
            <path d="M22.5 7c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM5.5 24c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
        </g>
    </svg>
);
TrendLineIcon.propTypes = IconPropTypes;

export const ArrowIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={size} height={size} {...props}>
        <g fill="currentColor">
            <path fillRule="nonzero" d="M7.354 21.354l14-14-.707-.707-14 14z"></path>
            <path d="M21 7l-8 3 5 5z"></path>
            <path fillRule="nonzero" d="M22.5 7c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM5.5 24c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
        </g>
    </svg>
);
ArrowIcon.propTypes = IconPropTypes;

export const RayIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={size} height={size} {...props}>
        <g fill="currentColor" fillRule="nonzero">
            <path d="M8.354 20.354l5-5-.707-.707-5 5z"></path>
            <path d="M16.354 12.354l8-8-.707-.707-8 8z"></path>
            <path d="M14.5 15c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM6.5 23c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
        </g>
    </svg>
);
RayIcon.propTypes = IconPropTypes;

export const ExtendedLineIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={size} height={size} {...props}>
        <g fill="currentColor" fillRule="nonzero">
            <path d="M4.354 25.354l5-5-.707-.707-5 5z"></path>
            <path d="M12.354 17.354l5-5-.707-.707-5 5z"></path>
            <path d="M20.354 9.354l5-5-.707-.707-5 5z"></path>
            <path d="M18.5 12c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM10.5 20c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
        </g>
    </svg>
);
ExtendedLineIcon.propTypes = IconPropTypes;

export const HorizontalLineIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={size} height={size} {...props}>
        <g fill="currentColor" fillRule="nonzero">
            <path d="M4 15h8.5v-1h-8.5zM16.5 15h8.5v-1h-8.5z"></path>
            <path d="M14.5 16c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
        </g>
    </svg>
);
HorizontalLineIcon.propTypes = IconPropTypes;

export const HorizontalRayIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={size} height={size} {...props}>
        <g fill="currentColor" fillRule="nonzero">
            <path d="M8.5 15h16.5v-1h-16.5z"></path>
            <path d="M6.5 16c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
        </g>
    </svg>
);
HorizontalRayIcon.propTypes = IconPropTypes;

export const VerticalLineIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={size} height={size} {...props}>
        <g fill="currentColor" fillRule="nonzero">
            <path d="M15 12.5v-8.5h-1v8.5zM14 16.5v8.5h1v-8.5z"></path>
            <path d="M14.5 16c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
        </g>
    </svg>
);
VerticalLineIcon.propTypes = IconPropTypes;

export const CrossLineIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={size} height={size} {...props}>
        <g fill="currentColor" fillRule="nonzero">
            <path d="M4 15h8.5v-1h-8.5zM16.5 15h8.5v-1h-8.5z"></path>
            <path d="M15 12v-8.5h-1v8.5zM14 16.5v8.5h1v-8.5z"></path>
            <path d="M14.5 16c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
        </g>
    </svg>
);
CrossLineIcon.propTypes = IconPropTypes;

export const RectangleIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={size} height={size} {...props}>
        <g fill="currentColor" fillRule="nonzero">
            <path d="M7.5 6h13v-1h-13z"></path>
            <path d="M7.5 23h13v-1h-13z"></path>
            <path d="M5 7.5v13h1v-13z"></path>
            <path d="M22 7.5v13h1v-13z"></path>
            <path d="M5.5 7c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM22.5 7c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM22.5 24c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM5.5 24c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
        </g>
    </svg>
);
RectangleIcon.propTypes = IconPropTypes;

export const CircleIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={size} height={size} fill="none" {...props}>
        <path stroke="currentColor" d="M16 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"></path>
        <path fill="currentColor" fillRule="evenodd" d="M4.5 14a9.5 9.5 0 0 1 18.7-2.37 2.5 2.5 0 0 0 0 4.74A9.5 9.5 0 0 1 4.5 14Zm19.7 2.5a10.5 10.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5ZM22.5 14a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"></path>
    </svg>
);
CircleIcon.propTypes = IconPropTypes;

export const TriangleIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={size} height={size} {...props}>
        <g fill="currentColor" fillRule="nonzero">
            <path d="M8.5 23h11v-1h-11zM6 8.5v12h1v-12zM7.483 8.28l12.293 13.112.73-.684-12.293-13.112z"></path>
            <path d="M6.5 8c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM6.5 24c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM21.5 24c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
        </g>
    </svg>
);
TriangleIcon.propTypes = IconPropTypes;

export const ParallelChannelIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={size} height={size} {...props}>
        <g fill="currentColor" fillRule="nonzero">
            <path d="M8.354 18.354l10-10-.707-.707-10 10zM12.354 25.354l5-5-.707-.707-5 5z"></path>
            <path d="M20.354 17.354l5-5-.707-.707-5 5z"></path>
            <path d="M19.5 8c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM6.5 21c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM18.5 20c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
        </g>
    </svg>
);
ParallelChannelIcon.propTypes = IconPropTypes;

export const FibRetracementIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={size} height={size} {...props}>
        <g fill="currentColor" fillRule="nonzero">
            <path d="M3 5h22v-1h-22z"></path>
            <path d="M3 17h22v-1h-22z"></path>
            <path d="M3 11h19.5v-1h-19.5z"></path>
            <path d="M5.5 23h19.5v-1h-19.5z"></path>
            <path d="M3.5 24c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM24.5 12c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
        </g>
    </svg>
);
FibRetracementIcon.propTypes = IconPropTypes;

export const FibExtensionIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={size} height={size} {...props}>
        <g fill="currentColor" fillRule="nonzero">
            <path d="M4 25h22v-1h-22z"></path>
            <path d="M4 21h22v-1h-22z"></path>
            <path d="M6.5 17h19.5v-1h-19.5z"></path>
            <path d="M5 14.5v-3h-1v3zM6.617 9.275l10.158-3.628-.336-.942-10.158 3.628z"></path>
            <path d="M18.5 6c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM4.5 11c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM4.5 18c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
        </g>
    </svg>
);
FibExtensionIcon.propTypes = IconPropTypes;

export const PriceRangeIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={size} height={size} {...props}>
        <g fill="currentColor">
            <path fillRule="nonzero" d="M4 5h16.5v-1h-16.5zM25 24h-16.5v1h16.5z"></path>
            <path fillRule="nonzero" d="M6.5 26c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM22.5 6c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
            <path fillRule="nonzero" d="M14 9v14h1v-14z"></path>
            <path d="M14.5 6l2.5 3h-5z"></path>
        </g>
    </svg>
);
PriceRangeIcon.propTypes = IconPropTypes;

export const LongPositionIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={size} height={size} fill="none" {...props}>
        <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M4.5 5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM2 6.5A2.5 2.5 0 0 1 6.95 6H24v1H6.95A2.5 2.5 0 0 1 2 6.5zM4.5 15a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM2 16.5a2.5 2.5 0 0 1 4.95-.5h13.1a2.5 2.5 0 1 1 0 1H6.95A2.5 2.5 0 0 1 2 16.5zM22.5 15a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-18 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM2 22.5a2.5 2.5 0 0 1 4.95-.5H24v1H6.95A2.5 2.5 0 0 1 2 22.5z"></path>
        <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M22.4 8.94l-1.39.63-.41-.91 1.39-.63.41.91zm-4 1.8l-1.39.63-.41-.91 1.39-.63.41.91zm-4 1.8l-1.4.63-.4-.91 1.39-.63.41.91zm-4 1.8l-1.4.63-.4-.91 1.39-.63.41.91z"></path>
    </svg>
);
LongPositionIcon.propTypes = IconPropTypes;

export const ShortPositionIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={size} height={size} fill="none" {...props}>
        <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M4.5 24a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM2 22.5a2.5 2.5 0 0 0 4.95.5H24v-1H6.95a2.5 2.5 0 0 0-4.95.5zM4.5 14a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM2 12.5a2.5 2.5 0 0 0 4.95.5h13.1a2.5 2.5 0 1 0 0-1H6.95a2.5 2.5 0 0 0-4.95.5zM22.5 14a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-18-6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM2 6.5a2.5 2.5 0 0 0 4.95.5H24V6H6.95A2.5 2.5 0 0 0 2 6.5z"></path>
        <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M22.4 20.06l-1.39-.63-.41.91 1.39.63.41-.91zm-4-1.8l-1.39-.63-.41.91 1.39.63.41-.91zm-4-1.8l-1.4-.63-.4.91 1.39.63.41-.91zm-4-1.8L9 14.03l-.4.91 1.39.63.41-.91z"></path>
    </svg>
);
ShortPositionIcon.propTypes = IconPropTypes;

export const ElliottImpulseIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={size} height={size} {...props}>
        <g fill="currentColor">
            <path fillRule="nonzero" d="M5.238 18.469l4.17-4.17-.707-.707-4.17 4.17zM16.47 17.763l-.707.707-4.265-4.265.707-.707zM22.747 13.546l-4.192 4.192.707.707 4.192-4.192z"></path>
            <path fillRule="nonzero" d="M10.5 14c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM17.5 21c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM24.5 14c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM3.5 21c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
            <path d="M11.148 7h-1.098v-4.137c-.401.375-.874.652-1.418.832v-.996c.286-.094.598-.271.934-.533.336-.262.566-.567.691-.916h.891v5.75z"></path>
            <path d="M23.355 5.527l1.094-.113c.031.247.124.443.277.588.154.145.331.217.531.217.229 0 .423-.093.582-.279.159-.186.238-.467.238-.842 0-.352-.079-.615-.236-.791-.158-.176-.363-.264-.615-.264-.315 0-.598.139-.848.418l-.891-.129.563-2.98h2.902v1.027h-2.07l-.172.973c.245-.122.495-.184.75-.184.487 0 .9.177 1.238.531.339.354.508.814.508 1.379 0 .471-.137.892-.41 1.262-.372.505-.889.758-1.551.758-.529 0-.96-.142-1.293-.426-.333-.284-.533-.665-.598-1.145z"></path>
        </g>
    </svg>
);
ElliottImpulseIcon.propTypes = IconPropTypes;

export const ElliottCorrectionIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={size} height={size} {...props}>
        <g fill="currentColor">
            <path fillRule="nonzero" d="M5.238 18.469l4.17-4.17-.707-.707-4.17 4.17zM16.47 17.763l-.707.707-4.265-4.265.707-.707zM22.747 13.546l-4.192 4.192.707.707 4.192-4.192z"></path>
            <path fillRule="nonzero" d="M10.5 14c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM17.5 21c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM24.5 14c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM3.5 21c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
            <path d="M13.746 7h-1.258l-.5-1.301h-2.289l-.473 1.301h-1.227l2.23-5.727h1.223l2.293 5.727zm-2.129-2.266l-.789-2.125-.773 2.125h1.563z"></path>
            <path d="M26.246 4.895l1.121.355c-.172.625-.458 1.089-.857 1.393-.4.303-.907.455-1.521.455-.76 0-1.385-.26-1.875-.779-.49-.52-.734-1.23-.734-2.131 0-.953.246-1.693.738-2.221.492-.527 1.139-.791 1.941-.791.701 0 1.27.207 1.707.621.26.245.456.596.586 1.055l-1.145.273c-.068-.297-.209-.531-.424-.703-.215-.172-.476-.258-.783-.258-.424 0-.769.152-1.033.457-.264.305-.396.798-.396 1.48 0 .724.13 1.24.391 1.547.26.307.599.461 1.016.461.307 0 .572-.098.793-.293.221-.195.38-.503.477-.922z"></path>
        </g>
    </svg>
);
ElliottCorrectionIcon.propTypes = IconPropTypes;

// Using Elliott Impulse for backward compatibility
export const ElliottWaveIcon = ElliottImpulseIcon;

export const DateRangeIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={size} height={size} {...props}>
        <g fill="currentColor">
            <path fillRule="nonzero" d="M20 14h-14v1h14z"></path>
            <path d="M20 17v-5l3 2.5z"></path>
            <path fillRule="nonzero" d="M24 8.5v16.5h1v-16.5zM4 4v16.5h1v-16.5z"></path>
            <path fillRule="nonzero" d="M4.5 24c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM24.5 8c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
        </g>
    </svg>
);
DateRangeIcon.propTypes = IconPropTypes;

export const DatePriceRangeIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={size} height={size} {...props}>
        <g fill="currentColor">
            <path fill-rule="nonzero" d="M6.5 23v1h17.5v-17.5h-1v16.5z"></path>
            <path fill-rule="nonzero" d="M21.5 5v-1h-17.5v17.5h1v-16.5z"></path>
            <path fill-rule="nonzero" d="M4.5 25c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM23.5 6c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
            <path fill-rule="nonzero" d="M13 9v13h1v-13z" id="Line"></path>
            <path d="M13.5 6l2.5 3h-5z"></path>
            <path fill-rule="nonzero" d="M19 14h-13v1h13z"></path>
            <path d="M19 17v-5l3 2.5z"></path>
        </g>
    </svg>
);
DatePriceRangeIcon.propTypes = IconPropTypes;

export const BrushIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={size} height={size} {...props}>
        <g fill="currentColor" fillRule="nonzero">
            <path d="M1.789 23l.859-.854.221-.228c.18-.19.38-.409.597-.655.619-.704 1.238-1.478 1.815-2.298.982-1.396 1.738-2.776 2.177-4.081 1.234-3.667 5.957-4.716 8.923-1.263 3.251 3.785-.037 9.38-5.379 9.38h-9.211zm9.211-1c4.544 0 7.272-4.642 4.621-7.728-2.45-2.853-6.225-2.015-7.216.931-.474 1.408-1.273 2.869-2.307 4.337-.599.852-1.241 1.653-1.882 2.383l-.068.078h6.853z"></path>
            <path d="M18.182 6.002l-1.419 1.286c-1.031.935-1.075 2.501-.096 3.48l1.877 1.877c.976.976 2.553.954 3.513-.045l5.65-5.874-.721-.693-5.65 5.874c-.574.596-1.507.609-2.086.031l-1.877-1.877c-.574-.574-.548-1.48.061-2.032l1.419-1.286-.672-.741z"></path>
        </g>
    </svg>
);
BrushIcon.propTypes = IconPropTypes;

export const HighlighterIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 23" width={size} height={size} {...props}>
        <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M13.402 0L6.78144 6.71532C6.67313 6.82518 6.5917 6.95862 6.54354 7.10518L5.13578 11.3889C4.89843 12.1111 5.08375 12.9074 5.61449 13.4458L5.68264 13.5149L0 19.2789L8.12695 22.4056L11.2874 19.1999L11.3556 19.269C11.8863 19.8073 12.6713 19.9953 13.3834 19.7546L17.6013 18.3285C17.7493 18.2784 17.8835 18.1945 17.9931 18.0832L24.6912 11.2892L23.9857 10.5837L17.515 17.147L7.70658 7.19818L14.1076 0.705575L13.402 0ZM6.07573 11.7067L7.24437 8.15061L16.576 17.6158L13.0701 18.8012C12.7141 18.9215 12.3215 18.8275 12.0562 18.5584L6.31509 12.7351C6.04972 12.466 5.95706 12.0678 6.07573 11.7067ZM6.30539 14.3045L10.509 18.5682L7.87935 21.2355L1.78414 18.8904L6.30539 14.3045Z"></path>
    </svg>
);
HighlighterIcon.propTypes = IconPropTypes;

export const PathIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={size} height={size} {...props}>
        <path fill="currentColor" d="M11 10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm4 7a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm11-8.8V13h1V7h-6v1h4.3l-7.42 7.41a2.49 2.49 0 0 0-2.76 0l-3.53-3.53a2.5 2.5 0 1 0-4.17 0L1 18.29l.7.71 6.42-6.41a2.49 2.49 0 0 0 2.76 0l3.53 3.53a2.5 2.5 0 1 0 4.17 0z"></path>
    </svg>
);
PathIcon.propTypes = IconPropTypes;

export const TextIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={size} height={size} {...props}>
        <path fill="currentColor" d="M8 6.5c0-.28.22-.5.5-.5H14v16h-2v1h5v-1h-2V6h5.5c.28 0 .5.22.5.5V9h1V6.5c0-.83-.67-1.5-1.5-1.5h-12C7.67 5 7 5.67 7 6.5V9h1V6.5Z"></path>
    </svg>
);
TextIcon.propTypes = IconPropTypes;

export const CalloutIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={size} height={size} {...props}>
        <path fill="currentColor" fillRule="nonzero" d="M6 21.586l3.586-3.586h13.407c.004 0 .007-11.993.007-11.993 0-.007-17-.007-17-.007v15.586zm-1 2.414v-18.005c0-.549.451-.995.995-.995h17.01c.549 0 .995.45.995 1.007v11.986c0 .556-.45 1.007-1.007 1.007h-12.993l-5 5z"></path>
    </svg>
);
CalloutIcon.propTypes = IconPropTypes;

export const PriceAlertIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1" {...props}>
        <path d="M10 3 L10 11" />
        <circle cx="10" cy="14" r="1" fill="currentColor" />
        <path d="M6 6 L6 11 C6 13 8 14 10 14 C12 14 14 13 14 11 L14 6" />
    </svg>
);
PriceAlertIcon.propTypes = IconPropTypes;

export const ClearAllIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={size} height={size} {...props}>
        <path fill="currentColor" d="M18 7h5v1h-2.01l-1.33 14.64a1.5 1.5 0 0 1-1.5 1.36H9.84a1.5 1.5 0 0 1-1.49-1.36L7.01 8H5V7h5V6c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v1Zm-6-2a1 1 0 0 0-1 1v1h6V6a1 1 0 0 0-1-1h-4ZM8.02 8l1.32 14.54a.5.5 0 0 0 .5.46h8.33a.5.5 0 0 0 .5-.46L19.99 8H8.02Z"></path>
    </svg>
);
ClearAllIcon.propTypes = IconPropTypes;

export const CursorIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width={size} height={size} {...props}>
        <g fill="currentColor">
            <path d="M18 15h8v-1h-8z"></path>
            <path d="M14 18v8h1v-8zM14 3v8h1v-8zM3 15h8v-1h-8z"></path>
        </g>
    </svg>
);
CursorIcon.propTypes = IconPropTypes;

export const EraserIcon = ({ size = 28, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29 31" width={size} height={size} {...props}>
        <g fill="currentColor" fillRule="nonzero">
            <path d="M15.3 22l8.187-8.187c.394-.394.395-1.028.004-1.418l-4.243-4.243c-.394-.394-1.019-.395-1.407-.006l-11.325 11.325c-.383.383-.383 1.018.007 1.407l1.121 1.121h7.656zm-9.484-.414c-.781-.781-.779-2.049-.007-2.821l11.325-11.325c.777-.777 2.035-.78 2.821.006l4.243 4.243c.781.781.78 2.048-.004 2.832l-8.48 8.48h-8.484l-1.414-1.414z"></path>
            <path d="M13.011 22.999h7.999v-1h-7.999zM13.501 11.294l6.717 6.717.707-.707-6.717-6.717z"></path>
        </g>
    </svg>
);
EraserIcon.propTypes = IconPropTypes;

export const HideDrawingsIcon = ({ size = 28, ...props }) => (
    <svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} viewBox='0 0 28 28' {...props}>
        <path fill='currentColor' fillRule='evenodd' d='M5 10.76l-.41-.72-.03-.04.03-.04a15 15 0 012.09-2.9c1.47-1.6 3.6-3.12 6.32-3.12 2.73 0 4.85 1.53 6.33 3.12a15.01 15.01 0 012.08 2.9l.03.04-.03.04a15 15 0 01-2.09 2.9c-1.47 1.6-3.6 3.12-6.32 3.12-2.73 0-4.85-1.53-6.33-3.12a15 15 0 01-1.66-2.18zm17.45-.98L22 10l.45.22-.01.02a5.04 5.04 0 01-.15.28 16.01 16.01 0 01-2.23 3.1c-1.56 1.69-3.94 3.44-7.06 3.44-3.12 0-5.5-1.75-7.06-3.44a16 16 0 01-2.38-3.38v-.02h-.01L4 10l-.45-.22.01-.02a5.4 5.4 0 01.15-.28 16 16 0 012.23-3.1C7.5 4.69 9.88 2.94 13 2.94c3.12 0 5.5 1.75 7.06 3.44a16.01 16.01 0 012.38 3.38v.02h.01zM22 10l.45-.22.1.22-.1.22L22 10zM3.55 9.78L4 10l-.45.22-.1-.22.1-.22zm6.8.22A2.6 2.6 0 0113 7.44 2.6 2.6 0 0115.65 10 2.6 2.6 0 0113 12.56 2.6 2.6 0 0110.35 10zM13 6.44A3.6 3.6 0 009.35 10 3.6 3.6 0 0013 13.56c2 0 3.65-1.58 3.65-3.56A3.6 3.6 0 0013 6.44zm7.85 12l.8-.8.7.71-.79.8a.5.5 0 000 .7l.59.59c.2.2.5.2.7 0l1.8-1.8.7.71-1.79 1.8a1.5 1.5 0 01-2.12 0l-.59-.59a1.5 1.5 0 010-2.12zM16.5 21.5l-.35-.35a.5.5 0 00-.07.07l-1 1.5-1 1.5a.5.5 0 00.42.78h4a2.5 2.5 0 001.73-.77A2.5 2.5 0 0021 22.5a2.5 2.5 0 00-.77-1.73A2.5 2.5 0 0018.5 20a3.1 3.1 0 00-1.65.58 5.28 5.28 0 00-.69.55v.01h-.01l.35.36zm.39.32l-.97 1.46-.49.72h3.07c.34 0 .72-.17 1.02-.48.3-.3.48-.68.48-1.02 0-.34-.17-.72-.48-1.02-.3-.3-.68-.48-1.02-.48-.35 0-.75.18-1.1.42a4.27 4.27 0 00-.51.4z'></path>
    </svg>
);
HideDrawingsIcon.propTypes = IconPropTypes;

export const LockDrawingsIcon = ({ size = 28, ...props }) => (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' width={size} height={size} {...props}>
        <path fill='currentColor' fillRule='evenodd' d='M14 6a3 3 0 0 0-3 3v3h8.5a2.5 2.5 0 0 1 2.5 2.5v7a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 6 21.5v-7A2.5 2.5 0 0 1 8.5 12H10V9a4 4 0 0 1 8 0h-1a3 3 0 0 0-3-3zm-1 11a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0v-2zm-6-2.5c0-.83.67-1.5 1.5-1.5h11c.83 0 1.5.67 1.5 1.5v7c0 .83-.67 1.5-1.5 1.5h-11A1.5 1.5 0 0 1 7 21.5v-7z'></path>
    </svg>
);
LockDrawingsIcon.propTypes = IconPropTypes;

export const ZoomInIcon = ({ size = 28, ...props }) => (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' width={size} height={size} fill='currentColor' {...props}>
        <path d='M17.646 18.354l4 4 .708-.708-4-4z'></path>
        <path d='M12.5 21a8.5 8.5 0 1 1 0-17 8.5 8.5 0 0 1 0 17zm0-1a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15z'></path>
        <path d='M9 13h7v-1H9z'></path>
        <path d='M13 16V9h-1v7z'></path>
    </svg>
);
ZoomInIcon.propTypes = IconPropTypes;

export const ZoomOutIcon = ({ size = 28, ...props }) => (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28' width={size} height={size} fill='currentColor' {...props}>
        <path d='M17.646 18.354l4 4 .708-.708-4-4z'></path>
        <path d='M12.5 21a8.5 8.5 0 1 1 0-17 8.5 8.5 0 0 1 0 17zm0-1a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15z'></path>
        <path d='M9 13h7v-1H9z'></path>
    </svg>
);
ZoomOutIcon.propTypes = IconPropTypes;

export const MeasureIcon = ({ size = 28, ...props }) => (
    <svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} viewBox='0 0 28 28' {...props}>
        <path fill='currentColor' d='M2 9.75a1.5 1.5 0 0 0-1.5 1.5v5.5a1.5 1.5 0 0 0 1.5 1.5h24a1.5 1.5 0 0 0 1.5-1.5v-5.5a1.5 1.5 0 0 0-1.5-1.5zm0 1h3v2.5h1v-2.5h3.25v3.9h1v-3.9h3.25v2.5h1v-2.5h3.25v3.9h1v-3.9H22v2.5h1v-2.5h3a.5.5 0 0 1 .5.5v5.5a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5v-5.5a.5.5 0 0 1 .5-.5z' transform='rotate(-45 14 14)'></path>
    </svg>
);
MeasureIcon.propTypes = IconPropTypes;

export const TimerIcon = ({ size = 28, ...props }) => (
    <svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} viewBox='0 0 28 28' fill='currentColor' {...props}>
        <path d='M14 5a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 1a8 8 0 1 1 0 16 8 8 0 0 1 0-16z'></path>
        <path d='M14.5 8v6h4v1h-5V8h1z'></path>
        <path d='M12 3h4v1h-4z'></path>
    </svg>
);
TimerIcon.propTypes = IconPropTypes;
