'use client';

import { useState, useEffect } from 'react';
import { format, addMonths } from 'date-fns';
import { CATEGORIES, LOCATIONS } from '@/lib/constants';
import VehicleList from './VehicleList';
import StatsOverview from './StatsOverview';
import DatePickerPopover from './DatePickerPopover';
import { BlockedReservation } from '@/types';
import { useTheme } from '@/context/ThemeContext';

interface DashboardProps {
    cookies: string[];
    onLogout: () => void;
}

export default function Dashboard({ cookies, onLogout }: DashboardProps) {
    const { theme, toggleTheme } = useTheme();
    const [fromDate, setFromDate] = useState<Date | undefined>(new Date());
    const [toDate, setToDate] = useState<Date | undefined>(addMonths(new Date(), 1));
    const [locationId, setLocationId] = useState(9); // Default Sydney
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

    const [data, setData] = useState<BlockedReservation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setSelectedCategories([]); // Default to None

        // Default to tiles on mobile
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setViewMode('tiles');
            }
        };

        handleResize(); // Check on mount
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleFetch = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cookies,
                    fromDate: fromDate ? format(fromDate, 'dd/MM/yyyy') : '',
                    toDate: toDate ? format(toDate, 'dd/MM/yyyy') : '',
                    locationId,
                    categoryIds: selectedCategories.length > 0 ? selectedCategories : CATEGORIES.map(c => c.id)
                })
            });

            const result = await res.json();

            if (res.ok) {
                setData(result.data || []);
                if (result.errors) {
                    console.warn('Some categories failed to load', result.errors);
                }
            } else {
                setError(result.error || 'Failed to fetch data');
                // If session expired or unauthorized
                if (res.status === 401 || res.status === 403) {
                    // optional: onLogout();
                }
            }

        } catch (err) {
            setError('An error occurred while fetching data');
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryToggle = (id: number) => {
        setSelectedCategories(prev => {
            if (prev.includes(id)) {
                return prev.filter(c => c !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const selectAllCategories = () => {
        setSelectedCategories(CATEGORIES.map(c => c.id));
    };

    const clearCategories = () => {
        setSelectedCategories([]);
    };

    const [sortOption, setSortOption] = useState<'date-asc' | 'date-desc' | 'days-asc' | 'days-desc'>('date-asc');

    const [viewMode, setViewMode] = useState<'cards' | 'tiles'>('cards');

    const handleSort = (option: string) => {
        setSortOption(option as any);
    };

    const sortedData = [...data].sort((a, b) => {
        if (sortOption === 'date-asc' || sortOption === 'date-desc') {
            // Parses "dd/MM/yyyy HH:mm:ss" - Assuming format in API response needs parsing if date object isn't standard
            // However, typical JS Date parsing might fail on dd/MM/yyyy.
            // Let's rely on standard comparison if string is ISO, otherwise we might need a parser helper. 
            // Given previous code didn't show parsing, let's assume standard string sort works or date string is sortable?
            // Wait, RCM usually returns dd/MM/yyyy HH:mm:ss. We need to be careful.
            // Let's do a simple text comparison for now if format is YYYY-MM-DD or assume it works, 
            // OR better, parse it manually to timestamp for robustness. 
            // Example: "14/01/2026 10:00:00"
            const parseDate = (d: string) => {
                if (!d) return 0;
                const parts = d.split(' ');
                if (parts.length < 1) return 0;
                const dateParts = parts[0].split('/');
                if (dateParts.length < 3) return 0;
                const timeParts = parts[1] ? parts[1].split(':') : [0, 0, 0];
                return new Date(
                    Number(dateParts[2]),
                    Number(dateParts[1]) - 1,
                    Number(dateParts[0]),
                    Number(timeParts[0] || 0),
                    Number(timeParts[1] || 0)
                ).getTime();
            };

            const dateA = parseDate(a.pickupdatetime);
            const dateB = parseDate(b.pickupdatetime);
            return sortOption === 'date-asc' ? dateA - dateB : dateB - dateA;
        } else {
            const daysA = Number(a.rentaldays);
            const daysB = Number(b.rentaldays);
            return sortOption === 'days-asc' ? daysA - daysB : daysB - daysA;
        }
    });

    return (
        <div className="min-h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 selection:bg-indigo-500/30 transition-colors duration-300">
            {/* Ambient Background Glow */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-50 dark:opacity-100 transition-opacity">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 bg-white/70 dark:bg-slate-950/80 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-20 flex flex-row items-center justify-between gap-2 md:gap-0">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 dark:from-indigo-600 dark:to-indigo-800 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                            <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-base md:text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">Blocked Vehicles</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden md:block">Fleet Maintenance Overview</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-1.5 md:p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        >
                            {theme === 'light' ? (
                                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            )}
                        </button>

                        {/* View Toggle (Hidden on Mobile) */}
                        <div className="hidden md:flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('cards')}
                                className={`p-1.5 rounded transition-all ${viewMode === 'cards' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                title="Card View"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewMode('tiles')}
                                className={`p-1.5 rounded transition-all ${viewMode === 'tiles' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                title="Tile View"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                        <button
                            onClick={onLogout}
                            className="px-3 py-1.5 md:px-4 md:py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all flex items-center gap-2 group"
                            title="Sign Out"
                        >
                            <span className="hidden md:inline">Sign Out</span>
                            <svg className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">


                {/* Main Filter & Control Bar */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl rounded-2xl p-1 mb-8 transition-colors duration-300">
                    <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Filters Region */}
                        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Location */}
                            <div>
                                <label className="block text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest pl-1 mb-1.5">Location</label>
                                <select
                                    value={locationId}
                                    onChange={(e) => setLocationId(Number(e.target.value))}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/50 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all hover:border-indigo-500/30"
                                >
                                    {LOCATIONS.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date Range */}
                            <div className="col-span-2 flex gap-4">
                                <div className="flex-1">
                                    <DatePickerPopover
                                        label="From Date"
                                        date={fromDate}
                                        setDate={setFromDate}
                                    />
                                </div>
                                <div className="flex-1">
                                    <DatePickerPopover
                                        label="To Date"
                                        date={toDate}
                                        setDate={setToDate}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Region */}
                        <div className="lg:col-span-4 flex flex-col justify-end gap-3">
                            {/* Category Summary */}
                            <div className="flex justify-between items-center px-1">
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">categories: <span className="text-slate-900 dark:text-white">{selectedCategories.length === 0 ? 'All' : selectedCategories.length}</span></span>
                                <div className="flex gap-3 text-[10px] font-bold uppercase tracking-wide">
                                    <button onClick={selectAllCategories} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">Select All</button>
                                    <button onClick={clearCategories} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Clear</button>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <select
                                    value={sortOption}
                                    onChange={(e) => handleSort(e.target.value)}
                                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/50 rounded-xl px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all hover:border-indigo-500/30 w-1/3"
                                >
                                    <option value="date-asc">Pickup: Earliest</option>
                                    <option value="days-desc">Duration: Longest</option>
                                    <option value="days-asc">Duration: Shortest</option>
                                </select>
                                <button
                                    onClick={handleFetch}
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 py-2.5"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Searching...
                                        </>
                                    ) : (
                                        'Search'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Expanded Category Selector (Collapsible/Scrollable) */}
                    <div className="border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/30 p-4 rounded-b-xl max-h-[140px] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                            {CATEGORIES.map(cat => (
                                <label key={cat.id} className={`
                                    flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all border text-xs font-medium
                                    ${selectedCategories.includes(cat.id)
                                        ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-200 dark:border-indigo-500/50 text-indigo-700 dark:text-indigo-200'
                                        : 'bg-white dark:bg-slate-900/50 border-transparent text-slate-600 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-300'}
                                `}>
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(cat.id)}
                                        onChange={() => handleCategoryToggle(cat.id)}
                                        className="hidden" // Hiding default checkbox for custom style
                                    />
                                    <div className={`w-3 h-3 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${selectedCategories.includes(cat.id) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                        {selectedCategories.includes(cat.id) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                    </div>
                                    <span className="truncate">{cat.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* // Debug Trigger
                <div className="flex justify-center mb-8">
                    <button
                        onClick={async () => {
                            console.log('Starting Debug Fetch...');
                            try {
                                const testUrl = `https://bookings.rentalcarmanager.com/bookingsheet/loadcardata.ashx?mode=availability&catid=91&rowno=1&from=14/01/2026&to=15/02/2026&locid=9&ctypeid=0&q=1768550300743`;
                                const res = await fetch('/api/test', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ cookies, url: testUrl })
                                });
                                const result = await res.json();
                                console.log('DEBUG FETCH RESULT:', result);
                                alert('Check browser console for debug result');
                            } catch (e) {
                                console.error('Debug fetch failed', e);
                                alert('Debug fetch failed');
                            }
                        }}
                        className="text-[10px] uppercase tracking-widest text-slate-600 hover:text-indigo-400 transition-colors font-bold"
                    >
                        Diagnostic Tool
                    </button>
                </div> */}

                {/* Statistics Overview */}
                {data.length > 0 && <StatsOverview data={data} />}


                {/* Results */}
                {error && (
                    <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-200 flex items-center gap-3">
                        <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {error}
                    </div>
                )}

                <VehicleList data={sortedData} loading={loading} viewMode={viewMode} />

            </main>
        </div>
    );
}
