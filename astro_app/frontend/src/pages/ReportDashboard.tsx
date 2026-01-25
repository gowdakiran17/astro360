// import React from 'react'; // React 17+ doesn't need import for JSX
import MainLayout from '../components/layout/MainLayout';
import { FileText, Lock } from 'lucide-react';

const ReportDashboard = () => {
    return (
        <MainLayout title="Premium Reports" breadcrumbs={['Reports', 'Premium']}>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="p-6 bg-indigo-50 dark:bg-slate-800 rounded-full">
                    <FileText className="w-12 h-12 text-indigo-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Premium Reports Dashboard</h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md">
                        Unlock detailed planetary insights, personalized remedies, and in-depth future predictions.
                    </p>
                </div>
                <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Unlock Access
                </button>
            </div>
        </MainLayout>
    );
};

export default ReportDashboard;
