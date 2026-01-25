import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Heart, Globe, Shield, FileText } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      {/* Main Footer Section */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <Heart className="w-4 h-4 text-white fill-current" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white font-display">Astro360</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
              Blending ancient Vedic wisdom with modern AI to provide deep, personalized astrological insights for your life's journey.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/home" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">Dashboard</Link></li>
              <li><Link to="/horoscope/daily" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">Daily Horoscope</Link></li>
              <li><Link to="/global/transits" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">Planetary Transits</Link></li>
              <li><Link to="/tools/sade-sati" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">Sade Sati Analysis</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/research" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">AI Astrology Lab</Link></li>
              <li><Link to="/style-guide" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">Style Guide</Link></li>
              <li><a href="#" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">Documentation</a></li>
              <li><a href="#" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">API Access</a></li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/help" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">Help Center</Link></li>
              <li><Link to="/contact" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">Contact Us</Link></li>
              <li><Link to="/privacy" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sub Footer Section */}
      <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
          <div className="flex items-center gap-6">
            <span>© {currentYear} Astro360 Inc. All rights reserved.</span>
            <span className="hidden md:inline text-slate-300 dark:text-slate-700">|</span>
            <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> English (US)</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Security</span>
            <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Release 2.0.6</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
