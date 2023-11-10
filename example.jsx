import React from "react"
import TimeSeriesChart from "perfect-timeseries-chart"

const chart = () => {
  const second = 1000
  const minute = 60 * second
  const hour = 60 * minute
  const day = 24 * hour
  const month = 30 * day
  const year = 365 * day
  const data = [
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
  ]
  //require ONLY data, in this format, no other props
  //everything else should have sane defaults
  return <TimeSeriesChart data={data} />
}
