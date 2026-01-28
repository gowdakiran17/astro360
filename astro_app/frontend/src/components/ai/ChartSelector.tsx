import React from 'react';
import { useChart } from '../../context/ChartContext';

interface ChartSelectorProps {
    onSelect: (chart: any) => void;
    selectedChart?: any;
}

const ChartSelector: React.FC<ChartSelectorProps> = ({ onSelect, selectedChart }) => {
    const { availableProfiles, currentProfile } = useChart();

    return (
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Select a chart to analyze
            </label>
            <select
                onChange={(e) => {
                    const chart = availableProfiles.find(p => p.id === parseInt(e.target.value));
                    if (chart) onSelect(chart);
                }}
                value={selectedChart?.id || currentProfile?.raw?.id || ''}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
                <option value="">Choose your chart...</option>
                {availableProfiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                        {profile.first_name} {profile.last_name} - {profile.date_str}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default ChartSelector;
