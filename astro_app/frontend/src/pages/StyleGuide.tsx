import MainLayout from '../components/layout/MainLayout';
import DashboardHeader from '../components/layout/DashboardHeader';
import { 
  Sparkles, Moon, Sun, Star, Heart, 
  Calendar, User, Settings 
} from 'lucide-react';

const StyleGuide = () => {
  return (
    <MainLayout title="Design System" breadcrumbs={['System', 'Style Guide']} showHeader={false}>
      <DashboardHeader activeTab="style-guide" />
      <div className="w-full space-y-16 pb-20 mt-10 px-8">
        
        {/* Introduction */}
        <div className="text-center space-y-4 py-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900">
            Astro360 Design System
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            A comprehensive guide to the visual language, components, and patterns used throughout the Astro360 application.
          </p>
        </div>

        {/* 1. Typography */}
        <section className="space-y-8">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">1</span>
              Typography
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-slate-400 uppercase tracking-wider font-bold">Display Headings</p>
                <h1 className="text-5xl font-display font-bold text-slate-900">Heading 1</h1>
                <h2 className="text-4xl font-display font-bold text-slate-900">Heading 2</h2>
                <h3 className="text-3xl font-display font-bold text-slate-900">Heading 3</h3>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-slate-400 uppercase tracking-wider font-bold">Body Text</p>
                <p className="text-lg text-slate-600">
                  Large body text (18px). Used for lead paragraphs and important content sections. 
                  The celestial sphere is an imaginary sphere of arbitrarily large radius.
                </p>
                <p className="text-base text-slate-600">
                  Base body text (16px). The default size for standard reading content. 
                  Astrology is a range of divinatory practices, recognized as pseudoscientific.
                </p>
                <p className="text-sm text-slate-500">
                  Small text (14px). Used for secondary information, metadata, and helper text.
                </p>
                <p className="text-xs text-slate-400">
                  Tiny text (12px). Used for labels, captions, and fine print.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Color Palette */}
        <section className="space-y-8">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-sm">2</span>
              Color Palette
            </h2>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900">Primary Colors (Celestial)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-24 rounded-xl bg-slate-900 shadow-lg"></div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-900">Cosmic Night</span>
                  <span className="text-slate-500">Slate 900</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-24 rounded-xl bg-indigo-600 shadow-lg"></div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-900">Nebula Indigo</span>
                  <span className="text-slate-500">Indigo 600</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-24 rounded-xl bg-purple-600 shadow-lg"></div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-900">Mystic Purple</span>
                  <span className="text-slate-500">Purple 600</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-24 rounded-xl bg-amber-400 shadow-lg"></div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-900">Solar Gold</span>
                  <span className="text-slate-500">Amber 400</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900">Backgrounds & Surfaces</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-24 rounded-xl bg-slate-50 border border-slate-200"></div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-900">Surface / Light</span>
                  <span className="text-slate-500">Slate 50</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-24 rounded-xl bg-white border border-slate-200 shadow-sm"></div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-900">Card / White</span>
                  <span className="text-slate-500">White</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Components */}
        <section className="space-y-8">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">3</span>
              Components
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Buttons */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900">Buttons</h3>
              <div className="flex flex-wrap gap-4 p-8 bg-slate-50 rounded-2xl border border-slate-100">
                <button className="btn-primary">
                  Primary Button
                </button>
                <button className="px-6 py-3 rounded-xl font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  Secondary Button
                </button>
                <button className="px-6 py-3 rounded-xl font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors">
                  Ghost Button
                </button>
              </div>
            </div>

            {/* Cards */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900">Cards</h3>
              <div className="card-base card-hover p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                    <Star className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Interactive Card</h4>
                    <p className="text-sm text-slate-500">Hover me to see the effect</p>
                  </div>
                </div>
                <p className="text-slate-600">
                  Cards are the primary container for content. They use the 'card-base' and 'card-hover' utility classes for consistent styling.
                </p>
              </div>
            </div>

            {/* Form Elements */}
            <div className="space-y-6 md:col-span-2">
              <h3 className="text-lg font-semibold text-slate-900">Form Elements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="demo-input" className="text-sm font-bold text-slate-700">Input Field</label>
                    <input 
                      id="demo-input"
                      type="text" 
                      placeholder="Enter your name" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="demo-select" className="text-sm font-bold text-slate-700">Select Menu</label>
                    <select id="demo-select" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white">
                      <option>Option 1</option>
                      <option>Option 2</option>
                      <option>Option 3</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <label htmlFor="demo-checkbox" className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-indigo-300 transition-colors">
                    <input id="demo-checkbox" type="checkbox" className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300" defaultChecked />
                    <span className="font-medium text-slate-700">Checkbox Option</span>
                  </label>
                  <label htmlFor="demo-radio" className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-indigo-300 transition-colors">
                    <input id="demo-radio" type="radio" name="radio" className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300" defaultChecked />
                    <span className="font-medium text-slate-700">Radio Option 1</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Alerts & Status */}
            <div className="space-y-6 md:col-span-2">
              <h3 className="text-lg font-semibold text-slate-900">Alerts & Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="font-medium">Success Message</span>
                </div>
                <div className="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  <span className="font-medium">Error Message</span>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="font-medium">Warning Message</span>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span className="font-medium">Info Message</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Iconography */}
        <section className="space-y-8">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-sm">4</span>
              Iconography
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[Sparkles, Moon, Sun, Star, Heart, Calendar, User, Settings].map((Icon, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <Icon className="w-8 h-8 text-slate-700 mb-3" />
                <span className="text-xs font-medium text-slate-500">{Icon.name || 'Icon'}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Animations */}
        <section className="space-y-8">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center text-sm">5</span>
              Animations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Fade In</h3>
              <div className="h-32 bg-indigo-500 rounded-xl animate-fade-in flex items-center justify-center text-white font-medium">
                animate-fade-in
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Slide Up</h3>
              <div className="h-32 bg-purple-500 rounded-xl animate-slide-up flex items-center justify-center text-white font-medium">
                animate-slide-up
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Float</h3>
              <div className="h-32 bg-amber-400 rounded-xl animate-float flex items-center justify-center text-white font-medium">
                animate-float
              </div>
            </div>
          </div>
        </section>

        {/* 6. Gradients & Effects */}
        <section className="space-y-8">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center text-sm">6</span>
              Gradients & Effects
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Celestial Gradient</h3>
              <div className="h-32 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-900 shadow-xl flex items-center justify-center text-white/80 font-medium">
                from-slate-900 to-indigo-900
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Mystic Gradient</h3>
              <div className="h-32 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-xl flex items-center justify-center text-white/80 font-medium">
                from-indigo-500 to-purple-500
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Solar Gradient</h3>
              <div className="h-32 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl flex items-center justify-center text-white/80 font-medium">
                from-amber-400 to-orange-500
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Glass Effect</h3>
              <div className="h-32 rounded-xl bg-slate-900 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-50"></div>
                <div className="relative z-10 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white font-medium">
                  backdrop-blur-md
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Inner Glow</h3>
              <div className="h-32 rounded-xl bg-slate-900 shadow-[inset_0_0_20px_rgba(99,102,241,0.5)] flex items-center justify-center text-indigo-300 font-medium">
                inset shadow
              </div>
            </div>
          </div>
        </section>

      </div>
    </MainLayout>
  );
};

export default StyleGuide;
