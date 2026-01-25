import React, { useState, useRef, useEffect } from 'react';
import { Upload, RotateCw, ZoomIn, ZoomOut, Grid, Info, X } from 'lucide-react';
import { VASTU_ZONES } from '../../utils/vastuRules';

interface VastuZoneAssignment {
    zone: string;
    type: string;
}

interface VastuFloorPlanProps {
    onZonesChange?: (zones: VastuZoneAssignment[]) => void;
}

const VastuFloorPlan = ({ onZonesChange }: VastuFloorPlanProps) => {
    const [image, setImage] = useState<string | null>(null);
    const [viewScale, setViewScale] = useState(1);
    const [viewRotation, setViewRotation] = useState(0); // Rotate everything (view)
    const [gridRotation, setGridRotation] = useState(0); // Rotate only grid (North alignment)
    const [gridOffset, setGridOffset] = useState({ x: 0, y: 0 }); // Offset grid center
    
    const [gridType, setGridType] = useState<'3x3' | '16zones'>('16zones');
    const [selectedZone, setSelectedZone] = useState<string | null>(null);
    const [zoneAssignments, setZoneAssignments] = useState<Record<string, string[]>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Notify parent when assignments change
    useEffect(() => {
        if (onZonesChange) {
            const formattedZones: VastuZoneAssignment[] = [];
            Object.entries(zoneAssignments).forEach(([direction, types]) => {
                types.forEach(type => {
                    formattedZones.push({
                        zone: direction, // Backend expects 'zone'
                        type: type
                    });
                });
            });
            onZonesChange(formattedZones);
        }
    }, [zoneAssignments, onZonesChange]);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target?.result as string);
                // Reset View
                setViewScale(1);
                setViewRotation(0);
                setGridRotation(0);
                setGridOffset({ x: 0, y: 0 });
            };
            reader.readAsDataURL(file);
        }
    };

    // Helper to get slice path
    const getSlicePath = (startAngle: number, endAngle: number, radius: number, cx: number, cy: number) => {
        const startRad = (startAngle - 90) * Math.PI / 180;
        const endRad = (endAngle - 90) * Math.PI / 180;
        const x1 = cx + radius * Math.cos(startRad);
        const y1 = cy + radius * Math.sin(startRad);
        const x2 = cx + radius * Math.cos(endRad);
        const y2 = cy + radius * Math.sin(endRad);
        return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
    };

    const VastuGrid16 = () => {
        // Grid Center (in 0-100 coordinate space)
        const cx = 50 + gridOffset.x;
        const cy = 50 + gridOffset.y;
        
        return (
            <div 
                className="absolute inset-0 pointer-events-none overflow-visible transition-transform duration-200"
                style={{ transform: `rotate(${gridRotation}deg)` }}
            >
                 {/* Interactive SVG Overlay */}
                 <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-auto overflow-visible">
                    {VASTU_ZONES.map((_, i) => {
                        const angleStep = 22.5;
                        const startAngle = (i * angleStep) - (angleStep / 2);
                        const endAngle = startAngle + angleStep;
                        
                        const labels = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
                        const label = labels[i];
                        
                        const isSelected = selectedZone === label;

                        // Label Position
                        const midAngle = (startAngle + endAngle) / 2;
                        const labelRad = (midAngle - 90) * Math.PI / 180;
                        const lx = cx + 42 * Math.cos(labelRad);
                        const ly = cy + 42 * Math.sin(labelRad);

                        return (
                            <g key={i} onClick={() => setSelectedZone(label)} className="cursor-pointer group">
                                <path 
                                    d={getSlicePath(startAngle, endAngle, 50, cx, cy)} 
                                    fill={isSelected ? "rgba(79, 70, 229, 0.4)" : zoneAssignments[label] ? "rgba(16, 185, 129, 0.2)" : "transparent"}
                                    className="transition-all duration-200 hover:fill-indigo-500/20"
                                    stroke="rgba(99, 102, 241, 0.5)"
                                    strokeWidth="0.2"
                                />
                                {/* Label */}
                                <text 
                                    x={lx} 
                                    y={ly} 
                                    fontSize="3" 
                                    textAnchor="middle" 
                                    alignmentBaseline="middle"
                                    transform={`rotate(${-gridRotation}, ${lx}, ${ly})`} // Keep text upright relative to screen? Or rotate with grid? Let's keep upright relative to grid for now, but maybe counter-rotate if grid rotates? Actually, if grid rotates, text rotates. 
                                    className={`font-bold ${isSelected ? 'fill-white' : 'fill-indigo-900'} pointer-events-none`}
                                >
                                    {label}
                                </text>
                                {/* Icon if assigned */}
                                {zoneAssignments[label] && (
                                    <circle 
                                        cx={cx + 35 * Math.cos(labelRad)} 
                                        cy={cy + 35 * Math.sin(labelRad)}
                                        r="1.5"
                                        fill="#10b981"
                                    />
                                )}
                            </g>
                        );
                    })}
                    
                    {/* North Arrow Marker */}
                    <g transform={`translate(${cx}, ${cy - 55})`}>
                        <path d="M 0 0 L -2 4 L 2 4 Z" fill="red" />
                        <text x="0" y="-2" fontSize="4" textAnchor="middle" fill="red" fontWeight="bold">N</text>
                    </g>
                 </svg>

                {/* Center Brahma - Draggable Handle */}
                <div 
                    className="absolute w-6 h-6 bg-yellow-400 rounded-full -translate-x-1/2 -translate-y-1/2 z-20 shadow-md border-2 border-yellow-600 cursor-move pointer-events-auto hover:scale-110 transition-transform flex items-center justify-center"
                    style={{ 
                        left: `${cx}%`, 
                        top: `${cy}%`,
                        transform: `translate(-50%, -50%) rotate(${-gridRotation}deg)` // Counter rotate handle to keep it upright? No need.
                    }}
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        // Simple drag implementation
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const startGridX = gridOffset.x;
                        const startGridY = gridOffset.y;

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                            // Calculate delta in percentage relative to container size
                            // We need container ref, but assume 500px height/width roughly or calculate from target
                            // Let's use a rough estimate or try to get container
                            const container = (e.target as HTMLElement).closest('.relative-container');
                            if (!container) return;
                            const rect = container.getBoundingClientRect();
                            
                            const deltaX = ((moveEvent.clientX - startX) / rect.width) * 100;
                            const deltaY = ((moveEvent.clientY - startY) / rect.height) * 100;
                            
                            // Adjust for rotation? 
                            // If the grid is rotated, dragging X moves along rotated axis? 
                            // No, gridOffset is applied to SVG coordinates.
                            // But the Grid DIV is rotated by `gridRotation`.
                            // So if we drag RIGHT on screen, we want `cx` to increase?
                            // If Grid is rotated 90deg, increasing `cx` moves DOWN on screen.
                            // We need to map screen delta to grid delta.
                            
                            const rad = -gridRotation * Math.PI / 180; // Counter rotate
                            const rotDeltaX = deltaX * Math.cos(rad) - deltaY * Math.sin(rad);
                            const rotDeltaY = deltaX * Math.sin(rad) + deltaY * Math.cos(rad);

                            setGridOffset({
                                x: startGridX + rotDeltaX,
                                y: startGridY + rotDeltaY
                            });
                        };

                        const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                        };

                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                    }}
                >
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                </div>
            </div>
        );
    };

    const VastuGrid3x3 = () => {
        const cx = 50 + gridOffset.x;
        const cy = 50 + gridOffset.y;

        return (
            <div className="absolute inset-0 pointer-events-none">
                <div 
                    className="absolute w-full h-full opacity-50 border-2 border-red-500 grid grid-cols-3 grid-rows-3 transition-transform duration-200"
                    style={{ 
                        transform: `translate(${gridOffset.x}%, ${gridOffset.y}%) rotate(${gridRotation}deg)`
                    }}
                >
                    {/* 9 Zones for basic grid */}
                    {['NW (Air)', 'N (Water)', 'NE (Water)', 'W (Space)', 'Brahma', 'E (Sun)', 'SW (Earth)', 'S (Fire)', 'SE (Fire)'].map((z, i) => (
                        <div key={i} className="border border-red-500 flex items-center justify-center font-bold text-[10px] md:text-xs text-red-900 bg-white/10 text-center p-1">
                            {z}
                        </div>
                    ))}
                </div>

                 {/* Center Brahma - Draggable Handle (Same as 16 zone) */}
                 <div 
                    className="absolute w-6 h-6 bg-yellow-400 rounded-full -translate-x-1/2 -translate-y-1/2 z-20 shadow-md border-2 border-yellow-600 cursor-move pointer-events-auto hover:scale-110 transition-transform flex items-center justify-center"
                    style={{ 
                        left: `${cx}%`, 
                        top: `${cy}%`,
                        transform: `translate(-50%, -50%) rotate(${-gridRotation}deg)` 
                    }}
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const startGridX = gridOffset.x;
                        const startGridY = gridOffset.y;

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                            const container = (e.target as HTMLElement).closest('.relative-container');
                            if (!container) return;
                            const rect = container.getBoundingClientRect();
                            
                            const deltaX = ((moveEvent.clientX - startX) / rect.width) * 100;
                            const deltaY = ((moveEvent.clientY - startY) / rect.height) * 100;
                            
                            // For 3x3 grid (DOM elements), translation is direct x/y, 
                            // but rotation is applied to the container.
                            // If we drag visually right, we want the grid to move right visually.
                            // The grid is rotated by `gridRotation`.
                            // So we need to counter-rotate the delta.
                            
                            const rad = -gridRotation * Math.PI / 180;
                            const rotDeltaX = deltaX * Math.cos(rad) - deltaY * Math.sin(rad);
                            const rotDeltaY = deltaX * Math.sin(rad) + deltaY * Math.cos(rad);

                            setGridOffset({
                                x: startGridX + rotDeltaX,
                                y: startGridY + rotDeltaY
                            });
                        };

                        const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                        };

                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                    }}
                >
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                </div>
            </div>
        );
    };

    const ZoneCard = ({ zone }: { zone: string }) => {
        // Find details from the imported VASTU_ZONES
        const zoneData = VASTU_ZONES.find(z => z.name === zone);
        
        const details = zoneData ? {
            attribute: zoneData.attribute,
            element: zoneData.element,
            color: zoneData.color,
            best: zoneData.suitable_for?.join(", "),
            avoid: "See Analysis", // We will calculate specific avoids in backend or complex rules
            planet: zoneData.planet
        } : { attribute: 'Unknown', element: '-', color: '-', avoid: '-', best: '-', planet: '-' };

        const currentAssignments = zoneAssignments[zone] || [];

        // Expanded tagging list from user requirements
        const roomCategories = {
            "Main": ["Entrance", "Living", "Bedroom", "Kitchen", "Toilet"],
            "Utility": ["Store", "Stairs", "Water Tank", "Heavy Storage"],
            "Special": ["Temple", "Office", "Study", "Mirror", "Electronics"],
            "Structure": ["Door", "Cut", "Extension", "Fire Element"]
        };

        const toggleAssignment = (type: string) => {
            setZoneAssignments(prev => {
                const current = prev[zone] || [];
                if (current.includes(type)) {
                    return { ...prev, [zone]: current.filter(t => t !== type) };
                } else {
                    return { ...prev, [zone]: [...current, type] };
                }
            });
        };

        return (
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-indigo-100 animate-slide-up z-30 max-h-[60vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h4 className="font-black text-indigo-900 text-lg flex items-center gap-2">
                            {zoneData?.full_name || zone} ({zone})
                            <span className="text-xs font-normal bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{details.element}</span>
                        </h4>
                        <div className="flex gap-2 text-sm text-slate-600">
                            <span className="font-bold">{details.attribute}</span>
                            <span>•</span>
                            <span className="text-indigo-600">Planet: {details.planet}</span>
                        </div>
                    </div>
                    <button onClick={() => setSelectedZone(null)} className="p-1 hover:bg-slate-100 rounded-full">
                        <X className="w-4 h-4 text-slate-400" />
                    </button>
                </div>
                
                {/* Room Assignment */}
                <div className="mb-4">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Tag this zone (Select multiple)</p>
                    
                    <div className="space-y-3">
                        {Object.entries(roomCategories).map(([category, types]) => (
                            <div key={category}>
                                <p className="text-[10px] font-semibold text-slate-400 mb-1">{category}</p>
                                <div className="flex flex-wrap gap-2">
                                    {types.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => toggleAssignment(type)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                currentAssignments.includes(type)
                                                ? 'bg-indigo-600 text-white shadow-md' 
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {currentAssignments.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-slate-500">Selected:</span>
                                <div className="flex flex-wrap gap-1">
                                    {currentAssignments.map(t => (
                                        <span key={t} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => {
                                        const newZones = { ...zoneAssignments };
                                        delete newZones[zone];
                                        setZoneAssignments(newZones);
                                    }}
                                    className="self-start mt-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-100 text-rose-600 hover:bg-rose-200"
                                >
                                    Clear All Tags
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="bg-green-50 p-2 rounded-lg border border-green-100">
                        <span className="font-bold text-green-800 block mb-1">✅ Suitable For</span>
                        {details.best}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Grid className="w-5 h-5 text-indigo-600" />
                    Interactive Floor Plan
                </h3>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setGridType('16zones')}
                        className={`text-xs px-3 py-1.5 rounded-lg border ${gridType === '16zones' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
                    >
                        16 Zones
                    </button>
                    <button 
                        onClick={() => setGridType('3x3')}
                        className={`text-xs px-3 py-1.5 rounded-lg border ${gridType === '3x3' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
                    >
                        MahaVastu
                    </button>
                </div>
            </div>

            <div className="relative w-full h-[500px] bg-slate-100 overflow-hidden flex items-center justify-center">
                {!image ? (
                    <div className="text-center p-8">
                        <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 mb-4">Upload your floor plan to visualize Vastu zones</p>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Upload Image
                        </button>
                    </div>
                ) : (
                    <div className="relative w-full h-full flex items-center justify-center relative-container">
                        <div 
                            className="relative transition-transform duration-200 ease-out"
                            style={{ 
                                transform: `scale(${viewScale}) rotate(${viewRotation}deg)`,
                                maxWidth: '90%',
                                maxHeight: '90%'
                            }}
                        >
                            <img src={image} alt="Floor Plan" className="max-w-full max-h-full object-contain shadow-2xl" />
                            
                            {/* Overlay Grid */}
                            <div className="absolute inset-0 z-10 w-full h-full">
                                {gridType === '16zones' ? <VastuGrid16 /> : <VastuGrid3x3 />}
                            </div>
                        </div>
                        
                        {/* Zone Card Overlay (Fixed position relative to container, not rotated) */}
                        {selectedZone && <ZoneCard zone={selectedZone} />}
                    </div>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleUpload} 
                />
            </div>

            {/* Controls */}
            {image && (
                <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-4">
                    
                    {/* Grid Controls (North & Center) */}
                    <div className="flex flex-wrap items-center justify-center gap-6 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500 uppercase">Align North</span>
                            <button onClick={() => setGridRotation(r => r - 1)} className="p-1.5 hover:bg-slate-100 rounded border border-slate-200 text-xs font-bold">-1°</button>
                            <input 
                                type="range" 
                                min="0" 
                                max="360" 
                                value={gridRotation} 
                                onChange={(e) => setGridRotation(Number(e.target.value))}
                                className="w-32 h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 rounded-lg appearance-none cursor-pointer"
                            />
                            <button onClick={() => setGridRotation(r => r + 1)} className="p-1.5 hover:bg-slate-100 rounded border border-slate-200 text-xs font-bold">+1°</button>
                            <span className="text-xs font-mono w-10 text-center font-bold text-indigo-900">{gridRotation}°</span>
                        </div>

                        <div className="flex items-center gap-2">
                             <span className="text-xs font-bold text-slate-500 uppercase">Center</span>
                             <button onClick={() => setGridOffset({x:0, y:0})} className="text-xs px-2 py-1 bg-slate-100 rounded hover:bg-slate-200">Reset</button>
                        </div>
                    </div>

                    {/* View Controls */}
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <div className="flex items-center gap-2 opacity-75 hover:opacity-100 transition-opacity">
                            <span className="text-xs font-bold text-slate-400 uppercase">View Rotate</span>
                            <button onClick={() => setViewRotation(r => r - 90)} className="p-2 hover:bg-slate-100 rounded"><RotateCw className="w-4 h-4 -scale-x-100" /></button>
                            <button onClick={() => setViewRotation(r => r + 90)} className="p-2 hover:bg-slate-100 rounded"><RotateCw className="w-4 h-4" /></button>
                        </div>

                        <div className="w-px h-8 bg-slate-200 hidden md:block"></div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500 uppercase">Zoom</span>
                            <button onClick={() => setViewScale(s => Math.max(0.5, s - 0.1))} className="p-2 hover:bg-slate-100 rounded"><ZoomOut className="w-4 h-4" /></button>
                            <span className="text-xs font-mono w-8 text-center">{Math.round(viewScale * 100)}%</span>
                            <button onClick={() => setViewScale(s => Math.min(3, s + 0.1))} className="p-2 hover:bg-slate-100 rounded"><ZoomIn className="w-4 h-4" /></button>
                        </div>

                        <div className="w-px h-8 bg-slate-200 hidden md:block"></div>

                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs text-indigo-600 font-medium hover:underline"
                        >
                            Change Image
                        </button>
                    </div>
                </div>
            )}
            
            <div className="p-4 bg-indigo-50 text-xs text-indigo-800 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                    <strong>Step 1:</strong> Drag the Yellow Center Point to the geometric center of your floor plan.<br/>
                    <strong>Step 2:</strong> Use the "Align North" slider to rotate the grid until the Red "N" arrow matches your plan's North.<br/>
                    <strong>Step 3:</strong> Tap zones to tag rooms.
                    <span className="block mt-1 text-indigo-600 opacity-75">Supported: Images (JPG/PNG). For PDF, please convert to image first.</span>
                </p>
            </div>
        </div>
    );
};

export default VastuFloorPlan;
