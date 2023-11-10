import React from 'react';
import { TimeSeriesChart, TimeSeriesChartProps } from '..';
import { render, screen } from '@testing-library/react';

const defaultProps: TimeSeriesChartProps = {
  
};

const setup = (props = defaultProps) => render(<TimeSeriesChart {...props} />);

describe('TimeSeriesChart', () => {
  it('renders', () => {
    setup({children: 'foo'});
    expect(screen.getByText('foo'));
  });
});
