import React, { useEffect, useRef, useState } from 'react';
import styles from './ReplaySlider.module.css';

const ReplaySlider = ({ 
  chartRef, 
  isReplayMode, 
  replayIndex, 
  fullData, 
  onSliderChange,
  containerRef,
  isSelectingReplayPoint,
  isPlaying = false
}) => {
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseInChart, setIsMouseInChart] = useState(false);
  const [isHandleHovered, setIsHandleHovered] = useState(false);
  const [justClicked, setJustClicked] = useState(false);
  const [isLocked, setIsLocked] = useState(false); // Track if user clicked to lock position
  const sliderRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Unlock when "Jump to Bar" button is clicked
  useEffect(() => {
    if (isSelectingReplayPoint) {
      setIsLocked(false);
      setJustClicked(false);
    }
  }, [isSelectingReplayPoint]);
  
  // Unlock when playback starts - allows slider to follow replay index during playback
  useEffect(() => {
    if (isPlaying) {
      setIsLocked(false);
      setJustClicked(false);
    }
  }, [isPlaying]);

  // Calculate slider position based on replay index
  useEffect(() => {
    if (!isReplayMode || !fullData || fullData.length === 0 || replayIndex === null) {
      return;
    }

    // Update position from replayIndex when:
    // 1. Not dragging (to avoid interfering with drag)
    // 2. Not following mouse (when mouse is out of chart) OR when locked (after click) OR when playing (playback mode)
    // 3. NOT when selecting replay point (Jump to Bar mode) - let mouse control it
    // This ensures slider follows replay index during playback even if mouse is in chart
    if (!isDragging && !isSelectingReplayPoint && (!isMouseInChart || isLocked || isPlaying)) {
      const progress = (replayIndex + 1) / fullData.length;
      const containerWidth = containerRef?.current?.clientWidth || 0;
      const position = progress * containerWidth;
      setSliderPosition(position);
    }
  }, [replayIndex, fullData, isReplayMode, containerRef, isDragging, isMouseInChart, isLocked, isPlaying, isSelectingReplayPoint]);

  // Handle mouse move for slider follow within chart bounds
  useEffect(() => {
    if (!isReplayMode || !containerRef.current) return;

    const handleMouseMove = (e) => {
      // Don't follow mouse if locked (after click), immediately after a click, or during playback
      // BUT allow following when selecting replay point (Jump to Bar mode)
      if ((isLocked || justClicked || isPlaying) && !isSelectingReplayPoint) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const containerWidth = rect.width;
      
      // Check if mouse is within chart bounds
      if (x >= 0 && x <= containerWidth) {
        setIsMouseInChart(true);
        
        // Always follow mouse position (whether dragging or not)
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        animationFrameRef.current = requestAnimationFrame(() => {
          setSliderPosition(x);
        });
      }
    };

    const handleMouseLeave = () => {
      setIsMouseInChart(false);
    };

    const handleMouseEnter = (e) => {
      // Always allow following when selecting replay point (Jump to Bar mode)
      if (isSelectingReplayPoint) {
        setIsMouseInChart(true);
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        if (x >= 0 && x <= rect.width) {
          setSliderPosition(x);
        }
        return;
      }
      
      // Don't follow mouse if locked or during playback
      if (isLocked || isPlaying) return;
      
      setIsMouseInChart(true);
      // Immediately position slider at mouse entry point
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      if (x >= 0 && x <= rect.width) {
        setSliderPosition(x);
      }
    };

    const container = containerRef.current;
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mouseenter', handleMouseEnter);
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mouseenter', handleMouseEnter);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isReplayMode, containerRef, justClicked, isLocked, isPlaying]);

  // Handle click on chart to jump to position and start replay from that point
  // DISABLED when isSelectingReplayPoint is true (Jump to Bar mode) to avoid conflicts
  useEffect(() => {
    if (!isReplayMode || !containerRef.current || isSelectingReplayPoint) return;

    let clickStartTime = 0;
    let clickStartX = 0;

    const handleMouseDown = (e) => {
      clickStartTime = Date.now();
      clickStartX = e.clientX;
    };

    const handleChartClick = (e) => {
      // Ignore if this was a drag (mouse moved significantly)
      const timeDiff = Date.now() - clickStartTime;
      const distanceMoved = Math.abs(e.clientX - clickStartX);
      
      // Only treat as click if mouse didn't move much and was quick
      if (clickStartTime === 0) {
        // No mousedown detected, treat as click anyway
      } else if (distanceMoved > 5) {
        return; // Mouse moved too much, this was a drag
      } else if (timeDiff > 300) {
        return; // Took too long, not a quick click
      }
      
      // Don't handle clicks on the slider handle
      if (e.target.closest(`.${styles.sliderHandle}`)) return;
      
      if (!chartRef.current || !fullData || fullData.length === 0) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      
      if (x >= 0 && x <= rect.width) {
        // Use chart's time scale to get the logical coordinate
        const timeScale = chartRef.current.timeScale();
        const logical = timeScale.coordinateToLogical(x);
        
        if (logical !== null) {
          // Get the visible logical range
          const visibleRange = timeScale.getVisibleLogicalRange();
          
          if (visibleRange) {
            // Calculate the progress within the FULL data range
            // We need to map from visible range to full data range
            const visibleFrom = visibleRange.from;
            const visibleTo = visibleRange.to;
            const visibleWidth = visibleTo - visibleFrom;
            
            // Calculate which candle in the FULL data this corresponds to
            // The logical coordinate is relative to the current visible data
            // We need to map it to the full data
            const relativePosition = (logical - visibleFrom) / visibleWidth;
            
            // Get the time at this position
            const clickedTime = timeScale.coordinateToTime(x);
            
            if (clickedTime) {
              // Find the closest candle in FULL data to the clicked time
              let clickedIndex = fullData.findIndex(candle => candle.time >= clickedTime);
              
              // If not found, use the last candle
              if (clickedIndex === -1) {
                clickedIndex = fullData.length - 1;
              }
              
              // Clamp to valid range
              clickedIndex = Math.max(0, Math.min(clickedIndex, fullData.length - 1));
              
              // Lock the position - slider will disappear and future candles will be hidden
              setIsLocked(true);
              setJustClicked(true);
              setSliderPosition(x);
              
              // Update the replay index when clicking - hide future candles
              // This will also stop playback if it's running (handled in handleSliderChange)
              if (onSliderChange) {
                onSliderChange(clickedIndex, true); // true = hide future candles
              }
              
              // Unlock after a delay to allow mouse to resume following
              setTimeout(() => {
                setJustClicked(false);
                // Keep locked state - will be unlocked when "Jump to Bar" is clicked or replay starts
              }, 150);
            }
          }
        }
      }
    };

    const container = containerRef.current;
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('click', handleChartClick);
    
    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('click', handleChartClick);
    };
  }, [isReplayMode, containerRef, fullData, onSliderChange, isSelectingReplayPoint]);

  // Handle drag state changes - update replay data when dragging
  useEffect(() => {
    if (!isDragging) return;

    let lastUpdateTime = 0;
    const throttleMs = 50; // Throttle to 20fps for smoother performance during drag

    const handleMouseMove = (e) => {
      if (!containerRef.current || !fullData || fullData.length === 0) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const containerWidth = rect.width;
      
      const clampedX = Math.max(0, Math.min(x, containerWidth));
      setSliderPosition(clampedX);

      // Throttle the replay data updates
      const now = Date.now();
      if (now - lastUpdateTime >= throttleMs) {
        lastUpdateTime = now;
        
        const progress = clampedX / containerWidth;
        const newReplayIndex = Math.max(0, Math.min(Math.floor(progress * fullData.length), fullData.length - 1));
        
        if (onSliderChange) {
          onSliderChange(newReplayIndex, false); // false = don't hide future during drag (preview mode)
        }
      }
    };

    const handleMouseUp = (e) => {
      setIsDragging(false);
      
      // Final update when drag ends - use current mouse position for accuracy
      if (containerRef.current && fullData && fullData.length > 0) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const containerWidth = rect.width;
        const clampedX = Math.max(0, Math.min(x, containerWidth));
        const progress = clampedX / containerWidth;
        const finalIndex = Math.max(0, Math.min(Math.floor(progress * fullData.length), fullData.length - 1));
        
        // Update slider position to final position
        setSliderPosition(clampedX);
        
        if (onSliderChange) {
          onSliderChange(finalIndex, true); // true = hide future candles after drag ends
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, containerRef, fullData, onSliderChange]);

  if (!isReplayMode) return null;

  // Only show slider when:
  // - Mouse is in chart AND not locked AND not playing (for preview/interaction)
  // - OR currently dragging
  // - OR when selecting replay point (Jump to Bar mode) - show slider to preview selection
  // During playback, hide slider since future candles are already hidden by data update
  const showSlider = (isMouseInChart && !isLocked && !isPlaying) || isDragging || isSelectingReplayPoint;

  // Calculate the position of the current replay index for the fade overlay
  const getReplayPosition = () => {
    if (!chartRef.current || !fullData || replayIndex === null) return null;
    
    try {
      const timeScale = chartRef.current.timeScale();
      const replayTime = fullData[replayIndex]?.time;
      
      if (replayTime) {
        const x = timeScale.timeToCoordinate(replayTime);
        return x;
      }
    } catch (e) {
      console.error('Error calculating replay position:', e);
    }
    
    return null;
  };

  const replayPosition = getReplayPosition();
  
  // Show fade overlay when:
  // - Slider is visible (following mouse) - to preview what will be hidden
  // - NOT when locked (because future candles are already hidden)
  // - NOT when playing (because future candles are already hidden by data update)
  // - YES when selecting replay point (Jump to Bar mode) - show fade to preview what will be hidden
  const showFadeOverlay = showSlider && !isLocked && !isPlaying;
  
  // Use slider position for the fade overlay
  const fadePosition = sliderPosition;

  return (
    <>
      {/* Faded overlay for future candles - preview while moving slider */}
      {showFadeOverlay && fadePosition !== null && (
        <div 
          className={styles.fadeOverlay}
          style={{ 
            left: `${fadePosition}px`,
            width: `calc(100% - ${fadePosition}px)`
          }}
        />
      )}
      
      {/* Slider line and handle - only show when mouse in chart and not locked */}
      {showSlider && (
        <div 
          ref={sliderRef}
          className={styles.sliderContainer}
          style={{ left: `${sliderPosition}px` }}
        >
          <div className={styles.sliderLine} />
          <div 
            className={styles.sliderHandle}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(true);
            }}
            onMouseEnter={() => setIsHandleHovered(true)}
            onMouseLeave={() => setIsHandleHovered(false)}
          />
          {/* Time tooltip - shows when hovering over handle or dragging */}
          {(isHandleHovered || isDragging) && replayIndex !== null && fullData && replayIndex < fullData.length && (
            <div className={styles.timeTooltip}>
              {new Date(fullData[replayIndex].time * 1000).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ReplaySlider;
