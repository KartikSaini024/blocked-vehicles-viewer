import { BlockedReservation } from '@/types';
import { motion } from 'framer-motion';

interface StatsOverviewProps {
    data: BlockedReservation[];
}

export default function StatsOverview({ data }: StatsOverviewProps) {
    const totalBlocked = data.length;
    const carsBlockedToday = data.filter(i => i.pickupdatetime.split(' ')[0] === new Date().toISOString().split('T')[0]).length;

    // Calculate most common reason keyword (simple heuristic)
    const reasonCounts: { [key: string]: number } = {};
    data.forEach(item => {
        if (item.aclastname) {
            const words = item.aclastname.split(' ');
            const firstWord = words[0]?.replace(/[^a-zA-Z]/g, '') || 'Unknown';
            if (firstWord.length > 3) {
                reasonCounts[firstWord] = (reasonCounts[firstWord] || 0) + 1;
            }
        }
    });
    const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const statItems = [
        { label: 'Total Blocked', value: totalBlocked, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-200 dark:border-indigo-500/20' },
        { label: 'Cars Blocked Today', value: carsBlockedToday, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20' },
        { label: 'Primary Issues', value: topReason, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/20' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {statItems.map((stat, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-4 rounded-xl border ${stat.bg} ${stat.border} backdrop-blur-sm shadow-sm dark:shadow-lg transition-colors`}
                >
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                    <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
                </motion.div>
            ))}
        </div>
    );
}
