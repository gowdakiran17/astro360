export interface VastuZone {
    name: string;
    full_name: string;
    startDegree: number;
    endDegree: number;
    element: 'Water' | 'Air' | 'Fire' | 'Earth' | 'Space';
    color: string; // Tailwind class
    attribute: string;
    planet: string;
    suitable_for: string[];
}

export const VASTU_ZONES: VastuZone[] = [
    { name: 'N', full_name: 'North', startDegree: 348.75, endDegree: 11.25, element: 'Water', color: 'bg-blue-500', attribute: 'Money & Opportunities', planet: 'Mercury', suitable_for: ['Entrance', 'Living', 'Locker', 'Mirror'] },
    { name: 'NNE', full_name: 'North-North-East', startDegree: 11.25, endDegree: 33.75, element: 'Water', color: 'bg-blue-400', attribute: 'Health & Immunity', planet: 'Moon', suitable_for: ['Medicine', 'Healing'] },
    { name: 'NE', full_name: 'North-East', startDegree: 33.75, endDegree: 56.25, element: 'Water', color: 'bg-blue-300', attribute: 'Clarity & Mind', planet: 'Jupiter', suitable_for: ['Temple', 'Meditation', 'Water Feature'] },
    { name: 'ENE', full_name: 'East-North-East', startDegree: 56.25, endDegree: 78.75, element: 'Air', color: 'bg-green-300', attribute: 'Fun & Recreation', planet: 'Jupiter', suitable_for: ['Living Room', 'Play Area'] },
    { name: 'E', full_name: 'East', startDegree: 78.75, endDegree: 101.25, element: 'Air', color: 'bg-green-500', attribute: 'Social Connections', planet: 'Sun', suitable_for: ['Entrance', 'Living', 'Guest Room'] },
    { name: 'ESE', full_name: 'East-South-East', startDegree: 101.25, endDegree: 123.75, element: 'Air', color: 'bg-green-600', attribute: 'Churning & Anxiety', planet: 'Venus', suitable_for: ['Toilet', 'Washing Machine', 'Dustbin'] },
    { name: 'SE', full_name: 'South-East', startDegree: 123.75, endDegree: 146.25, element: 'Fire', color: 'bg-red-500', attribute: 'Fire & Cash Liquidity', planet: 'Venus', suitable_for: ['Kitchen', 'Electric Meter'] },
    { name: 'SSE', full_name: 'South-South-East', startDegree: 146.25, endDegree: 168.75, element: 'Fire', color: 'bg-red-400', attribute: 'Power & Confidence', planet: 'Mars', suitable_for: ['Bedroom', 'Gym'] },
    { name: 'S', full_name: 'South', startDegree: 168.75, endDegree: 191.25, element: 'Fire', color: 'bg-red-600', attribute: 'Relaxation & Fame', planet: 'Mars', suitable_for: ['Bedroom', 'Office'] },
    { name: 'SSW', full_name: 'South-South-West', startDegree: 191.25, endDegree: 213.75, element: 'Earth', color: 'bg-yellow-500', attribute: 'Disposal & Expenditure', planet: 'Rahu', suitable_for: ['Toilet', 'Dustbin'] },
    { name: 'SW', full_name: 'South-West', startDegree: 213.75, endDegree: 236.25, element: 'Earth', color: 'bg-yellow-400', attribute: 'Relationships & Skills', planet: 'Rahu', suitable_for: ['Master Bedroom', 'Heavy Storage', 'Office'] },
    { name: 'WSW', full_name: 'West-South-West', startDegree: 236.25, endDegree: 258.75, element: 'Space', color: 'bg-gray-400', attribute: 'Studies & Savings', planet: 'Saturn', suitable_for: ['Study Table', 'Kids Room'] },
    { name: 'W', full_name: 'West', startDegree: 258.75, endDegree: 281.25, element: 'Space', color: 'bg-gray-500', attribute: 'Gains & Profits', planet: 'Saturn', suitable_for: ['Dining', 'Locker', 'Bedroom'] },
    { name: 'WNW', full_name: 'West-North-West', startDegree: 281.25, endDegree: 303.75, element: 'Space', color: 'bg-gray-300', attribute: 'Depression & Detox', planet: 'Moon', suitable_for: ['Toilet', 'Dustbin'] },
    { name: 'NW', full_name: 'North-West', startDegree: 303.75, endDegree: 326.25, element: 'Space', color: 'bg-gray-200', attribute: 'Support & Banking', planet: 'Moon', suitable_for: ['Guest Room', 'Store', 'Finished Goods'] },
    { name: 'NNW', full_name: 'North-North-West', startDegree: 326.25, endDegree: 348.75, element: 'Water', color: 'bg-blue-200', attribute: 'Attraction & Sex', planet: 'Mercury', suitable_for: ['Bedroom (Couples)'] },
];

