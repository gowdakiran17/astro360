import { Sparkles } from 'lucide-react';

const TransitStatusBar = () => {
    return (
        <div className="bg-indigo-600 text-white px-0 py-3 flex justify-between items-center shadow-md">
            <div className="flex items-center space-x-4 overflow-hidden pl-4">
                <div className="flex items-center whitespace-nowrap">
                    <Sparkles className="w-4 h-4 mr-2 text-indigo-200 animate-pulse" />
                    <span className="font-bold text-indigo-100 uppercase tracking-wider text-xs mr-3">Current Transits:</span>
                </div>
                <div className="flex space-x-6 text-sm font-medium animate-marquee">
                    <span>Jupiter in Taurus (Direct)</span>
                    <span className="text-indigo-300">•</span>
                    <span>Saturn in Aquarius (Retrograde)</span>
                    <span className="text-indigo-300">•</span>
                    <span>Mars in Leo</span>
                </div>
            </div>
            <div className="text-xs font-semibold text-indigo-200 bg-indigo-700 px-3 py-1 rounded-full whitespace-nowrap">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
        </div>
    );
};

export default TransitStatusBar;
