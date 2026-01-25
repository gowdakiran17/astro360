import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ChartProvider } from './context/ChartContext';
import { Loader2 } from 'lucide-react';

// Eager load critical components
import MainLayout from './components/layout/MainLayout';
import LoadingSpinner from './components/LoadingSpinner';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MatchMaking from './pages/MatchMaking';
import MyCharts from './pages/MyCharts';
import HomeDashboard from './pages/HomeDashboard';
import PeriodAnalysisPage from './pages/PeriodAnalysisPage';
import ChartRectification from './pages/ChartRectification';
import EventsCalibration from './pages/EventsCalibration';
import ZodiacCalibration from './pages/ZodiacCalibration';
import BiodataCalibration from './pages/BiodataCalibration';
import Shodashvarga from './pages/Shodashvarga';
import AshtakvargaStrength from './pages/AshtakvargaStrength';
import ShadbalaEnergy from './pages/ShadbalaEnergy';
import VimshottariDasha from './pages/VimshottariDasha';
import ShadowPlanets from './pages/ShadowPlanets';
import Transits from './pages/Transits';
import LivePanchang from './pages/LivePanchang';
import Muhurata from './pages/Muhurata';
import ChartCompatibility from './pages/ChartCompatibility';
import StyleGuide from './pages/StyleGuide';
import ZodiacProfile from './pages/ZodiacProfile';
import DailyHoroscope from './pages/DailyHoroscope';
import UserProfile from './pages/UserProfile';
import CosmicHub from './pages/CosmicHub';
import BusinessIntelligence from './pages/BusinessIntelligence';
import MarketTiming from './pages/MarketTiming';
import GannIntelligence from './pages/GannIntelligence';
import CryptoStocksDashboard from './pages/CryptoStocksDashboard';
import RealTimeTrading from './pages/RealTimeTrading';

// Lazy load feature modules (Tools)
const Research = lazy(() => import('./pages/Research'));
const VastuCompass = lazy(() => import('./pages/VastuCompass'));
const Gemstones = lazy(() => import('./pages/Gemstones'));
const Numerology = lazy(() => import('./pages/Numerology'));
const SadeSati = lazy(() => import('./pages/SadeSati'));
const BlueprintDashboard = lazy(() => import('./pages/BlueprintDashboard'));
const ReportDashboard = lazy(() => import('./pages/ReportDashboard')); // Premium Reports
const PersonalVastu = lazy(() => import('./pages/PersonalVastu')); // New Feature
const KPAstrology = lazy(() => import('./pages/KPAstrology'));

