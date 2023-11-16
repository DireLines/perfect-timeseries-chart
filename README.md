# The Perfect Timeseries Chart

I have some observability data over time and I want to look at it in a stacked bar chart as part of a dashboard, but I don't want to learn the intricacies of some big graphing library or incorporate some fancy solution like Kibana or Grafana.

I just want to send the data into a component and have it visualized right without hassle.

I don't want everything and the kitchen sink, I just want a single perfect timeseries chart component.

```jsx
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
  return (
    <div>
      <h1>The data:</h1>
      <TimeSeriesChart data={data} />
    </div>
  )
}
```
<img width="872" alt="Screen Shot 2023-11-15 at 11 22 41 PM" src="https://github.com/DireLines/perfect-timeseries-chart/assets/16977657/fd2e5861-0f69-454e-a14f-9f2dd8a74138">

