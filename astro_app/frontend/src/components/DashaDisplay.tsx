import { Clock } from 'lucide-react';

interface DashaData {
  current_mahadasha: string;
  current_antardasha: string;
  antardasha_end_date: string;
  mahadasha_end_date: string;
}

const DashaDisplay = ({ data }: { data: DashaData | null }) => {
  if (!data) return null;

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden mt-6">
      <div className="bg-purple-600 px-6 py-4 flex items-center">
        <Clock className="h-6 w-6 text-white mr-2" />
        <h3 className="text-xl font-bold text-white">Vimshottari Dasha Timeline</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Mahadasha */}
          <div className="bg-purple-50 rounded-lg p-5 border border-purple-100">
            <h4 className="text-sm uppercase tracking-wide text-purple-600 font-semibold mb-2">Current Mahadasha</h4>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900">{data.current_mahadasha}</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Ends on: <span className="font-medium text-gray-900">{data.mahadasha_end_date}</span>
            </div>
          </div>

          {/* Current Antardasha */}
          <div className="bg-indigo-50 rounded-lg p-5 border border-indigo-100">
            <h4 className="text-sm uppercase tracking-wide text-indigo-600 font-semibold mb-2">Current Antardasha</h4>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900">{data.current_antardasha}</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Ends on: <span className="font-medium text-gray-900">{data.antardasha_end_date}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gray-50 rounded p-4 text-sm text-gray-600">
          <p>
            You are currently experiencing the major influence of <strong>{data.current_mahadasha}</strong> with the sub-influence of <strong>{data.current_antardasha}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashaDisplay;
