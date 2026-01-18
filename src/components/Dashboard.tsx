'use client';

import { useState, useEffect } from 'react';
import { format, addMonths } from 'date-fns';
import { CATEGORIES, LOCATIONS } from '@/lib/constants';
import VehicleList from './VehicleList';
import { BlockedReservation } from '@/types';

interface DashboardProps {
    cookies: string[];
    onLogout: () => void;
}

export default function Dashboard({ cookies, onLogout }: DashboardProps) {
    const [fromDate, setFromDate] = useState(format(new Date(), 'dd/MM/yyyy'));
    const [toDate, setToDate] = useState(format(addMonths(new Date(), 1), 'dd/MM/yyyy'));
    const [locationId, setLocationId] = useState(9); // Default Sydney
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

    const [data, setData] = useState<BlockedReservation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setSelectedCategories([47]); // Default to Van
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
                    fromDate,
                    toDate,
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
        <div className="min-h-screen pb-20">
            {/* Header */}
            <header className="bg-slate-900/40 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Blocked Vehicles
                        </h1>
                    </div>
                    <button
                        onClick={onLogout}
                        className="px-4 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Filters Panel */}
                {/* Filters Panel - Increased Contrast */}
                <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Region 1: Date & Location */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Location</label>
                                <select
                                    value={locationId}
                                    onChange={(e) => setLocationId(Number(e.target.value))}
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    {LOCATIONS.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">From</label>
                                    <input
                                        type="text"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="dd/MM/yyyy"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">To</label>
                                    <input
                                        type="text"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="dd/MM/yyyy"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Region 2: Categories */}
                        <div className="md:col-span-2 flex flex-col">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Vehicle Categories</label>
                                <div className="flex gap-2 text-xs">
                                    <button onClick={selectAllCategories} className="text-indigo-300 hover:text-indigo-200 font-medium">Select All</button>
                                    <span className="text-slate-500">|</span>
                                    <button onClick={clearCategories} className="text-slate-400 hover:text-white font-medium">Clear</button>
                                </div>
                            </div>
                            <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 flex-1 overflow-y-auto max-h-[160px] custom-scrollbar grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {CATEGORIES.map(cat => (
                                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer group hover:bg-slate-700/50 p-1 rounded transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(cat.id)}
                                            onChange={() => handleCategoryToggle(cat.id)}
                                            className="rounded border-slate-500 bg-slate-700 text-indigo-500 focus:ring-offset-slate-900 focus:ring-indigo-500"
                                        />
                                        <span className={`text-sm truncate transition-colors ${selectedCategories.includes(cat.id) ? 'text-white font-medium' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                            {cat.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                        {/* Sort Control */}
                        <div className="flex items-center gap-3">
                            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Sort By:</label>
                            <select
                                value={sortOption}
                                onChange={(e) => handleSort(e.target.value)}
                                className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="date-asc">Block Date: Earliest</option>
                                <option value="days-desc">Duration: Longest</option>
                                <option value="days-asc">Duration: Shortest</option>
                            </select>
                        </div>

                        <button
                            onClick={handleFetch}
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                    Searching...
                                </>
                            ) : (
                                'Find Blocked Vehicles'
                            )}
                        </button>
                    </div>

                    <div className="mt-4 border-t border-slate-700 pt-4 text-center">
                        <button
                            onClick={async () => {
                                console.log('Starting Debug Fetch...');
                                try {
                                    // The user requested test URL
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
                            className="text-xs text-slate-500 hover:text-slate-300 underline"
                        >
                            Run Diagnostic Test (Check Console)
                        </button>
                    </div>
                </div>

                {/* Results */}
                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200">
                        {error}
                    </div>
                )}

                <VehicleList data={sortedData} loading={loading} />

            </main>
        </div>
    );
}
