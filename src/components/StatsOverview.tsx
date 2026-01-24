import { BlockedReservation } from '@/types';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { isBlockedToday } from '@/lib/dateUtils';

interface StatsOverviewProps {
    data: BlockedReservation[];
}

export default function StatsOverview({ data }: StatsOverviewProps) {
    const totalBlocked = data.length;

    const carsBlockedToday = data.filter(item =>
        isBlockedToday(item.pickupdatetime, item.dropoffdatetime)
    ).length;

    // Calculate most common reason keyword (simple heuristic)
    const reasonCounts: { [key: string]: number } = {};
    data.forEach(item => {
        if (item.aclastname) {
            // Heuristic: Take first word, ignore short ones like "The", "A"
            const words = item.aclastname.split(' ');
            for (const word of words) {
                const clean = word.replace(/[^a-zA-Z]/g, '');
                if (clean.length > 3) {
                    reasonCounts[clean] = (reasonCounts[clean] || 0) + 1;
                    break; // Just take the first significant word as the "Primary" reason category
                }
            }
        }
    });
    const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const statItems = [
        {
            label: 'Total Blocked',
            value: totalBlocked,
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-50 dark:bg-indigo-500/10',
            border: 'border-indigo-200 dark:border-indigo-500/20',
            tooltip: 'Total number of vehicles currently blocked in the filtered view.'
        },
        {
            label: 'Blocked Today',
            value: carsBlockedToday,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
            border: 'border-emerald-200 dark:border-emerald-500/20',
            tooltip: 'Vehicles that are currentlyblocked today.'
        },
        {
            label: 'Primary Issues',
            value: topReason,
            color: 'text-rose-600 dark:text-rose-400',
            bg: 'bg-rose-50 dark:bg-rose-500/10',
            border: 'border-rose-200 dark:border-rose-500/20',
            tooltip: 'The most common reason for blocking based on reservation notes.'
        },
    ];

    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    return (
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-8">
            {statItems.map((stat, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`relative p-2 md:p-4 rounded-xl border ${stat.bg} ${stat.border} backdrop-blur-sm shadow-sm dark:shadow-lg transition-colors text-center md:text-left group cursor-help ${hoveredIdx === idx ? 'z-50' : 'z-10'}`}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                >
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider truncate">{stat.label}</p>
                    <p className={`text-lg md:text-2xl font-black mt-0.5 md:mt-1 ${stat.color}`}>{stat.value}</p>

                    {/* Tooltip */}
                    {hoveredIdx === idx && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-[150%] max-w-[200px] z-30 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl pointer-events-none"
                        >
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45" />
                            <span className="relative z-10">{stat.tooltip}</span>
                        </motion.div>
                    )}
                </motion.div>
            ))}
        </div>
    );
}
