import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Target, Star, Layers, Calendar, Clock,
    Sparkles, BarChart3, CheckCircle2, ArrowRight
} from 'lucide-react';

const KPDashboard: React.FC = () => {
    const navigate = useNavigate();

    const features = [
        {
            id: 'detailed-predictions',
            title: 'Detailed Predictions',
            subtitle: 'Deep Dive',
            description: 'Mercury Antardasha analysis with Star Lord connections and period activations',
            icon: Target,
            color: 'from-blue-500 to-blue-600',
            badge: 'Deep Dive',
            path: '/kp/detailed-predictions'
        },
        {
            id: 'precision-scoring',
            title: 'Precision Scoring',
            subtitle: 'Exclusive',
            description: 'Mathematical percentage scores (72% EXCELLENT) with color-coded ratings',
            icon: BarChart3,
            color: 'from-green-500 to-green-600',
            badge: 'Exclusive',
            path: '/kp/precision-scoring'
        },
        {
            id: 'potential-of-planet',
            title: 'Potential of Planet',
            subtitle: 'Destiny',
            description: 'Event potential checker: Job Promotion (YES), Foreign Travel (YES), Lottery (NO)',
            icon: Sparkles,
            color: 'from-purple-500 to-purple-600',
            badge: 'Destiny',
            path: '/kp/event-potential'
        },
        {
            id: '3-layer-script',
            title: '3-Layer Script',
            subtitle: 'Core Logic',
            description: 'Sun → Star Lord → Sub Lord breakdown for every planet',
            icon: Layers,
            color: 'from-orange-500 to-orange-600',
            badge: 'Core Logic',
            path: '/kp/three-layer-script'
        },
        {
            id: '5-year-timeline',
            title: '5-Year Timeline',
            subtitle: 'Roadmap',
            description: 'Complete Mahadasha-Antardasha timeline with exact dates',
            icon: Calendar,
            color: 'from-indigo-500 to-indigo-600',
            badge: 'Roadmap',
            path: '/kp/timeline'
        },
        {
            id: 'accurate-timing',
            title: 'Accurate Timing',
            subtitle: 'Precision',
            description: 'Sub-period analysis with quality ratings for every Antardasha',
            icon: Clock,
            color: 'from-pink-500 to-pink-600',
            badge: 'Precision',
            path: '/kp/accurate-timing'
        },
        {
            id: 'nakshatra-nadi',
            title: 'Nakshatra Nadi',
            subtitle: 'Specialized',
            description: "Pt. Dinesh Guruji's 3-Layer Decision Engine & Hit Theory analysis",
            icon: Star,
            color: 'from-amber-400 to-orange-500',
            badge: 'Specialized',
            path: '/kp/nakshatra-nadi'
        }
    ];

    const categoryReports = [
        { name: 'Career & Profession', icon: '💼', color: 'bg-blue-100 text-blue-700', path: '/kp/category/career' },
        { name: 'Love & Marriage', icon: '💕', color: 'bg-pink-100 text-pink-700', path: '/kp/category/love' },
        { name: 'Finance & Wealth', icon: '💰', color: 'bg-green-100 text-green-700', path: '/kp/category/finance' },
        { name: 'Property & Real Estate', icon: '🏠', color: 'bg-purple-100 text-purple-700', path: '/kp/category/property' },
        { name: 'Health & Wellness', icon: '🏥', color: 'bg-red-100 text-red-700', path: '/kp/category/health' },
        { name: 'Name & Fame', icon: '⭐', color: 'bg-yellow-100 text-yellow-700', path: '/kp/category/fame' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="text-center mb-6">
                    <div className="inline-block px-4 py-1 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 rounded-full text-sm font-semibold mb-4">
                        UNMATCHED DEPTH
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                        The Most Advanced KP Report Features
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                        We don't just give you a chart. We decode your destiny using the most precise predictive logic available today.
                    </p>
                </div>
            </div>

            {/* Main Features Grid */}
            <div className="max-w-7xl mx-auto mb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={feature.id}
                                onClick={() => navigate(feature.path)}
                                className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
                            >
                                {/* Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                                {/* Content */}
                                <div className="relative p-6">
                                    {/* Icon and Badge */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-semibold">
                                            {feature.badge}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                        {feature.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                                        {feature.description}
                                    </p>

                                    {/* Arrow */}
                                    <div className="flex items-center text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        <span className="text-sm font-semibold mr-2">Explore</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Category Reports Section */}
            <div className="max-w-7xl mx-auto mb-12">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Nakshatra KP Highlights
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Star Lord + Sub Lord logic with Mahadasha timelines. Get detailed insights for every life area.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryReports.map((category) => (
                            <div
                                key={category.name}
                                onClick={() => navigate(category.path)}
                                className={`${category.color} rounded-xl p-4 cursor-pointer hover:scale-105 transition-transform duration-200`}
                            >
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">{category.icon}</span>
                                    <span className="font-semibold">{category.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* My KP Chart */}
                    <div
                        onClick={() => navigate('/kp/chart')}
                        className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-8 text-white cursor-pointer hover:shadow-2xl transition-all duration-300"
                    >
                        <Star className="w-12 h-12 mb-4" />
                        <h3 className="text-2xl font-bold mb-2">My KP Chart</h3>
                        <p className="text-blue-100 mb-4">
                            View your complete KP chart with Star Lords, Sub Lords, and house cusps
                        </p>
                        <div className="flex items-center text-sm font-semibold">
                            <span>View Chart</span>
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                    </div>

                    {/* Complete Report */}
                    <div
                        onClick={() => navigate('/kp/complete-report')}
                        className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white cursor-pointer hover:shadow-2xl transition-all duration-300"
                    >
                        <CheckCircle2 className="w-12 h-12 mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Complete KP Report</h3>
                        <p className="text-purple-100 mb-4">
                            Get your full KP analysis with all features combined in one comprehensive report
                        </p>
                        <div className="flex items-center text-sm font-semibold">
                            <span>Generate Report</span>
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KPDashboard;
