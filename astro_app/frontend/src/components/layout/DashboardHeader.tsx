import { useNavigate } from 'react-router-dom';
import { Bell, LayoutGrid } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChartSettings } from '../../context/ChartContext';

interface DashboardHeaderProps {
  activeTab?: 'dashboard' | 'horoscope' | 'match' | 'transit' | 'style-guide';
  userName?: string;
}

const DashboardHeader = ({ activeTab = 'dashboard', userName }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { chartStyle, toggleChartStyle } = useChartSettings();
  
  const displayName = userName || (user?.email ? user.email.split('@')[0] : 'Guest');
  const initial = displayName.charAt(0).toUpperCase();

  const getTabClass = (tab: string) => 
    activeTab === tab 
      ? "px-6 py-2 rounded-full bg-white text-slate-900 font-semibold shadow-sm text-sm transition-all"
      : "px-6 py-2 rounded-full text-slate-500 hover:text-slate-900 font-medium text-sm transition-all";

  return (
    <div className="sticky top-0 z-50 bg-white/80 border-b border-slate-200/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="w-full px-8 h-20 flex items-center justify-between">
           <div className="flex items-center gap-3">
             {/* Logo Removed */}
           </div>
           
           <div className="hidden md:flex items-center bg-slate-100/50 p-1.5 rounded-full border border-slate-200/60">
             <button onClick={() => navigate('/home')} className={getTabClass('dashboard')}>Dashboard</button>
             <button onClick={() => navigate('/horoscope/daily')} className={getTabClass('horoscope')}>Horoscope</button>
             <button onClick={() => navigate('/global/matching')} className={getTabClass('match')}>Match</button>
             <button onClick={() => navigate('/global/transits')} className={getTabClass('transit')}>Transit</button>
             <button onClick={() => navigate('/style-guide')} className={getTabClass('style-guide')}>Style Guide</button>
           </div>

           <div className="flex items-center gap-4">
             <button 
                onClick={toggleChartStyle}
                className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                title={`Switch to ${chartStyle === 'NORTH_INDIAN' ? 'South' : 'North'} Indian Chart`}
             >
               <LayoutGrid className="w-5 h-5" />
             </button>

             <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all relative">
               <Bell className="w-5 h-5" />
               <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
             </button>
             <div className="h-8 w-px bg-slate-200"></div>
             <button onClick={() => navigate('/account/profile')} className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 transition-all group">
               <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 leading-none">{displayName}</p>
                  <p className="text-xs text-slate-500 font-medium">{user?.tier || 'Free Plan'}</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-white shadow-sm flex items-center justify-center text-indigo-700 font-bold text-sm group-hover:scale-105 transition-transform">
                 {initial}
               </div>
             </button>
           </div>
        </div>
      </div>
  );
};

export default DashboardHeader;
