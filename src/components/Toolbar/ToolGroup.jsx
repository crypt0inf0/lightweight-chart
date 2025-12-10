import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import styles from './DrawingToolbar.module.css';

const ToolGroup = ({ tools, activeTool, onToolChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Determine current tool based on active tool or default to first tool
    const currentToolId = useMemo(() => {
        const found = tools.find(t => t.id === activeTool);
        return found ? found.id : tools[0].id;
    }, [activeTool, tools]);

    const currentTool = tools.find(t => t.id === currentToolId) || tools[0];
    const isActive = tools.some(t => t.id === activeTool);

    // Handle click outside to close menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);



    const handleMainClick = () => {

        onToolChange(currentToolId);
    };

    const handleArrowClick = (e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleSubToolClick = (toolId) => {

        onToolChange(toolId);
        setIsOpen(false);
    };

    return (
        <div className={styles.toolGroupContainer} ref={containerRef}>
            <div className={`${styles.toolButton} ${isActive ? styles.active : ''}`} onClick={handleMainClick}>
                <div className={styles.toolIcon} title={currentTool.label}>
                    <currentTool.icon size={20} strokeWidth={1.5} />
                </div>
                {tools.length > 1 && (
                    <div className={styles.arrow} onClick={handleArrowClick}>
                        <ChevronRight size={10} />
                    </div>
                )}
            </div>

            {isOpen && tools.length > 1 && (
                <div className={styles.popover}>
                    {tools.map((tool) => (
                        <div
                            key={tool.id}
                            className={`${styles.popoverItem} ${tool.id === currentToolId ? styles.active : ''}`}
                            onClick={() => handleSubToolClick(tool.id)}
                        >
                            <tool.icon size={20} strokeWidth={1.5} />
                            <span className={styles.popoverLabel}>{tool.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

import PropTypes from 'prop-types';

ToolGroup.propTypes = {
    tools: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        icon: PropTypes.elementType.isRequired,
        label: PropTypes.string.isRequired
    })).isRequired,
    activeTool: PropTypes.string,
    onToolChange: PropTypes.func.isRequired
};

export default ToolGroup;
