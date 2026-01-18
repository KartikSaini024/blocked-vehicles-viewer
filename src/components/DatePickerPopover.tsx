import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, parse } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-day-picker/dist/style.css';

// Custom styles for DayPicker to match the dark theme
const css = `
  .rdp {
    --rdp-cell-size: 40px;
    --rdp-accent-color: #6366f1; /* Indigo 500 */
    --rdp-background-color: #1e293b; /* Slate 800 */
    margin: 0;
  }
  .rdp-day_selected:not([disabled]), .rdp-day_selected:hover:not([disabled]) { 
    background-color: var(--rdp-accent-color);
  }
  .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
    background-color: #334155; /* Slate 700 */
  }
  .rdp-day {
     color: #cbd5e1; /* Slate 300 */
  }
  .rdp-day_outside {
     opacity: 0.5;
  }
  .rdp-caption_label {
     color: #f1f5f9; /* Slate 100 */
  }
  .rdp-nav_button {
     color: #94a3b8; /* Slate 400 */
  }
`;

interface DatePickerPopoverProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    label: string;
}

export default function DatePickerPopover({ date, setDate, label }: DatePickerPopoverProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (selected: Date | undefined) => {
        setDate(selected);
        if (selected) {
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <style>{css}</style>
            <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest pl-1 mb-1.5">{label}</label>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between
                    bg-slate-950 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm 
                    focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all hover:border-indigo-500/30
                    ${date ? 'text-white font-mono' : 'text-slate-500'}
                `}
            >
                <span>{date ? format(date, 'dd/MM/yyyy') : 'DD/MM/YYYY'}</span>
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2"
                        style={{ width: 'max-content' }}
                    >
                        <DayPicker
                            mode="single"
                            selected={date}
                            onSelect={handleSelect}
                            showOutsideDays
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
