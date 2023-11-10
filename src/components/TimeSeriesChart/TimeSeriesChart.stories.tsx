import React from 'react';

export interface TimeSeriesChartProps {}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ children }) => {
  return (
    <div>{ children }</div>
  );
}
