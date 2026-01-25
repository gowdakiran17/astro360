import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Check, Plus } from 'lucide-react';
import { useChartSettings } from '../../context/ChartContext';

interface SavedChart {
  id?: number | string;
  first_name?: string;
  last_name?: string;
  name?: string;
  relation?: string;
}

const ProfileSelector = () => {
  const navigate = useNavigate();
  const { currentProfile, availableProfiles, switchProfile } = useChartSettings();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!currentProfile) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm transition-all duration-200"
      >
        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">
          {currentProfile.name[0]}
        </div>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block truncate max-w-[120px]">
          {currentProfile.name}
        </span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
             <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
               Active Profile
             </p>
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  {currentProfile.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {currentProfile.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {currentProfile.location}
                  </p>
                </div>
             </div>
          </div>

          <div className="py-2 max-h-64 overflow-y-auto custom-scrollbar">
            <p className="px-4 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Switch Profile
            </p>
            {availableProfiles.length === 0 ? (
                <div className="px-4 py-2 text-sm text-slate-500 text-center">
                    No other profiles found
                </div>
            ) : (
            availableProfiles.map((chart: SavedChart, i: number) => {
                  const chartName = chart.first_name ? `${chart.first_name} ${chart.last_name}` : (chart.name || 'My Chart');
                  // Use unique ID comparison if available, fallback to name
                  const isSelected = currentProfile.raw?.id && chart.id 
                    ? currentProfile.raw.id === chart.id 
                    : currentProfile.name === chartName;
                  
                  return (
                    <button
                      key={chart.id || i}
                      onClick={() => {
                        switchProfile(chart);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between group transition-colors ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${isSelected ? 'bg-indigo-100 text-indigo-600 border-indigo-600 dark:border-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent'}`}>
                  {chartName[0]}
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium truncate ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                      {chartName}
                    </p>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                  </div>
                  <p className="text-xs text-slate-400 truncate">
                    {chart.relation || 'Profile'}
                  </p>
                </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-600" />
                      )}
                    </button>
                  );
                })
            )}
          </div>
          
          <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-2 px-2">
            <button 
              onClick={() => {
                navigate('/charts/new');
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add New Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSelector;
