import { Sunrise, Sunset, Moon, Star, Calendar } from 'lucide-react';
import { Panchang } from '../../types/periodAnalysis';

interface AlmanacHeaderProps {
    panchang: Panchang;
}

const AlmanacHeader = ({ panchang }: AlmanacHeaderProps) => {
    return (
        <div className="glass-card px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-sm mb-8">
            {/* Tithi */}
            <div className="flex items-center gap-3 min-w-[150px]">
                <div className="p-2 rounded-full bg-indigo-500/20 text-indigo-300">
                    <Moon className="w-4 h-4" />
                </div>
                <div>
                    <span className="block text-slate-500 text-xs uppercase tracking-wider">Tithi</span>
                    <span className="font-medium text-slate-200">{panchang.tithi.name}</span>
                </div>
            </div>

            {/* Nakshatra */}
            <div className="flex items-center gap-3 min-w-[150px]">
                <div className="p-2 rounded-full bg-purple-500/20 text-purple-300">
                    <Star className="w-4 h-4" />
                </div>
                <div>
                    <span className="block text-slate-500 text-xs uppercase tracking-wider">Nakshatra</span>
                    <span className="font-medium text-slate-200">{panchang.nakshatra.name}</span>
                </div>
            </div>

            {/* Yoga */}
            <div className="flex items-center gap-3 min-w-[150px]">
                <div className="p-2 rounded-full bg-blue-500/20 text-blue-300">
                    <Calendar className="w-4 h-4" />
                </div>
                <div>
                    <span className="block text-slate-500 text-xs uppercase tracking-wider">Yoga</span>
                    <span className="font-medium text-slate-200">{panchang.yoga.name}</span>
                </div>
            </div>

            {/* Sun Data */}
            <div className="flex items-center gap-6 border-l border-white/10 pl-6">
                <div className="flex items-center gap-2">
                    <Sunrise className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-300">{panchang.sunrise}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Sunset className="w-4 h-4 text-orange-400" />
                    <span className="text-slate-300">{panchang.sunset}</span>
                </div>
            </div>
        </div>
    );
};

export default AlmanacHeader;
