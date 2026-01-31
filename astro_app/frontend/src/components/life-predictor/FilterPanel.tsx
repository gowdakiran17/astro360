import React from 'react';
import { Filter } from 'lucide-react';

interface FilterPanelProps {
    selectedHouses: number[];
    selectedPlanets: string[];
    selectedCategories: string[];
    onHousesChange: (houses: number[]) => void;
    onPlanetsChange: (planets: string[]) => void;
    onCategoriesChange: (categories: string[]) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
    selectedHouses,
    selectedPlanets,
    selectedCategories,
    onHousesChange,
    onPlanetsChange,
    onCategoriesChange
}) => {
    const houses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    const categories = ['Business', 'Health', 'Travel', 'Agriculture', 'Building', 'Remedies', 'Yoga', 'Dasha', 'General', 'Other'];

    const toggleHouse = (house: number) => {
        if (selectedHouses.includes(house)) {
            onHousesChange(selectedHouses.filter(h => h !== house));
        } else {
            onHousesChange([...selectedHouses, house]);
        }
    };

    const togglePlanet = (planet: string) => {
        if (selectedPlanets.includes(planet)) {
            onPlanetsChange(selectedPlanets.filter(p => p !== planet));
        } else {
            onPlanetsChange([...selectedPlanets, planet]);
        }
    };

    const toggleCategory = (category: string) => {
        if (selectedCategories.includes(category)) {
            onCategoriesChange(selectedCategories.filter(c => c !== category));
        } else {
            onCategoriesChange([...selectedCategories, category]);
        }
    };

    const selectAllHouses = () => onHousesChange(houses);
    const clearAllHouses = () => onHousesChange([]);
    const selectAllPlanets = () => onPlanetsChange(planets);
    const clearAllPlanets = () => onPlanetsChange([]);
    const selectAllCategories = () => onCategoriesChange(categories);
    const clearAllCategories = () => onCategoriesChange([]);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-md">
            <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 dark:text-white">Filters</h3>
            </div>

            {/* Houses */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Houses</span>
                    <div className="flex gap-2">
                        <button onClick={selectAllHouses} className="text-xs text-indigo-600 hover:underline">All</button>
                        <button onClick={clearAllHouses} className="text-xs text-slate-500 hover:underline">None</button>
                    </div>
                </div>
                <div className="grid grid-cols-6 gap-2">
                    {houses.map(house => (
                        <button
                            key={house}
                            onClick={() => toggleHouse(house)}
                            className={`px-2 py-1 text-xs rounded border transition-colors ${selectedHouses.includes(house)
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-indigo-400'
                                }`}
                        >
                            H{house}
                        </button>
                    ))}
                </div>
            </div>

            {/* Planets */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Planets</span>
                    <div className="flex gap-2">
                        <button onClick={selectAllPlanets} className="text-xs text-indigo-600 hover:underline">All</button>
                        <button onClick={clearAllPlanets} className="text-xs text-slate-500 hover:underline">None</button>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {planets.map(planet => (
                        <button
                            key={planet}
                            onClick={() => togglePlanet(planet)}
                            className={`px-2 py-1 text-xs rounded border transition-colors ${selectedPlanets.includes(planet)
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-indigo-400'
                                }`}
                        >
                            {planet}
                        </button>
                    ))}
                </div>
            </div>

            {/* Categories */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Categories</span>
                    <div className="flex gap-2">
                        <button onClick={selectAllCategories} className="text-xs text-indigo-600 hover:underline">All</button>
                        <button onClick={clearAllCategories} className="text-xs text-slate-500 hover:underline">None</button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => toggleCategory(category)}
                            className={`px-2 py-1 text-xs rounded border transition-colors ${selectedCategories.includes(category)
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-indigo-400'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FilterPanel;
