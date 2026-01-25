import { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Plus, Target, Scroll, Compass, MessageSquare, Search, Edit2, Star, ArrowUpDown } from 'lucide-react';
import CreateChartModal from '../components/CreateChartModal';
import { useNavigate } from 'react-router-dom';
import { useChartSettings } from '../context/ChartContext';

const MyCharts = () => {
  const navigate = useNavigate();
  const { availableProfiles, isLoadingProfiles, refreshProfiles, switchProfile } = useChartSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSwitch = (chart: any) => {
    switchProfile(chart);
    navigate('/home');
  };

  const filteredCharts = availableProfiles.filter(chart => {
    const query = searchQuery.toLowerCase();
    const fullName = `${chart.first_name} ${chart.last_name}`.toLowerCase();
    const location = (chart.location_name || '').toLowerCase();
    return fullName.includes(query) || location.includes(query);
  });

  const EmptyState = () => (
    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
      <div className="mb-6 flex justify-center">
        <div className="relative">
          <SparklesIcon className="w-12 h-12 text-yellow-400 animate-pulse" />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-slate-900 mb-4">Welcome to Vedic Astrology</h1>
      <p className="text-slate-500 max-w-2xl mx-auto mb-12 text-lg">
        Experience the most precise Vedic astrology calculations. Generate authentic birth
        charts with advanced planetary positions and traditional techniques.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <FeatureCard
          icon={Target}
          title="To-the-Second Precision"
          description="Astronomical accuracy beyond anything seen"
          color="bg-red-500"
        />
        <FeatureCard
          icon={Scroll}
          title="Ancient Text Predictions"
          description="Full breadth of Vedic wisdom & techniques"
          color="bg-purple-600"
        />
        <FeatureCard
          icon={Compass}
          title="Complete Divisionals"
          description="All Varga charts & traditional methods"
          color="bg-slate-500"
        />
        <FeatureCard
          icon={MessageSquare}
          title="Ask & Receive"
          description="Predictions, remedies from sacred texts"
          color="bg-slate-400"
        />
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center mx-auto shadow-lg shadow-slate-200"
      >
        <Plus className="w-5 h-5 mr-2" />
        Create Your First Chart
      </button>

      <p className="mt-6 text-slate-400 text-sm">
        Join thousands discovering their cosmic blueprint
      </p>
    </div>
  );

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Top Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-slate-700 font-semibold mb-1">My Charts</h2>
            <p className="text-slate-500 text-sm">
              {isLoadingProfiles ? 'Loading...' : `${availableProfiles.length} charts`} • Set default chart for login • Switch to any chart to view
            </p>
          </div>
        </div>

        {!isLoadingProfiles && availableProfiles.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:placeholder-slate-500 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 sm:text-sm shadow-sm"
                placeholder="Search charts by name, location, or date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <div className="flex items-center cursor-pointer hover:text-slate-700">
                          Name
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <div className="flex items-center cursor-pointer hover:text-slate-700">
                          Location
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <div className="flex items-center cursor-pointer hover:text-slate-700">
                          Birth Date
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Birth Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <div className="flex items-center cursor-pointer hover:text-slate-700">
                          Created
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredCharts.map((chart) => (
                      <tr key={chart.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-bold text-slate-900">
                              {chart.first_name} {chart.last_name}
                            </div>
                            {chart.is_default && (
                              <Star className="w-3 h-3 text-orange-400 fill-current ml-2" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          <div className="flex items-center">
                            <Compass className="w-3 h-3 mr-1 text-slate-400" />
                            {chart.location_name || 'Unknown Location'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {chart.date_str}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {chart.time_str}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {new Date(chart.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleSwitch(chart)}
                              className="text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1 rounded-md text-xs font-bold transition-colors"
                            >
                              Switch
                            </button>
                            <button className="text-slate-400 hover:text-slate-600 p-1">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center shadow-lg shadow-slate-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Chart
            </button>
          </div>
        )}
      </div>

      <CreateChartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onChartCreated={refreshProfiles}
      />
    </MainLayout>
  );
};

const FeatureCard = ({ icon: Icon, title, description, color }: any) => (
  <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 flex flex-col items-center text-center hover:shadow-md transition-all duration-300">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-slate-900 font-bold mb-2">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
  </div>
);

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

export default MyCharts;
