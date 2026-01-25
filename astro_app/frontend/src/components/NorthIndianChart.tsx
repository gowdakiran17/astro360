export interface Planet {
  name: string;
  zodiac_sign: string;
  house: number;
}

export interface ChartData {
  ascendant: {
    zodiac_sign: string;
  };
  planets: Planet[];
}

const NorthIndianChart = ({ data }: { data: ChartData | null }) => {
  if (!data) return null;

  // Planet Colors based on the image style
  const planetColors: Record<string, string> = {
    "Su": "#FF0000", // Red
    "Mo": "#8A2BE2", // BlueViolet
    "Ma": "#006400", // DarkGreen (Matches image 'Ma' which looks dark green/black)
    "Me": "#00008B", // DarkBlue
    "Ju": "#800080", // Purple
    "Ve": "#006400", // DarkGreen
    "Sa": "#FF0000", // Red (Matches image 'Sa' which is red)
    "Ra": "#B22222", // FireBrick
    "Ke": "#8B4513", // SaddleBrown
    "Ur": "#FF0000", // Red
    "Ne": "#00008B", // DarkBlue
    "Pl": "#000000", // Black
  };

  const getPlanetColor = (name: string) => {
    return planetColors[name] || "#000000";
  };

  // House coordinates for PLANET text placement (approximate centers)
  const houseCenters = {
    1: { x: 200, y: 70 },
    2: { x: 100, y: 30 },
    3: { x: 30, y: 80 },
    4: { x: 80, y: 200 },
    5: { x: 30, y: 320 },
    6: { x: 100, y: 370 },
    7: { x: 200, y: 330 },
    8: { x: 300, y: 370 },
    9: { x: 370, y: 320 },
    10: { x: 320, y: 200 },
    11: { x: 370, y: 80 },
    12: { x: 300, y: 30 },
  };

  // Coordinates for SIGN NUMBERS (Tucked into the inner corners of each house)
  const signPositions = {
    1: { x: 200, y: 150 },  // Bottom of Top Diamond
    2: { x: 100, y: 85 },   // Bottom of Top Left Triangle
    3: { x: 85, y: 100 },   // Right of Top Left Corner
    4: { x: 150, y: 200 },  // Right of Left Diamond
    5: { x: 85, y: 300 },   // Right of Bottom Left Corner
    6: { x: 100, y: 315 },  // Top of Bottom Left Triangle
    7: { x: 200, y: 250 },  // Top of Bottom Diamond
    8: { x: 300, y: 315 },  // Top of Bottom Right Triangle
    9: { x: 315, y: 300 },  // Left of Bottom Right Corner
    10: { x: 250, y: 200 }, // Left of Right Diamond
    11: { x: 315, y: 100 }, // Left of Top Right Corner
    12: { x: 300, y: 85 },  // Bottom of Top Right Triangle
  };

  // Group planets by house
  const planetsByHouse: Record<number, string[]> = {};
  data.planets.forEach(p => {
    if (!planetsByHouse[p.house]) planetsByHouse[p.house] = [];
    planetsByHouse[p.house].push(p.name.substring(0, 2));
  });

  const zodiacOrder = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];

  const ascSign = data?.ascendant?.zodiac_sign || "Aries";
  const ascIndex = zodiacOrder.findIndex(z => z.toLowerCase() === ascSign.toLowerCase());

  const getSignForHouse = (houseNum: number) => {
    const signIndex = (ascIndex + (houseNum - 1)) % 12;
    return signIndex + 1;
  };

  return (
    <div className="flex justify-center my-6">
      <svg width="100%" height="100%" viewBox="0 0 400 400" className="stroke-amber-500/50 stroke-2 bg-transparent max-w-[400px] max-h-[400px]">
        {/* Outer Border */}
        <rect x="2" y="2" width="396" height="396" fill="none" className="stroke-amber-500/50 stroke-[3]" />

        {/* Cross Lines */}
        <line x1="0" y1="0" x2="400" y2="400" />
        <line x1="400" y1="0" x2="0" y2="400" />

        {/* Diamond Lines */}
        <line x1="200" y1="0" x2="0" y2="200" />
        <line x1="0" y1="200" x2="200" y2="400" />
        <line x1="200" y1="400" x2="400" y2="200" />
        <line x1="400" y1="200" x2="200" y2="0" />

        {/* Render House Contents */}
        {Object.entries(houseCenters).map(([houseStr, coords]) => {
          const houseNum = parseInt(houseStr);
          const signNum = getSignForHouse(houseNum);
          const planets = planetsByHouse[houseNum] || [];
          
          // Use specific sign position if available, otherwise fallback (though all should be covered)
          const signPos = signPositions[houseNum as keyof typeof signPositions] || coords;

          // Determine sign color based on house type (Angles vs others)
          // 1, 4, 7, 10 are Kendras (Angles) - Red in image? 
          // Image: 4 (H1), 1 (H4), 10 (H7), 7 (H10) are Red.
          // Others are Black/Blue? Image: 5, 6, 2, 3, 8, 9, 11, 12 are Black/Dark Blue.
          const isKendra = [1, 4, 7, 10].includes(houseNum);
          const signColor = isKendra ? "#FF0000" : "#000000"; // Red for Kendras, Black for others

          return (
            <g key={houseNum}>
              {/* Sign Number */}
              <text
                x={signPos.x}
                y={signPos.y}
                textAnchor="middle"
                className="font-bold"
                style={{ fontSize: '14px', fill: signColor, stroke: 'none' }}
              >
                {signNum}
              </text>

              {/* Planets List */}
              {planets.map((p, i) => (
                <text
                  key={p}
                  x={coords.x}
                  y={coords.y + (i * 18)}
                  textAnchor="middle"
                  className="font-bold"
                  style={{ fontSize: '16px', fill: getPlanetColor(p), stroke: 'none' }}
                >
                  {p}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default NorthIndianChart;
