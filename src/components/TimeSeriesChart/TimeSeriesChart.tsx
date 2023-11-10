import React from 'react';
import './timeSeriesChart.scss';

export interface TimeSeriesChartProps {}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ children }) => {
  return <div>{children}</div>;
};
