import React from "react"
import ReactDOM from "react-dom"
import TimeSeriesChart from "../dist/bundle" // Adjust the path as needed
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
ReactDOM.render(
  <>
    <TimeSeriesChart data={data} />
    hello
  </>,
  document.getElementById("app")
)
