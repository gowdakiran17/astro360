import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { Briefcase } from 'lucide-react';

const CosmicHub = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Business & Financial Intelligence',
      description: 'Strategic timing, market psychology, and corporate planning based on planetary cycles.',
      icon: Briefcase,
      path: '/cosmic/business',
      color: 'bg-indigo-100 text-indigo-600',
    },
    // Future sections can be added here
  ];

  return (
    <MainLayout title="Cosmic Intelligence Hub" breadcrumbs={['Cosmic Hub']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Cosmic Intelligence Hub</h1>
          <p className="text-slate-600 dark:text-slate-400">Advanced astrological insights for strategic decision making.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <div 
              key={section.title}
              onClick={() => navigate(section.path)}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-lg ${section.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <section.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {section.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {section.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default CosmicHub;
