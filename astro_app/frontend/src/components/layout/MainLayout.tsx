import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, LayoutGrid, AlertTriangle, Moon, Menu } from 'lucide-react';
import { useChartSettings } from '../../context/ChartContext';
import ProfileSelector from './ProfileSelector';

import { ThemeToggle } from '../ThemeToggle';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: string[];
  showHeader?: boolean;
  disableContentPadding?: boolean;
  theme?: 'default' | 'cosmic';
}

const MainLayout = ({ children, breadcrumbs = ['Home', 'Charts'], showHeader = true, disableContentPadding = false, theme = 'default' }: MainLayoutProps) => {
  const { logout } = useAuth();
  const { chartStyle, toggleChartStyle } = useChartSettings();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change or screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const bgClass = theme === 'cosmic'
    ? "bg-[#0B0F19] text-white"
    : "bg-slate-50 dark:bg-slate-900 cosmic-gradient";

  const headerClass = theme === 'cosmic'
    ? "bg-[#0B0F19]/80 backdrop-blur-md border-b border-white/10 text-white"
    : "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800";

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bgClass}`}>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        closeMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className={`${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} ml-0 flex flex-col min-h-screen transition-all duration-300`}>
        {/* Top Header Group - Sticky */}
        <div className="sticky top-0 z-20">
          {showHeader && (
            <>
              {/* Primary Navigation Bar */}
              <header className={`h-16 flex items-center justify-between px-4 md:px-8 transition-colors duration-300 ${headerClass}`}>
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                  <button
                    className="mr-4 md:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    onClick={() => setIsMobileMenuOpen(true)}
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                  <span className="font-medium text-slate-900 dark:text-white">Astro360</span>
                  <div className="hidden md:flex items-center">
                    {breadcrumbs.map((crumb, index) => (
                      <div key={`${crumb}-${index}`} className="flex items-center">
                        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
                        <span className={index === breadcrumbs.length - 1 ? "font-medium text-slate-900 dark:text-white" : ""}>
                          {crumb}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <ProfileSelector />
                  <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                  <button
                    onClick={toggleChartStyle}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition-all"
                    title={`Switch to ${chartStyle === 'NORTH_INDIAN' ? 'South' : 'North'} Indian Chart`}
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <ThemeToggle />
                  <div className="flex items-center text-slate-600 dark:text-slate-300 font-medium text-sm">
                    <span className="mr-1">EN</span>
                  </div>
                  <div className="h-8 w-8 bg-slate-900 dark:bg-indigo-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors shadow-lg">
                    <User className="w-4 h-4" />
                  </div>
                  <button onClick={logout} className="text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </header>

              {/* Secondary Status Bar - "Peak Period Indicator" */}
              <div className="h-10 bg-indigo-600 dark:bg-indigo-900 text-white flex items-center justify-between px-8 shadow-md relative z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900 opacity-50"></div>
                <div className="relative z-10 flex items-center gap-6 text-xs font-medium tracking-wide">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    <span>Major Transit: Saturn in Pisces</span>
                  </div>
                  <div className="hidden md:flex items-center gap-2 text-indigo-100">
                    <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                    <span>Peak Energy Window</span>
                  </div>
                </div>
                <div className="relative z-10 flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/10 rounded-full border border-white/20">
                    <Moon className="w-3 h-3 text-indigo-200" />
                    <span>Sade Sati: Check Status</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Main Content */}
        <main className={`flex-1 ${disableContentPadding ? '' : 'p-8'} text-slate-900 dark:text-slate-100`}>
          {children}
        </main>

        {/* Footer */}
        {/* <Footer /> */}
      </div>
    </div>
  );
};

export default MainLayout;
