import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Search, MapPin } from 'lucide-react';

interface CitySearchProps {
  onSelect: (data: { latitude: number; longitude: number; timezone: string; name?: string }) => void;
  label?: string;
}

interface Location {
  name: string;
  latitude: number;
  longitude: number;
  timezone_id: string;
  timezone_offset: string;
}

const CitySearch = ({ onSelect, label = "City / Place" }: CitySearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const response = await api.get(`/geo/search?q=${query}`);
          setResults(response.data);
          setShowDropdown(true);
        } catch (error) {
          console.error("Geocoding failed", error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (loc: Location) => {
    setQuery(loc.name);
    setShowDropdown(false);
    onSelect({
      latitude: loc.latitude,
      longitude: loc.longitude,
      timezone: loc.timezone_offset, // Passing offset as expected by backend (+HH:MM)
      name: loc.name
    });
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {label && <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>}
      <div className="relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-200 rounded-md py-2 border text-slate-900 placeholder-slate-400"
          placeholder="Search for a city..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setShowDropdown(true);
          }}
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white shadow-xl max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm border border-slate-100">
          {results.map((loc, index) => (
            <li
              key={index}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 text-slate-900 border-b border-slate-50 last:border-0"
              onClick={() => handleSelect(loc)}
            >
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
                <span className="font-normal block truncate">
                  {loc.name}
                </span>
              </div>
              <span className="text-xs text-slate-500 ml-6 block mt-0.5">
                {loc.timezone_id} ({loc.timezone_offset})
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CitySearch;