export interface RoomRule {
    name: string;
    bestZones: string[];
    avoidZones: string[];
    description: string;
}

export const ROOM_RULES: RoomRule[] = [
    {
        name: 'Main Entrance',
        bestZones: ['N', 'NE', 'E', 'W', 'S', 'NW'], // Broadly
        avoidZones: ['SE', 'SW', 'SSW', 'WNW', 'ESE'],
        description: 'The entrance governs opportunities and energy flow.'
    },
    {
        name: 'Kitchen',
        bestZones: ['SE', 'SSE', 'S'],
        avoidZones: ['N', 'NE', 'SW'],
        description: 'The kitchen represents fire/energy. South-East is ideal.'
    },
    {
        name: 'Master Bedroom',
        bestZones: ['SW', 'S', 'W'],
        avoidZones: ['NE', 'SE', 'ESE', 'SSW', 'WNW'],
        description: 'Stability is key here. South-West provides grounding.'
    },
    {
        name: 'Kids Bedroom',
        bestZones: ['W', 'E', 'NE', 'WSW'],
        avoidZones: ['SW', 'SSW'],
        description: 'Needs energetic but focused zones.'
    },
    {
        name: 'Toilet',
        bestZones: ['SSW', 'WNW', 'ESE'],
        avoidZones: ['NE', 'N', 'SW', 'SE', 'E'],
        description: 'Toilets represent disposal. Place in negative zones (Disposal, Detox).'
    },
    {
        name: 'Puja / Prayer',
        bestZones: ['NE', 'N', 'E', 'W'],
        avoidZones: ['S', 'SSW', 'Toilet Zones', 'Bedroom'],
        description: 'Needs high purity energy. North-East is best.'
    },
    {
        name: 'Office / Desk',
        bestZones: ['N', 'E', 'W', 'SW'],
        avoidZones: ['SSW', 'ESE', 'WNW'],
        description: 'North for Money, East for Connections, West for Gains.'
    },
    {
        name: 'Stairs',
        bestZones: ['S', 'SW', 'W'],
        avoidZones: ['NE', 'N', 'E', 'Brahmasthan'],
        description: 'Heavy element. Good in Earth/Space zones.'
    },
    {
        name: 'Water Tank',
        bestZones: ['N', 'NE', 'W', 'NW'], // Underground vs Overhead differs, simplifying for MVP
        avoidZones: ['SE', 'S', 'SW'],
        description: 'Water element. Avoid Fire zones.'
    },
    {
        name: 'Heavy Storage',
        bestZones: ['SW', 'S', 'W'],
        avoidZones: ['N', 'NE', 'E'],
        description: 'Earth element. Blocks energy if placed in lighter zones (N/NE).'
    },
    {
        name: 'Mirror',
        bestZones: ['N', 'E', 'NE'],
        avoidZones: ['S', 'SE', 'SW'],
        description: 'Water element extension. Avoid Fire/Earth zones.'
    },
    {
        name: 'Electronics',
        bestZones: ['SE', 'S', 'E'],
        avoidZones: ['NE', 'N'],
        description: 'Heat/Fire element. Best in Fire zones.'
    },
    // --- BUSINESS SPECIFIC ---
    {
        name: 'Cash Counter',
        bestZones: ['N', 'SE', 'NE'],
        avoidZones: ['SSW', 'WNW'],
        description: 'North for inflow, South-East for liquidity.'
    },
    {
        name: 'Owner Seat',
        bestZones: ['SW', 'S', 'W'],
        avoidZones: ['NE', 'NW'],
        description: 'South-West gives control and stability.'
    },
    {
        name: 'Staff Seating',
        bestZones: ['W', 'NW', 'SE'],
        avoidZones: ['NE', 'SW'],
        description: 'West/NW for support and execution.'
    },
    {
        name: 'Machinery',
        bestZones: ['SW', 'S', 'W'],
        avoidZones: ['NE', 'N'],
        description: 'Heavy element. South/South-West is best.'
    },
    {
        name: 'Raw Material',
        bestZones: ['SW', 'S'],
        avoidZones: ['NE'],
        description: 'Store heavy items in Earth zones.'
    },
    {
        name: 'Finished Goods',
        bestZones: ['NW'],
        avoidZones: ['SW', 'NE'],
        description: 'North-West (Air) helps in movement/sales.'
    }
];

export function getZoneFromHeading(heading: number): VastuZone | undefined {
    // Normalize heading to 0-360
    heading = heading % 360;
    if (heading < 0) heading += 360;

    return VASTU_ZONES.find(z => {
        if (z.name === 'N') {
            return heading >= 348.75 || heading < 11.25;
        }
        return heading >= z.startDegree && heading < z.endDegree;
    });
}
