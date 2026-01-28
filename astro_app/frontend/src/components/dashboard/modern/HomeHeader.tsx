import React from 'react';
import { Share2, Download, MapPin } from 'lucide-react';

interface HomeHeaderProps {
  userName: string;
  location?: string;
  date?: string;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ userName, location = "New Delhi, IN" }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-2 gap-4 w-full">
      <div>
        <h1 className="text-4xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-700 dark:from-white dark:via-indigo-200 dark:to-indigo-400 mb-2 drop-shadow-sm">
          {getGreeting()}, {userName}
        </h1>
        <div className="flex items-center text-slate-600 dark:text-indigo-200/80 text-sm gap-4">
          <span className="flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse"></span>
             Based on your current planetary period
          </span>
          {location && (
            <span className="flex items-center gap-1.5 text-xs bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 px-3 py-1 rounded-full backdrop-blur-sm text-slate-700 dark:text-white font-medium shadow-sm dark:shadow-none">
              <MapPin className="w-3 h-3 text-indigo-500 dark:text-indigo-300" /> {location}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all backdrop-blur-sm shadow-sm dark:shadow-none">
          <Download className="w-4 h-4" />
          Export
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.5)] hover:shadow-[0_0_20px_rgba(99,102,241,0.7)] border border-indigo-400/50">
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  );
};

export default HomeHeader;