// Loading Fallback
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900">
    <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Allow unauthenticated access locally or check user
  // For demo purposes, we might be lenient or strict based on auth setup
  if (!user) {
    // return <Navigate to="/login" />; // Uncomment to enforce auth
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <ChartProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Main App Routes */}
                <Route path="/" element={<Navigate to="/home" replace />} />

                <Route path="/home" element={
                  <MainLayout title="Vedic Dashboard" breadcrumbs={['Home']} showHeader={false} disableContentPadding={true}>
                    <HomeDashboard />
                  </MainLayout>
                } />

                <Route path="/my-charts" element={
                  <ProtectedRoute>
                    <MyCharts />
                  </ProtectedRoute>
                } />

                {/* Cosmic Intelligence Hub */}
                <Route path="/cosmic" element={
                  <ProtectedRoute>
                    <CosmicHub />
                  </ProtectedRoute>
                } />
                <Route path="/cosmic/business" element={
                  <ProtectedRoute>
                    <BusinessIntelligence />
                  </ProtectedRoute>
                } />
                <Route path="/cosmic/business/market-timing" element={
                  <ProtectedRoute>
                    <MarketTiming />
                  </ProtectedRoute>
                } />

                <Route path="/cosmic/business/gann" element={
                  <ProtectedRoute>
                    <GannIntelligence />
                  </ProtectedRoute>
                } />

                <Route path="/cosmic/business/crypto-stocks" element={
                  <ProtectedRoute>
                    <CryptoStocksDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/cosmic/business/real-time" element={
                  <ProtectedRoute>
                    <RealTimeTrading />
                  </ProtectedRoute>
                } />

                {/* Advanced Analytics */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />

                {/* Research Module */}
                <Route path="/research" element={
                  <ProtectedRoute>
                    <Research />
                  </ProtectedRoute>
                } />

                {/* Vastu Compass */}
                <Route path="/vastu" element={
                  <ProtectedRoute>
                    <VastuCompass />
                  </ProtectedRoute>
                } />

                <Route path="/vastu/personal" element={
                  <ProtectedRoute>
                    <PersonalVastu />
                  </ProtectedRoute>
                } />

                {/* Tools Routes */}
                <Route path="/tools">
                  <Route path="vastu" element={<ProtectedRoute><VastuCompass /></ProtectedRoute>} />
                  <Route path="gems" element={<ProtectedRoute><Gemstones /></ProtectedRoute>} />
                  <Route path="numerology" element={<ProtectedRoute><Numerology /></ProtectedRoute>} />
                  <Route path="numerology/blueprint" element={<ProtectedRoute><BlueprintDashboard /></ProtectedRoute>} />
                  <Route path="sade-sati" element={
                    <ProtectedRoute>
                      <SadeSati />
                    </ProtectedRoute>
                  } />
                  <Route path="match" element={<ProtectedRoute><MatchMaking /></ProtectedRoute>} />
                  <Route path="rectification" element={<ProtectedRoute><ChartRectification /></ProtectedRoute>} />
                  <Route path="calibration" element={<ProtectedRoute><EventsCalibration /></ProtectedRoute>} />
                  <Route path="zodiac" element={<ProtectedRoute><ZodiacCalibration /></ProtectedRoute>} />
                  <Route path="biodata" element={<ProtectedRoute><BiodataCalibration /></ProtectedRoute>} />
                  <Route path="period-analysis" element={<ProtectedRoute><PeriodAnalysisPage /></ProtectedRoute>} />
                </Route>

                {/* Reports */}
                <Route path="/reports/premium" element={<ProtectedRoute><ReportDashboard /></ProtectedRoute>} />

                {/* Advanced Calculations Routes */}
                <Route path="/calculations/shodashvarga" element={<ProtectedRoute><Shodashvarga /></ProtectedRoute>} />
                <Route path="/calculations/ashtakvarga" element={<ProtectedRoute><AshtakvargaStrength /></ProtectedRoute>} />
                <Route path="/calculations/shadbala" element={<ProtectedRoute><ShadbalaEnergy /></ProtectedRoute>} />
                <Route path="/calculations/kp-astrology" element={<ProtectedRoute><KPAstrology /></ProtectedRoute>} />
                <Route path="/calculations/vimshottari" element={<ProtectedRoute><VimshottariDasha /></ProtectedRoute>} />
                <Route path="/calculations/shadow-planets" element={<ProtectedRoute><ShadowPlanets /></ProtectedRoute>} />

                {/* Global Features */}
                <Route path="/global/transits" element={<ProtectedRoute><Transits /></ProtectedRoute>} />
                <Route path="/global/panchang" element={<ProtectedRoute><LivePanchang /></ProtectedRoute>} />
                <Route path="/global/muhurata" element={<ProtectedRoute><Muhurata /></ProtectedRoute>} />
                <Route path="/global/matching" element={<ProtectedRoute><ChartCompatibility /></ProtectedRoute>} />

                {/* Design System & Deliverables */}
                <Route path="/style-guide" element={<StyleGuide />} />
                <Route path="/zodiac/profile" element={<ZodiacProfile />} />
                <Route path="/horoscope/daily" element={<DailyHoroscope />} />
                <Route path="/account/profile" element={<UserProfile />} />

                {/* Fallbacks */}
                <Route path="/tools/*" element={<ProtectedRoute><HomeDashboard /></ProtectedRoute>} />
                <Route path="/calculations/*" element={<ProtectedRoute><MyCharts /></ProtectedRoute>} />
                <Route path="/global/*" element={<ProtectedRoute><MyCharts /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </Suspense>
          </ChartProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
