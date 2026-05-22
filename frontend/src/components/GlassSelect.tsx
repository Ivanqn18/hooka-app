import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface GlassSelectOption {
    value: string;
    label: string;
    icon?: React.ReactNode;
}

interface GlassSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: GlassSelectOption[];
    placeholder?: string;
    className?: string;
    buttonClassName?: string;
    disabled?: boolean;
    icon?: React.ReactNode; // Optional left icon
}

export default function GlassSelect({
    value,
    onChange,
    options,
    placeholder = 'Seleccionar...',
    className = '',
    buttonClassName = '',
    disabled = false,
    icon
}: GlassSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const optionsRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    // Toggle dropdown open/closed
    const toggleOpen = () => {
        if (disabled) return;
        setIsOpen(!isOpen);
    };

    // Close when clicking outside the component
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Reset highlighted option when dropdown opens/closes
    useEffect(() => {
        if (isOpen) {
            const index = options.findIndex(opt => opt.value === value);
            setHighlightedIndex(index !== -1 ? index : 0);
        } else {
            setHighlightedIndex(-1);
        }
    }, [isOpen, value, options]);

    // Handle accessibility key navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;

        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => (prev + 1) % options.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => (prev - 1 + options.length) % options.length);
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < options.length) {
                    onChange(options[highlightedIndex].value);
                    setIsOpen(false);
                }
                break;
            case 'Escape':
            case 'Tab':
                setIsOpen(false);
                break;
            default:
                break;
        }
    };

    // Auto-scroll to highlighted option
    useEffect(() => {
        if (isOpen && optionsRef.current && highlightedIndex >= 0) {
            const container = optionsRef.current;
            const item = container.children[highlightedIndex] as HTMLElement;
            if (item) {
                const containerTop = container.scrollTop;
                const containerBottom = containerTop + container.clientHeight;
                const itemTop = item.offsetTop;
                const itemBottom = itemTop + item.clientHeight;

                if (itemTop < containerTop) {
                    container.scrollTop = itemTop;
                } else if (itemBottom > containerBottom) {
                    container.scrollTop = itemBottom - container.clientHeight;
                }
            }
        }
    }, [highlightedIndex, isOpen]);

    return (
        <div 
            ref={containerRef} 
            className={`relative w-full ${className}`}
            onKeyDown={handleKeyDown}
        >
            {/* Dropdown Button */}
            <button
                type="button"
                onClick={toggleOpen}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                className={`w-full flex items-center justify-between px-5 py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 text-white font-bold transition-all focus:border-shisha-ember/50 outline-none text-left cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed ${
                    isOpen ? 'border-shisha-ember/50 ring-1 ring-shisha-ember/20 shadow-lg shadow-shisha-ember/5' : ''
                } ${buttonClassName}`}
            >
                <div className="flex items-center gap-3">
                    {icon && <span className="text-shisha-text-dim/60">{icon}</span>}
                    {selectedOption?.icon && <span className="flex items-center">{selectedOption.icon}</span>}
                    <span className={selectedOption ? 'text-white' : 'text-shisha-text-dim/40'}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown 
                    size={16} 
                    className={`text-shisha-text-dim transition-transform duration-300 ${isOpen ? 'rotate-180 text-shisha-ember' : ''}`} 
                />
            </button>

            {/* Dropdown Options Menu */}
            <div
                ref={optionsRef}
                role="listbox"
                className={`absolute left-0 w-full mt-2 bg-shisha-surface/95 border border-white/10 rounded-2xl shadow-2xl z-[150] max-h-60 overflow-y-auto backdrop-blur-xl transition-all duration-200 origin-top transform ${
                    isOpen 
                        ? 'opacity-100 scale-100 pointer-events-auto' 
                        : 'opacity-0 scale-95 pointer-events-none'
                }`}
            >
                <div className="py-2">
                    {options.map((option, idx) => {
                        const isSelected = option.value === value;
                        const isHighlighted = idx === highlightedIndex;

                        return (
                            <button
                                type="button"
                                key={option.value}
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-5 py-3 text-sm font-bold flex items-center gap-3 transition-colors ${
                                    isSelected 
                                        ? 'bg-shisha-ember/15 text-shisha-ember' 
                                        : isHighlighted
                                            ? 'bg-white/5 text-white'
                                            : 'text-shisha-text-muted hover:bg-white/[0.02] hover:text-white'
                                }`}
                            >
                                {option.icon && <span className="flex items-center">{option.icon}</span>}
                                <span className="flex-1">{option.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
