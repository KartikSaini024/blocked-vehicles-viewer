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
            {/* Dynamic CSS styles for the date picker are injected globally or scoped if possible, 
                 but for simplicity we'll keep inline styles with variables or just rely on Tailwind classes where possible.
                 Ideally, we'd override react-day-picker CSS classes in a global file, but here we can try to inject theme-aware CSS. 
                 
                 Since we can't easily use Tailwind classes INSIDE the 3rd party component via className props for every element,
                 we will use a <style> block that uses CSS variables or media queries OR we will rely on default styles with overrides.
                 
                 Better approach for dark mode toggle: use CSS variables in the style block that change based on parent class?
                 But the style block is scoped. Let's make the style block conditional or use CSS variables that we define.
             */}
            <style>{`
              .rdp {
                --rdp-cell-size: 40px;
                --rdp-accent-color: #6366f1;
                /* Fallback variables if not defined */
                --rdp-background-color: #ffffff;
                margin: 0;
              }
              /* Dark mode overrides applied when specific parent class is present? 
                 Actually, simpler to specificy colors manually or via standard CSS vars. 
                 However, to support runtime toggling we can target .dark .rdp or similar if we could.
                 BUT scroped styles won't see '.dark' on HTML easily unless we anchor it.
              */
             
             /* Alternative: Use the 'classNames' prop of DayPicker to pass Tailwind classes */
             
              .rdp-day_selected:not([disabled]), .rdp-day_selected:hover:not([disabled]) { 
                background-color: var(--rdp-accent-color);
              }
              .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
                 background-color: rgba(99, 102, 241, 0.1); /* Indigo 500/10 */
              }
              /* Light Mode Defaults */
              .rdp-day { color: #1e293b; }
              .rdp-caption_label { color: #0f172a; }
              .rdp-nav_button { color: #64748b; }
              
              /* Dark Mode Overrides via :global or just .dark context if possible? 
                 Since we can't easily toggle CSS string content based on React state (it flashes),
                 let's try to use :where(.dark) or similar if supported, or just use CSS variables defined in globals.
                 
                 Let's stick to using CSS variables that we know exist or mapped:
              */
            `}</style>

            <label className="block text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest pl-1 mb-1.5">{label}</label>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between
                    bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/50 rounded-xl px-3 py-2.5 text-sm 
                    focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all hover:border-indigo-500/30
                    ${date ? 'text-slate-900 dark:text-white font-mono' : 'text-slate-500'}
                `}
            >
                <span>{date ? format(date, 'dd/MM/yyyy') : 'DD/MM/YYYY'}</span>
                <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl dark:shadow-2xl p-2"
                        style={{ width: 'max-content' }}
                    >
                        {/* We use specific classNames to apply Tailwind dark mode styles directly to elements */}
                        <div className="text-slate-900 dark:text-slate-200">
                            <DayPicker
                                mode="single"
                                selected={date}
                                onSelect={handleSelect}
                                showOutsideDays
                                modifiersClassNames={{
                                    selected: 'bg-indigo-600 text-white hover:bg-indigo-500',
                                    today: 'font-bold text-indigo-600 dark:text-indigo-400',
                                }}
                                classNames={{
                                    day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg',
                                    caption: 'flex justify-center pt-1 relative items-center',
                                    caption_label: 'text-sm font-medium text-slate-900 dark:text-white',
                                    nav: 'space-x-1 flex items-center',
                                    nav_button: 'h-7 w-7 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center justify-center p-0 opacity-50 hover:opacity-100 transition-opacity',
                                    table: 'w-full border-collapse space-y-1',
                                    head_row: 'flex',
                                    row: 'flex w-full mt-2',
                                    head_cell: 'text-slate-500 dark:text-slate-400 rounded-md w-9 font-medium text-[0.8rem]',
                                    cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-transparent focus-within:relative focus-within:z-20 text-slate-900 dark:text-slate-200',
                                    day_selected: 'bg-indigo-600 text-white hover:bg-indigo-600 hover:text-white focus:bg-indigo-600 focus:text-white',
                                    day_outside: 'text-slate-300 dark:text-slate-600 opacity-50',
                                    day_disabled: 'text-slate-300 dark:text-slate-600 opacity-50',
                                    day_range_middle: 'aria-selected:bg-indigo-50 aria-selected:text-indigo-900',
                                    day_hidden: 'invisible',
                                }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
