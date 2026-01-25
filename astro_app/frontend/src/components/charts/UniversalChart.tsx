import React from 'react';
import { useChartSettings } from '../../context/ChartContext';
import NorthIndianChart, { ChartData } from '../NorthIndianChart';
import SouthIndianChart from './SouthIndianChart';

interface UniversalChartProps {
  data: ChartData | null;
  className?: string;
}

const UniversalChart: React.FC<UniversalChartProps> = ({ data, className }) => {
  const { chartStyle } = useChartSettings();

  return (
    <div className={className}>
      {chartStyle === 'NORTH_INDIAN' ? (
        <NorthIndianChart data={data} />
      ) : (
        <SouthIndianChart data={data} />
      )}
    </div>
  );
};

export default UniversalChart;
