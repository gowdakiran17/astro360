import { DashboardOverviewResponse } from '../../../types/periodAnalysis';
import AstralHero from '../AstralHero';
import AlmanacHeader from '../AlmanacHeader';
import ActiveDashaCards from '../ActiveDashaCards';
import HouseStrengthMatrix from '../HouseStrengthMatrix';
import TransitSummaryWidget from '../TransitSummaryWidget';
import MuhurtaTimeline from '../MuhurtaTimeline';
import DailyGuidance from '../DailyGuidance';
import DailyEnergyChart from '../DailyEnergyChart';
import PlanetaryCouncil from '../PlanetaryCouncil';

import { DailyCalendarData } from '../InteractiveCalendar';

interface OverviewTabProps {
    data: DashboardOverviewResponse;
    selectedDate?: Date;
    onDateChange?: (date: Date) => void;
    dailyData?: Record<string, DailyCalendarData>;
}

const OverviewTab = ({ data, selectedDate: _selectedDate, onDateChange: _onDateChange, dailyData: _dailyData }: OverviewTabProps) => {
    const currentDay = data.daily_analysis;
    const currentDateObj = new Date(currentDay.date);

    // Safety check for new props
    const transitImpacts = (data as DashboardOverviewResponse & { transit_analysis?: { impacts: any[] } }).transit_analysis?.impacts || [];

    return (
        <div className="space-y-6 animate-fade-in pt-4 pb-20">
            {/* 1. Almanac Strip (Tithi/Nakshatra) - Very Top Context */}
            {currentDay.panchang && <AlmanacHeader panchang={currentDay.panchang} />}

            {/* 2. Top Bento Row: Hero + Dasha (Full Width) */}
            <div className="grid grid-cols-1 gap-6">
                {/* Hero Card & Dasha Context */}
                <div className="flex flex-col gap-6">
                    <AstralHero
                        date={currentDateObj}
                        score={currentDay.score}
                        description={currentDay.recommendation || currentDay.predictions?.[0] || 'Align your energy with the stars.'}
                        influences={currentDay.influences}
                        best={currentDay.best}
                        caution={currentDay.caution}
                        theme={currentDay.theme}
                    />

                    {/* Active Dasha Cards */}
                    {/* Quick Reference Cards (Chart, Nakshatra, Dasha) */}
                    <ActiveDashaCards data={data} />
                </div>
            </div>

            {/* 3. House Matrix - FULL WIDTH SECTION */}
            <div className="w-full">
                <HouseStrengthMatrix strengths={currentDay.house_strengths || { strongest_houses: [], sav: [] }} />
            </div>

            {/* 4. Cosmic Context Row (Transits + Council) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TransitSummaryWidget impacts={transitImpacts} />
                <PlanetaryCouncil
                    ishtaKashta={data.strength_analysis.ishta_kashta}
                    vimsopaka={data.strength_analysis.vimsopaka}
                />
            </div>

            {/* 5. Time & Energy Flow */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Energy Chart */}
                <div className="lg:col-span-6">
                    <div className="glass-card overflow-hidden h-full">
                        <DailyEnergyChart muhuratas={data.daily_analysis.muhuratas || []} />
                    </div>
                </div>

                {/* Timeline */}
                <div className="lg:col-span-6">
                    <MuhurtaTimeline muhuratas={currentDay.muhuratas || []} />
                </div>
            </div>

            {/* 6. Footer Guidance */}
            <div className="grid grid-cols-1">
                <DailyGuidance
                    predictions={data.daily_analysis.predictions || []}
                    luckyFactors={currentDay.lucky_factors || {}}
                />
            </div>
        </div>
    );
};

export default OverviewTab;
