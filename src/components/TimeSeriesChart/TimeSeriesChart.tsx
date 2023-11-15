import React, { useRef } from "react"
import { mapObjIndexed, mergeWith } from "ramda"
import { useResize } from "./useResize"
import { colorHash } from "./colorHash"

// type RGB = `rgb(${number}, ${number}, ${number})`;
// type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
// type HEX = `#${string}`;
// export type Color = RGB | RGBA | HEX;

export type Time = number | Date

//the purest format of time series data
//list of counts for different values at a set of timestamps
export type TimeSeries = {
  time: Time
  counts: {
    [value: string]: number
  }
}[]

//maybe you have multiple columns you bucketed for each timestamp
//and want choose between them in an external component
//but still pass the same blob of data in every time
export type TimeSeriesMultiValue = {
  time: Time
  counts: {
    [column: string]: {
      [value: string]: number
    }
  }
}[]

//maybe your data is a straight list of occurrences and you haven't done the bucketing yet
//that's alright, I'll do the bucketing for you
export type TimeSeriesPointCloud = {
  time: Time
  [column: string]: string | Time
}[]

export enum DisplayMode {
  StackedBar = "StackedBar",
  Line = "Line",
  StackedArea = "StackedArea",
  Heatmap = "Heatmap",
}

export type NavigationOptions = {
  scrollToZoom?: boolean
  clickAndDragToZoom?: boolean
  clickToToggle?: boolean
  minStartTime?: Time
  maxEndTime?: Time
}
export type TimeSeriesData = TimeSeries | TimeSeriesMultiValue | TimeSeriesPointCloud

export type TimeSeriesChartData = {
  data: TimeSeries
  start: Time
  end: Time
  active: boolean
  children: any
  binSizeMs: number
  columnName: string
  displayMode: DisplayMode
  navigation: NavigationOptions
  presetColors: { [key: string]: string }
  logLevelPresetColors: boolean
  textures: boolean
}

export type TimeSeriesChartProps = Partial<TimeSeriesChartData>

const logLevelColors = {
  info: "#82dd55",
  debug: "#82dd55",
  warn: "#edb95e",
  warning: "#edb95e",
  error: "#e23636",
  critical: "#ff0000",
  fatal: "#ff0000",
  emergency: "#ff0000",
}

const commonHtmlColors = [
  "aqua",
  "black",
  "blue",
  "fuchsia",
  "gray",
  "green",
  "lime",
  "maroon",
  "navy",
  "olive",
  "purple",
  "red",
  "silver",
  "teal",
  "white",
  "yellow",
]

const getDisplayColor: (column: string, value: string) => string = (
  column: string,
  value: string
) => {
  if (commonHtmlColors.includes(value)) {
    return value
  }
  return colorHash(`${column}:${value}`)
}

const min = Math.min
const max = Math.max

const defaultProps: (TimeSeriesData) => TimeSeriesChartData = (data) => {
  const dataMin = min(...data.map(({ time }) => time))
  const dataMax = max(...data.map(({ time }) => time))
  return {
    data,
    start: dataMin,
    end: dataMax,
    active: true,
    columnName: "default",
    binSizeMs: (dataMax - dataMin) / 25,
    displayMode: DisplayMode.StackedBar,
    navigation: { scrollToZoom: true, clickAndDragToZoom: true, clickToToggle: true },
    presetColors: {},
    logLevelPresetColors: true,
    textures: false,
    children: null,
  }
}
const range = (start: number, end: number, step: number) => {
  let s = min(start, end)
  let e = max(start, end)
  const result: number[] = []
  let current = s
  while (current <= e) {
    result.push(current)
    current += step
  }
  return result
}

const toEpochMs = (date: Time) => {
  if (typeof date === "number") {
    return date
  } else {
    return Date.parse(date.toString())
  }
}
const createSvg = (chartProps: TimeSeriesChartData) => {
  const { data, columnName, binSizeMs, start, end } = chartProps
  const times = range(toEpochMs(start), toEpochMs(end), binSizeMs)
  const displayData = times.map((timestamp) => {
    const bucketStart = timestamp
    const bucketEnd = timestamp + binSizeMs
    const bucketData = data
      .filter((item) => bucketStart <= toEpochMs(item.time) && toEpochMs(item.time) < bucketEnd)
      .map((item) => item.counts)
      .reduce((curr, next) => mergeWith((a, b) => a + b, curr, next), {})
    return { time: timestamp, counts: bucketData }
  })
  // SVG dimensions
  const width = 800
  const height = 300
  const barWidth = Math.ceil(width / displayData.length)
  return (
    <svg width={width} height={height}>
      {displayData.map((point, index) => (
        <g key={index} transform={`translate(${index * barWidth}, 0)`}>
          <rect
            y={height - point.counts["red"] * 10} // Adjust the y position based on value
            width={Math.ceil(barWidth * 0.95)}
            height={point.counts["red"] * 10} // Scale the height based on the value
            fill={getDisplayColor(columnName, "red")} // Set the color of the bar
          />
          <text
            x={barWidth / 2}
            y={height - 5} // Position the text at the bottom
            textAnchor="middle"
            fontSize="10"
            fill="black"
          >
            {new Date(point.time).toLocaleString()}
          </text>
        </g>
      ))}
    </svg>
  )
}
export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data, children, ...rest }) => {
  const ref = useRef(null)
  const chartProps = { ...defaultProps(data), ...rest }
  return (
    <div ref={ref} width={"100%"}>
      {createSvg(chartProps)}
      {/* {displayData.map((item) => (
        <li>
          <span>{new Date(item.time).toLocaleString()}: </span>
          {Object.values(
            mapObjIndexed(
              (v, k) => (
                <span color={getDisplayColor(columnName, k)} displayMode="inline">
                  {block.repeat(v)}
                </span>
              ),
              item.counts
            )
          )}
        </li>
      ))} */}
      {children}
    </div>
  )
}
