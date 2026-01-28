import { NavLink } from 'react-router-dom';
import {
  Home, Star, Sparkles, Calendar, Zap, Compass,
  Grid, BarChart2, Moon, Globe, Sunrise, Clock, Users, Layers, Layout,
  Briefcase, PanelLeftClose, PanelLeftOpen, X, Cpu, MessageSquare
} from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
  isMobileOpen?: boolean;
  closeMobile?: () => void;
}

const MENU_ITEMS = [
  {
    section: 'Dashboard',
    items: [
      { to: '/home', icon: Home, label: 'Home' },
      { to: '/my-charts', icon: Star, label: 'My Charts' },
      { to: '/ai-insights', icon: Sparkles, label: 'VedaAI', badge: 'AI' },
      { to: '/ai-chat', icon: MessageSquare, label: 'AI Chat', badge: 'AI' },
      { to: '/llm-studio', icon: Cpu, label: 'LLM Studio', badge: 'DEV' },
      { to: '/research', icon: Sparkles, label: 'AI Astrology Lab', badge: 'AI' },
    ]
  },
  {
    section: 'Cosmic Intelligence Hub',
    items: [
      { to: '/cosmic/business', icon: Briefcase, label: 'Business & Finance' },
    ]
  },
  {
    section: 'Forecasts',
    items: [
      { to: '/tools/period-analysis', icon: Calendar, label: 'Period Analysis', badge: 'AI', title: 'Mahadasha + Antardasha' },
      { to: '/tools/sade-sati', icon: Moon, label: 'Sade Sati' },
      { to: '/calculations/vimshottari', icon: Clock, label: 'Vimshottari Dasha' },
      { to: '/global/transits', icon: Globe, label: 'Current Transits' },
    ]
  },
  {
    section: 'Astro Vastu Features',
    items: [
      { to: '/vastu/personal', icon: Compass, label: 'Personal Compass', badge: 'NEW' },
      { to: '/vastu', icon: Layout, label: 'Home Vastu Engine', badge: 'PRO' },
    ]
  },
  {
    section: 'Corrections & Remedies',
    items: [
      { to: '/tools/gems', icon: Grid, label: 'Gemstones', badge: 'AI' },
      { to: '/tools/numerology', icon: Sparkles, label: 'Numerology' },
    ]
  },
  {
    section: 'Astro Metrics',
    badge: 'ADVANCED',
    items: [
      { to: '/calculations/shodashvarga', icon: Grid, label: 'Shodashvarga Charts' },
      { to: '/calculations/ashtakvarga', icon: BarChart2, label: 'Ashtakavarga Strength', title: 'Quantifies transit support for each house' },
      { to: '/calculations/shadbala', icon: Zap, label: 'Shadbala Energy', title: 'Measures planetary strength across six dimensions' },
      { to: '/calculations/kp-astrology', icon: Grid, label: 'KP Astrology', badge: 'NEW', title: 'Krishnamurti Padhdhati: Precision Predictive System' },
      { to: '/calculations/shadow-planets', icon: Layers, label: 'Shadow Planets', title: 'Hidden karmic influencers beyond classical planets' },
    ]
  },
  {
    section: 'Astro Calendar',
    items: [
      { to: '/global/panchang', icon: Sunrise, label: 'Panchang' },
      { to: '/global/muhurata', icon: Clock, label: 'Muhurtas' },
      { to: '/global/matching', icon: Users, label: 'Chart Compatibility' },
    ]
  }
];

const NavItem = ({ to, icon: Icon, label, active = false, badge, title, isCollapsed }: any) => (
  <NavLink
    to={to}
    title={isCollapsed ? label : title}
    className={({ isActive }) =>
      `flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-4'} py-2.5 text-sm font-medium rounded-xl transition-all duration-200 mb-1 group relative ${isActive || active
        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-indigo-400'
      }`
    }
  >
    <Icon className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${active ? 'text-white' : ''} ${!isCollapsed && 'mr-3'}`} />

    {!isCollapsed && (
      <>
        <span className="flex-1 truncate">{label}</span>
        {badge && (
          <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${badge.includes('AI')
            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
            : 'bg-slate-800 text-slate-500 border border-slate-700'
            }`}>
            {badge}
          </span>
        )}
      </>
    )}

    {/* Tooltip for collapsed state */}
    {isCollapsed && (
      <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
        {label}
      </div>
    )}
  </NavLink>
);

const Sidebar = ({ isCollapsed = false, toggleCollapse, isMobileOpen = false, closeMobile }: SidebarProps) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`
          fixed top-0 left-0 z-50 h-screen bg-slate-900 border-r border-slate-800 
          transition-all duration-300 ease-in-out flex flex-col shadow-2xl md:shadow-none
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        `}
      >
        {/* Logo Area */}
        <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-6'} border-b border-slate-800 flex-shrink-0 transition-all duration-300`}>
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/50 flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          {!isCollapsed && (
            <div className="ml-3 overflow-hidden whitespace-nowrap">
              <span className="text-xl font-bold text-white font-display tracking-tight">Astro360</span>
            </div>
          )}

          {/* Mobile Close Button */}
          <button
            onClick={closeMobile}
            className="md:hidden absolute right-4 p-1 text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 hover:scrollbar-thumb-slate-600">
          {MENU_ITEMS.map((section, idx) => (
            <div key={idx}>
              {!isCollapsed && (
                <div className="px-4 mb-2 flex items-center justify-between group">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-indigo-400 transition-colors">{section.section}</span>
                  {section.badge && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 font-medium">{section.badge}</span>}
                </div>
              )}
              {isCollapsed && idx > 0 && <div className="my-2 border-t border-slate-800 mx-2" />}

              <div className="space-y-0.5">
                {section.items.map((item, itemIdx) => (
                  <NavItem
                    key={itemIdx}
                    {...item}
                    isCollapsed={isCollapsed}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Toggle Button (Desktop Only) */}
        <div className="hidden md:flex p-3 border-t border-slate-800">
          <button
            onClick={toggleCollapse}
            className={`
              w-full flex items-center justify-center p-2 rounded-xl
              text-slate-400 hover:text-indigo-400 
              hover:bg-slate-800/50 
              transition-all duration-200
            `}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
