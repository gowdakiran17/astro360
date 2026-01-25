import { Sun } from 'lucide-react';

interface PanchangData {
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  day_of_week: string;
  sunrise: string;
  sunset: string;
}

const PanchangDisplay = ({ data }: { data: PanchangData | null }) => {
  if (!data) return null;

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden mt-6">
      <div className="bg-orange-500 px-6 py-4 flex items-center">
        <Sun className="h-6 w-6 text-white mr-2" />
        <h3 className="text-xl font-bold text-white">Vedic Panchang</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-gray-600 font-medium">Day</span>
              <span className="text-gray-900 font-bold">{data.day_of_week}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-gray-600 font-medium">Tithi (Lunar Day)</span>
              <span className="text-gray-900 font-bold">{data.tithi}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-gray-600 font-medium">Nakshatra</span>
              <span className="text-gray-900 font-bold">{data.nakshatra}</span>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-gray-600 font-medium">Yoga</span>
              <span className="text-gray-900 font-bold">{data.yoga}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-gray-600 font-medium">Karana</span>
              <span className="text-gray-900 font-bold">{data.karana}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-gray-600 font-medium">Sunrise / Sunset</span>
              <span className="text-gray-900 text-sm">{data.sunrise} / {data.sunset}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanchangDisplay;
