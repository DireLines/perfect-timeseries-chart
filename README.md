# The Perfect Timeseries Chart

I have some observability data over time and I want to look at it in a stacked bar chart as part of a dashboard, but I don't want to learn the intricacies of some big graphing library or incorporate some fancy solution like Kibana or Grafana.

I just want to send the data into a component and have it visualized right without hassle.

I don't want everything and the kitchen sink, I just want a single perfect timeseries chart component.

```jsx
import React from "react"
import { TimeSeriesChart } from "perfect-timeseries-chart"

const hour = 1000 * 60 * 60
const data = [
  {
    time: Date.now(),
    counts: { red: 5, blue: 8, green: 12 },
  },
  {
    time: Date.now() - 1 * hour,
    counts: { red: 1, blue: 2, bleu: 2, green: 3 },
  },
  {
    time: Date.now() - 2 * hour,
    counts: { green: 0, red: 8, blue: 5, bleu: 2 },
  },
  {
    time: Date.now() - 3 * hour,
    counts: { red: 8, blue: 4, green: 0 },
  },
]
export default function MyDashboard() {
  return <TimeSeriesChart data={data} />
}
```

<img width="869" alt="Screen Shot 2023-11-16 at 2 31 03 AM" src="https://github.com/DireLines/perfect-timeseries-chart/assets/16977657/4b1ef9d4-31c9-4e76-8460-4c82bc1e1bb3">

## Features

- `data` is the only required input.
- To change the time interval displayed, use the `start` and `end` props (they will accept either a `Date` or epoch timestamp in ms).
- Coloring is hash-based and deterministic - the same content will be displayed with the same color every time, without any need to store a palette. You can override specific hash-generated colors if needed.
- Stacked bar chart by default, but there are a few other display options: Line graph, Stacked Area, and Heatmap for histograms over time. To switch between them, use the `displayMode` prop.
