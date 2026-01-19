import { useState } from 'react';
import { BlockedReservation } from '@/types';
import { CATEGORIES } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';

interface VehicleListProps {
    data: BlockedReservation[];
    loading: boolean;
    viewMode: 'cards' | 'tiles';
}

const VehicleCard = ({ item, index }: { item: BlockedReservation, index: number }) => {
    const categoryName = CATEGORIES.find(c => c.id === item.categoryid)?.name || 'Unknown Category';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="
                relative flex flex-col
                bg-white dark:bg-slate-900/50 backdrop-blur-md 
                border border-slate-200 dark:border-slate-700/50 
                hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 
                transition-all duration-300 rounded-2xl overflow-hidden group 
                shadow-sm hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]
            "
        >
            {/* Header Strip */}
            <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-4 border-b border-slate-200 dark:border-slate-700/50 flex justify-between items-start transition-colors">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">
                            {item.registrationno || item.currentrcmregistrationno || 'NO REGO'}
                        </h3>
                        {item.carDetails?.year && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">{item.carDetails.year}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wide">
                        <span className="font-medium text-indigo-600 dark:text-indigo-300">{categoryName}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                        <span>
                            {item.carDetails?.make || 'Unknown'} <span className="text-slate-700 dark:text-slate-300">{item.carDetails?.model}</span>
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20 shadow-sm dark:shadow-inner">
                        {item.carDetails?.colour || 'Unknown Color'}
                    </div>
                    {item.carDetails?.fleetno && (
                        <span className="text-[15px] font-mono text-slate-400 dark:text-slate-500">#{item.carDetails.fleetno.split(' ')[0]}</span>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="p-5 flex-1 flex flex-col gap-4">
                {/* Dates Grid */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950/30 rounded-xl p-3 border border-slate-200 dark:border-white/5">
                    <div>
                        <p className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-bold mb-1">Start</p>
                        <p className="text-xs font-semibold text-slate-700 dark:text-white">{item.pickupdatetime.split(' ')[0]}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.pickuplocation}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-bold mb-1">End</p>
                        <p className="text-xs font-semibold text-slate-700 dark:text-white">{item.dropoffdatetime.split(' ')[0]}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.dropofflocation}</p>
                    </div>
                </div>

                {/* Notes Section - Highlighted */}
                {item.aclastname && (
                    <div className="bg-rose-50 dark:bg-rose-500/5 border-l-2 border-rose-400 dark:border-rose-500/50 pl-3 py-1">
                        <p className="text-[10px] uppercase text-rose-500 dark:text-rose-400 font-bold mb-0.5">Reason</p>
                        <p className="text-sm text-slate-700 dark:text-slate-200 italic leading-snug">"{item.aclastname}"</p>
                    </div>
                )}

                {!item.aclastname && (
                    <div className="bg-slate-50 dark:bg-slate-800/30 border-l-2 border-slate-300 dark:border-slate-600 pl-3 py-1">
                        <p className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-bold mb-0.5">Status</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 italic">Maintenance Block</p>
                    </div>
                )}
            </div>

            {/* Footer Action */}
            <div className="mt-auto border-t border-slate-100 dark:border-white/5 p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/40">
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{item.rentaldays} Days</span>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://bookings.rentalcarmanager.com/s_QuickReservation.aspx?ResNo=${item.reservationno}`, 'RCMReservation', 'width=1200,height=900,scrollbars=yes');
                    }}
                    className="text-[10px] font-bold bg-white dark:bg-white/5 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-slate-600 hover:text-white dark:text-slate-300 dark:hover:text-white px-3 py-1.5 rounded border border-slate-200 dark:border-white/5 transition-all flex items-center gap-1 group/btn shadow-sm"
                >
                    OPEN RCM
                    <svg className="w-3 h-3 text-slate-400 dark:text-slate-500 group-hover/btn:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </button>
            </div>
        </motion.div>
    );
};

