import React from "react"
import { TimeSeriesChart, TimeSeriesChartProps } from ".."
import { render, screen } from "@testing-library/react"
const second = 1000
const minute = 60 * second
const hour = 60 * minute
const defaultProps: TimeSeriesChartProps = {
  data: [
    {
      time: Date.now(),
      counts: {
        red: 5,
        blue: 8,
      },
    },
    {
      time: Date.now() - 1 * hour,
      counts: {
        red: 1,
        blue: 2,
        green: 3,
      },
    },
    {
      time: Date.now() - 2 * hour,
      counts: {
        red: 8,
        blue: 5,
      },
    },
    {
      time: Date.now() - 3 * hour,
      counts: {
        red: 8,
        blue: 4,
      },
    },
  ],
}

const setup = (props = defaultProps) => render(<TimeSeriesChart {...props} />)

describe("TimeSeriesChart", () => {
  it("renders", () => {
    setup({ children: "foo", ...defaultProps })
    expect(screen.getByText("foo"))
  })
})
