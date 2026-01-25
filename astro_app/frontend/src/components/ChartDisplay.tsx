interface Planet {
  name: string;
  longitude: number;
  zodiac_sign: string;
  nakshatra: string;
  house: number;
  is_retrograde: boolean;
}

interface ChartData {
  ascendant: {
    zodiac_sign: string;
    nakshatra: string;
    longitude: number;
  };
  planets: Planet[];
}

const ChartDisplay = ({ data }: { data: ChartData }) => {
  if (!data) return null;

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden mt-6">
      <div className="bg-indigo-600 px-6 py-4">
        <h3 className="text-xl font-bold text-white">Birth Chart Details</h3>
        <p className="text-indigo-100">Ascendant: {data.ascendant.zodiac_sign} ({data.ascendant.nakshatra})</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Planet
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Sign
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                House
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Nakshatra
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {data.planets.map((planet) => (
              <tr key={planet.name}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">{planet.name}</span>
                  </div>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{planet.zodiac_sign}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{planet.house}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{planet.nakshatra}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {planet.is_retrograde && (
                    <span className="relative inline-block px-3 py-1 font-semibold text-red-900 leading-tight">
                      <span aria-hidden className="absolute inset-0 bg-red-200 opacity-50 rounded-full"></span>
                      <span className="relative">Retrograde</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChartDisplay;
