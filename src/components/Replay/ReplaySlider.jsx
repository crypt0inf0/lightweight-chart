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


  // Track playback state changes - unlock when playback starts, lock when it ends
  const prevIsPlayingRef = useRef(isPlaying);
  useEffect(() => {
    if (isPlaying && !prevIsPlayingRef.current) {
      // Playback just started - unlock to allow position updates
      setIsLocked(false);
      setJustClicked(false);
    } else if (!isPlaying && prevIsPlayingRef.current) {
      // Playback just ended - lock to keep slider hidden
      setIsLocked(true);
    }
    prevIsPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Lock slider (hide it) when replayIndex changes from a click (not from playback or initial load)
  // This makes the slider disappear after clicking on the chart to select a position
  const prevReplayIndexRef = useRef(replayIndex);
  useEffect(() => {
    if (!isReplayMode || isPlaying || isSelectingReplayPoint) {
      prevReplayIndexRef.current = replayIndex;
      return;
    }

    // If replayIndex changed and we're not playing, it was a click - lock the slider
    if (replayIndex !== prevReplayIndexRef.current && replayIndex !== null) {
      setIsLocked(true);
      setJustClicked(true);
      // Clear justClicked after a short delay
      setTimeout(() => setJustClicked(false), 150);
    }

    prevReplayIndexRef.current = replayIndex;
  }, [replayIndex, isReplayMode, isPlaying, isSelectingReplayPoint]);

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

  // NOTE: Chart click handling for replay jumps is now done in ChartComponent
  // using chart.subscribeClick() which provides accurate param.time
  // This avoids issues with coordinate-to-time mapping on truncated data

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
