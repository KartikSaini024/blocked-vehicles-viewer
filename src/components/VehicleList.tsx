import { BlockedReservation } from '@/types';
import { motion } from 'framer-motion';

interface VehicleListProps {
    data: BlockedReservation[];
    loading: boolean;
}

export default function VehicleList({ data, loading }: VehicleListProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white/5 backdrop-blur-lg border border-white/5 h-48 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="inline-block p-4 rounded-full bg-slate-800/50 mb-4">
                    <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-xl font-medium text-slate-300">No blocked vehicles found</h3>
                <p className="text-slate-500 mt-2">Try adjusting your filters.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((item, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-slate-800 border border-slate-700 hover:bg-slate-750 hover:border-slate-600 transition-all duration-300 rounded-xl p-5 flex flex-col justify-between group shadow-lg"
                >
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                                    {item.registrationno || item.currentrcmregistrationno || 'Unknown Rego'}
                                </h3>
                                <p className="text-sm text-slate-300 font-mono tracking-wider bg-slate-900 px-2 py-0.5 rounded inline-block mt-1 border border-slate-700">
                                    {item.carDetails?.make || 'Unknown'} {item.carDetails?.model}
                                </p>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-900/30 text-red-300 border border-red-500/30">
                                Blocked
                            </span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-slate-200">
                                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Duration</p>
                                    <p className="font-medium">
                                        {item.pickupdatetime.split(' ')[0]} - {item.dropoffdatetime.split(' ')[0]}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-sm text-slate-200">
                                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Location</p>
                                    <p className="font-medium">{item.pickuplocation}</p>
                                </div>
                            </div>

                            {item.aclastname && (
                                <div className="pt-3 border-t border-slate-700 mt-3">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Reason / Notes</p>
                                    <p className="text-sm text-white italic bg-slate-900/50 p-2 rounded">"{item.aclastname}"</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 pt-3 flex justify-between items-center text-xs text-slate-400 border-t border-slate-700 font-medium">
                        <button
                            onClick={() => window.open(`https://bookings.rentalcarmanager.com/s_QuickReservation.aspx?ResNo=${item.reservationno}`, 'RCMReservation', 'width=1200,height=900,scrollbars=yes')}
                            className="hover:text-indigo-400 underline decoration-indigo-500/30 hover:decoration-indigo-500 transition-all flex items-center gap-1"
                        >
                            <span>Ref: {item.reservationno}</span>
                            <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </button>
                        <span>{item.rentaldays} Days</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
