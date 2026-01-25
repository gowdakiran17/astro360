import React from 'react';
import { Sparkles, BookOpen, Gem, Heart } from 'lucide-react';

interface RemediesCardProps {
    mahadasha: string;
    antardasha: string;
}

interface Remedy {
    mantra: string;
    gemstone: string;
    donation: string;
    citation: string;
    deity: string;
}

const REMEDIES: Record<string, Remedy> = {
    Sun: {
        mantra: "Om Hram Hreem Hroum Sah Suryaya Namah",
        gemstone: "Ruby (Manikya)",
        donation: "Wheat, jaggery, copper",
        citation: "Brihat Parashara Hora Shastra, Ch. 84",
        deity: "Lord Shiva / Surya"
    },
    Moon: {
        mantra: "Om Shram Shreem Shroum Sah Chandramase Namah",
        gemstone: "Pearl (Moti)",
        donation: "Rice, milk, silver",
        citation: "Phala Deepika, Ch. 20",
        deity: "Goddess Parvati / Chandra"
    },
    Mars: {
        mantra: "Om Kram Kreem Kroum Sah Bhaumaya Namah",
        gemstone: "Red Coral (Moonga)",
        donation: "Red lentils (Masoor), copper",
        citation: "Saravali, Ch. 42",
        deity: "Lord Kartikeya / Hanuman"
    },
    Mercury: {
        mantra: "Om Bram Breem Broum Sah Budhaya Namah",
        gemstone: "Emerald (Panna)",
        donation: "Green gram (Moong), green cloth",
        citation: "Brihat Samhita",
        deity: "Lord Vishnu"
    },
    Jupiter: {
        mantra: "Om Gram Greem Groum Sah Gurave Namah",
        gemstone: "Yellow Sapphire (Pukhraj)",
        donation: "Chickpeas (Chana dal), turmeric, gold",
        citation: "Jataka Parijata",
        deity: "Lord Dakshinamurthy / Brihaspati"
    },
    Venus: {
        mantra: "Om Dram Dreem Droum Sah Shukraya Namah",
        gemstone: "Diamond (Heera) or White Sapphire",
        donation: "Curd, ghee, white clothes",
        citation: "Brihat Parashara Hora Shastra",
        deity: "Goddess Lakshmi"
    },
    Saturn: {
        mantra: "Om Pram Preem Proum Sah Shanaischaraya Namah",
        gemstone: "Blue Sapphire (Neelam)",
        donation: "Black sesame, iron, mustard oil",
        citation: "Shani Mahatmya",
        deity: "Lord Hanuman / Shani Dev"
    },
    Rahu: {
        mantra: "Om Bhram Bhreem Bhroum Sah Rahave Namah",
        gemstone: "Hessonite (Gomed)",
        donation: "Black gram (Urad), woolen blanket",
        citation: "Uttara Kalamrita",
        deity: "Goddess Durga"
    },
    Ketu: {
        mantra: "Om Stram Streem Stroum Sah Ketave Namah",
        gemstone: "Cat's Eye (Lehsunia)",
        donation: "Seven grains (Satnaja), black/white blanket",
        citation: "Brihat Parashara Hora Shastra",
        deity: "Lord Ganesha"
    }
};

const RemediesCard: React.FC<RemediesCardProps> = ({ mahadasha, antardasha }) => {
    const mdRemedy = REMEDIES[mahadasha];
    const adRemedy = REMEDIES[antardasha];

    if (!mdRemedy) return null;

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Vedic Remedies (Upayas)
            </h3>

            <div className="space-y-6">
                {/* Mahadasha Remedies */}
                <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        For Mahadasha Lord: <span className="text-purple-600">{mahadasha}</span>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <BookOpen className="w-4 h-4 text-purple-400 mt-0.5" />
                            <div>
                                <div className="text-xs font-bold text-slate-700">Mantra</div>
                                <div className="text-xs text-slate-600 italic font-medium">"{mdRemedy.mantra}"</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Gem className="w-4 h-4 text-purple-400 mt-0.5" />
                            <div>
                                <div className="text-xs font-bold text-slate-700">Gemstone</div>
                                <div className="text-xs text-slate-600">{mdRemedy.gemstone}</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Heart className="w-4 h-4 text-purple-400 mt-0.5" />
                            <div>
                                <div className="text-xs font-bold text-slate-700">Donation & Deity</div>
                                <div className="text-xs text-slate-600">{mdRemedy.donation} • {mdRemedy.deity}</div>
                            </div>
                        </div>
                        <div className="mt-2 text-[10px] text-slate-400 text-right">
                            Ref: {mdRemedy.citation}
                        </div>
                    </div>
                </div>

                {/* Antardasha (Secondary) */}
                {antardasha && antardasha !== mahadasha && (
                    <div className="pt-2 border-t border-slate-100">
                         <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            For Antardasha Lord: <span className="text-indigo-600">{antardasha}</span>
                        </div>
                         <div className="flex items-center gap-2 text-xs text-slate-600">
                            <span className="font-bold">Mantra:</span> 
                            <span className="italic">"{adRemedy?.mantra}"</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RemediesCard;