const VehicleTile = ({ item, index, onClick }: { item: BlockedReservation, index: number, onClick: () => void }) => {
    const categoryName = CATEGORIES.find(c => c.id === item.categoryid)?.name || 'Unknown Category';

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.02, duration: 0.2 }}
            onClick={onClick}
            className="
                group cursor-pointer relative 
                bg-white dark:bg-slate-900/60 backdrop-blur-sm 
                border border-slate-200 dark:border-slate-700/50 
                hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-800 
                transition-all duration-200 rounded-xl p-3 
                flex flex-col md:flex-row md:items-center justify-between gap-4 
                hover:shadow-lg hover:shadow-indigo-500/10
            "
        >
            {/* Left: Identity */}
            <div className="flex items-center gap-4 min-w-[30%]">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.aclastname ? 'bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400' : 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-black text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-lg">
                            {item.registrationno || item.currentrcmregistrationno || 'NO REGO'}
                        </span>
                        {item.carDetails?.fleetno && (
                            <span className="text-xs font-mono text-slate-500">#{item.carDetails.fleetno.split(' ')[0]}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-medium text-indigo-600 dark:text-indigo-300">{categoryName}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                        <span>{item.carDetails?.make} {item.carDetails?.model}</span>
                    </div>
                </div>
            </div>

            {/* Middle: Location & Dates */}
            <div className="flex items-center gap-6 flex-1">
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{item.pickuplocation}</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="text-xs">
                        <span className="text-slate-700 dark:text-slate-300">{item.pickupdatetime.split(' ')[0]}</span>
                        <span className="text-slate-400 dark:text-slate-500 mx-1">➜</span>
                        <span className="text-slate-700 dark:text-slate-300">{item.dropoffdatetime.split(' ')[0]}</span>
                    </div>
                </div>
            </div>

            {/* Right: Status & Action */}
            <div className="flex items-center gap-4 justify-end min-w-[15%]">
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${item.aclastname ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20'}`}>
                    {item.rentaldays} Days
                </span>
                <svg className="w-5 h-5 text-slate-400 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
            </div>
        </motion.div>
    );
};

export default function VehicleList({ data, loading, viewMode }: VehicleListProps) {
    const [expandedIds, setExpandedIds] = useState<string[]>([]);

    const toggleExpand = (id: string) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    if (loading) {
        return (
            <div className={`grid ${viewMode === 'cards' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'grid-cols-1 gap-3'}`}>
                {[...Array(12)].map((_, i) => (
                    <div key={i} className={`bg-white dark:bg-white/5 backdrop-blur-lg border border-slate-200 dark:border-white/5 rounded-xl animate-pulse ${viewMode === 'cards' ? 'h-48' : 'h-20'}`} />
                ))}
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="inline-block p-4 rounded-full bg-slate-100 dark:bg-slate-800/50 mb-4 h-16 w-16 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-xl font-medium text-slate-900 dark:text-slate-300">No blocked vehicles found</h3>
                <p className="text-slate-500 mt-2">Try adjusting your filters.</p>
            </div>
        );
    }

    if (viewMode === 'tiles') {
        return (
            <div className="grid grid-cols-1 gap-3">
                {data.map((item, index) => {
                    const isExpanded = expandedIds.includes(String(item.reservationno));

                    return (
                        <div key={item.reservationno || index}>
                            <AnimatePresence mode="wait">
                                {isExpanded ? (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        onClick={() => toggleExpand(String(item.reservationno))}
                                        className="cursor-pointer"
                                    >
                                        <VehicleCard item={item} index={index} />
                                    </motion.div>
                                ) : (
                                    <VehicleTile
                                        item={item}
                                        index={index}
                                        onClick={() => toggleExpand(String(item.reservationno))}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        );
    }

    // Grid View (Cards)
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((item, index) => (
                <VehicleCard key={item.reservationno || index} item={item} index={index} />
            ))}
        </div>
    );
}
