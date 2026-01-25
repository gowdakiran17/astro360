import React, { useEffect, useState } from 'react';
import { User, Grid, Shield, Star } from 'lucide-react';
import api from '../../services/api';

interface BasicDetailsTableProps {
  profile: {
    date: string;
    time: string;
    location: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
}

interface BasicDetailsResponse {
  person_details?: Record<string, string | number | null | undefined>;
  avkahada?: Record<string, string | number | null | undefined>;
  favourable?: Record<string, string | number | null | undefined>;
  ghatak?: Record<string, string | number | null | undefined>;
}

const BasicDetailsTable: React.FC<BasicDetailsTableProps> = ({ profile }) => {
  const [data, setData] = useState<BasicDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBasicDetails = async () => {
      setLoading(true);
      try {
        const response = await api.post('/chart/basics', {
          date: profile.date,
          time: profile.time,
          latitude: profile.latitude,
          longitude: profile.longitude,
          timezone: profile.timezone
        });
        setData(response.data);
      } catch (error) {
        console.error("Error fetching basic details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      fetchBasicDetails();
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 min-h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!data) return null;

  const { person_details, avkahada, favourable, ghatak } = data;

  const DetailRow = ({ label, value, isLast = false }: { label: string; value: string | number | null | undefined; isLast?: boolean }) => (
    <div className={`flex justify-between items-center py-2.5 ${!isLast ? 'border-b border-slate-50' : ''}`}>
      <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">{label}</span>
      <span className="text-slate-800 text-sm font-semibold text-right">{value || '-'}</span>
    </div>
  );

  const SectionCard = ({ title, icon: Icon, children, colorClass }: { title: string, icon: any, children: React.ReactNode, colorClass: string }) => (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow duration-300">
      <div className={`px-6 py-5 border-b border-slate-100 flex items-center space-x-4 ${colorClass} bg-opacity-5`}>
        <div className={`p-2.5 rounded-2xl ${colorClass} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        <h3 className="font-serif text-lg text-slate-800">{title}</h3>
      </div>
      <div className="p-6 flex-1">
        {children}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {/* 1. Person Details */}
      <SectionCard title="Person Details" icon={User} colorClass="bg-indigo-600">
        <DetailRow label="Sex" value={person_details?.sex || 'Male'} />
        <DetailRow label="Date of Birth" value={person_details?.date_of_birth} />
        <DetailRow label="Time of Birth" value={person_details?.time_of_birth} />
        <DetailRow label="Day of Birth" value={person_details?.day_of_birth} />
        <DetailRow label="Place of Birth" value={profile.location} />
        <DetailRow label="Latitude" value={person_details?.latitude} />
        <DetailRow label="Longitude" value={person_details?.longitude} />
        <DetailRow label="Time Zone" value={person_details?.timezone} />
        <DetailRow label="Sunrise" value={person_details?.sunrise} />
        <DetailRow label="Sunset" value={person_details?.sunset} />
        <DetailRow label="LMT Correction" value={person_details?.lmt_correction} />
        <DetailRow label="Local Mean Time" value={person_details?.local_mean_time} />
        <DetailRow label="Sidereal Time" value={person_details?.sidereal_time} />
        <DetailRow label="Julian Day" value={person_details?.julian_day} />
        <DetailRow label="Ayanamsa" value={person_details?.ayanamsa} />
        <DetailRow label="Ayanamsa Name" value={person_details?.ayanamsa_name} isLast />
      </SectionCard>

      {/* 2. Avkahada Chakra */}
      <SectionCard title="Avkahada Chakra" icon={Grid} colorClass="bg-emerald-600">
        <DetailRow label="Paya (Rashi)" value={avkahada?.paya} />
        <DetailRow label="Varna" value={avkahada?.varna} />
        <DetailRow label="Yoni" value={avkahada?.yoni} />
        <DetailRow label="Gana" value={avkahada?.gana} />
        <DetailRow label="Vashya" value={avkahada?.vashya} />
        <DetailRow label="Nadi" value={avkahada?.nadi} />
        <DetailRow label="Balance of Dasha" value={avkahada?.balance_of_dasha} />
        <DetailRow label="Lagna" value={favourable?.lagna} />
        <DetailRow label="Lagna Lord" value={favourable?.lagna_lord} />
        <DetailRow label="Rashi" value={avkahada?.sign} />
        <DetailRow label="Rashi Lord" value={avkahada?.sign_lord} />
        <DetailRow label="Nakshatra-Pada" value={`${avkahada?.nakshatra} - ${avkahada?.charan}`} />
        <DetailRow label="Nakshatra Lord" value={avkahada?.nakshatra_lord} />
        <DetailRow label="Julian Day" value={person_details?.julian_day} />
        <DetailRow label="Sun Sign (Indian)" value={avkahada?.sun_sign} />
        <DetailRow label="Sun Sign (Western)" value={avkahada?.sun_sign_western} />
        <DetailRow label="Ayanamsa" value={person_details?.ayanamsa} />
        <DetailRow label="Ayanamsa Name" value={person_details?.ayanamsa_name} isLast />
      </SectionCard>

      {/* 3. Favourable Points */}
      <SectionCard title="Favourable Points" icon={Star} colorClass="bg-amber-500">
        <DetailRow label="Lucky Stone" value={favourable?.lucky_stone} />
        <DetailRow label="Lucky Color" value={favourable?.lucky_color} />
        <DetailRow label="Lucky Day" value={favourable?.lucky_day} />
        <DetailRow label="Lucky Number" value={favourable?.lucky_number} />
        <DetailRow label="Lucky God" value={favourable?.lucky_god} />
        <DetailRow label="Lucky Metal" value={favourable?.lucky_metal} />
        <DetailRow label="Best Numbers" value={favourable?.best_numbers} />
        <DetailRow label="Evil Numbers" value={favourable?.evil_numbers} />
        <DetailRow label="Good Years" value={favourable?.good_years} />
        <DetailRow label="Lagna" value={favourable?.lagna} />
        <DetailRow label="Lagna Lord" value={favourable?.lagna_lord} />
        <DetailRow label="Rashi" value={favourable?.rashi} />
        <DetailRow label="Rashi Lord" value={favourable?.rashi_lord} isLast />
      </SectionCard>

      {/* 4. Ghatak / Malefics */}
      <SectionCard title="Ghatak (Malefics)" icon={Shield} colorClass="bg-rose-500">
        <DetailRow label="Bad Month" value={ghatak?.month} />
        <DetailRow label="Bad Tithi" value={ghatak?.tithi} />
        <DetailRow label="Bad Day" value={ghatak?.day} />
        <DetailRow label="Bad Nakshatra" value={ghatak?.nakshatra} />
        <DetailRow label="Bad Yoga" value={ghatak?.yoga} />
        <DetailRow label="Bad Karana" value={ghatak?.karana} />
        <DetailRow label="Bad Prahar" value={ghatak?.prahar} />
        <DetailRow label="Bad Moon" value={ghatak?.moon} />
        <DetailRow label="Bad Lagna" value={ghatak?.bad_lagna} />
        <DetailRow label="Bad Planet" value={ghatak?.bad_planets} isLast />
      </SectionCard>
    </div>
  );
};

export default BasicDetailsTable;
