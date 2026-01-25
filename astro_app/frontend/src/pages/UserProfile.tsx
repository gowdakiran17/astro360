import MainLayout from '../components/layout/MainLayout';
import { 
  User, Settings, CreditCard, Bell, 
  Shield, LogOut, Mail, 
  MapPin, Phone, Camera
} from 'lucide-react';

const UserProfile = () => {
  return (
    <MainLayout title="Account Settings" breadcrumbs={['Home', 'Account']}>
      <div className="max-w-5xl mx-auto pb-20">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Navigation */}
          <div className="space-y-6">
            <div className="card-base p-6 text-center">
              <div className="relative w-24 h-24 mx-auto mb-4 group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden border-4 border-white shadow-md">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full" />
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Kiran Gowda</h2>
              <p className="text-sm text-slate-500">Premium Member</p>
            </div>

            <div className="card-base overflow-hidden p-0">
              <div className="p-2">
                <nav className="space-y-1">
                  <a href="#" className="flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-medium text-sm">
                    <User className="w-4 h-4" /> Personal Info
                  </a>
                  <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium text-sm transition-colors">
                    <Settings className="w-4 h-4" /> Preferences
                  </a>
                  <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium text-sm transition-colors">
                    <CreditCard className="w-4 h-4" /> Subscription
                  </a>
                  <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium text-sm transition-colors">
                    <Bell className="w-4 h-4" /> Notifications
                  </a>
                  <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium text-sm transition-colors">
                    <Shield className="w-4 h-4" /> Security
                  </a>
                </nav>
              </div>
              <div className="border-t border-slate-100 p-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl font-medium text-sm transition-colors">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="card-base p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Edit</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">First Name</label>
                  <div className="text-slate-900 font-medium">Kiran</div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Name</label>
                  <div className="text-slate-900 font-medium">Gowda</div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <Mail className="w-4 h-4 text-slate-400" />
                    kiran@example.com
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <Phone className="w-4 h-4 text-slate-400" />
                    +1 (555) 123-4567
                  </div>
                </div>
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</label>
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    Bangalore, India
                  </div>
                </div>
              </div>
            </div>

            <div className="card-base p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Astrological Preferences</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                  <div>
                    <div className="font-bold text-slate-800">Chart Style</div>
                    <div className="text-xs text-slate-500">Visual representation of your chart</div>
                  </div>
                  <select className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium">
                    <option>North Indian (Diamond)</option>
                    <option>South Indian (Square)</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                  <div>
                    <div className="font-bold text-slate-800">Ayanamsa</div>
                    <div className="text-xs text-slate-500">Zodiac system calculation method</div>
                  </div>
                  <select className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium">
                    <option>Lahiri (Chitrapaksha)</option>
                    <option>Raman</option>
                    <option>KP</option>
                    <option>Tropical</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                  <div>
                    <div className="font-bold text-slate-800">Language</div>
                    <div className="text-xs text-slate-500">Preferred language for reports</div>
                  </div>
                  <select className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium">
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Kannada</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default UserProfile;
