import React, { useRef } from "react"
import { mergeWith, sum, isNil } from "ramda"
import { colorHash, invertColor } from "./color"
import { closestNumber, closestTimeIncrement } from "./timeUnits"
import Tooltip from "@mui/material/Tooltip"
export type Time = number | Date

//the purest format of time series data
//list of counts for different values at a set of timestamps
export type TimeSeries = {
  time: Time
  counts: {
    [value: string]: number
  }
}[]
//runtime type check
const isTimeSeries = (data) => {
  if (!Array.isArray(data)) {
    return false
  }
  for (const elem of data) {
    if (isNil(elem?.time) || isNil(elem?.counts)) {
      return false
    }
    if (typeof elem.time !== "number" || typeof elem.counts !== "object") {
      return false
    }
    for (const k in elem.counts) {
      if (typeof elem.counts[k] !== "number") {
        return false
      }
    }
  }
  return true
}

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
//runtime type check
const isTimeSeriesMultiValue = (data) => {
  if (!Array.isArray(data)) {
    return false
  }
  for (const elem of data) {
    if (isNil(elem?.time) || isNil(elem?.counts)) {
      return false
    }
    if (typeof elem.time !== "number" || typeof elem.counts !== "object") {
      return false
    }
    for (const k in elem.counts) {
      if (typeof elem.counts[k] !== "object") {
        return false
      }
      const counts = elem.counts[k]
      for (const c in counts) {
        if (typeof counts[c] !== "number") {
          return false
        }
      }
    }
  }
  return true
}

//maybe your data is a straight list of occurrences and you haven't done the bucketing yet
//that's alright, I'll do the bucketing for you
export type TimeSeriesPointCloud = {
  time: Time
  [column: string]: string | Time
}[]
//runtime type check
const isTimeSeriesPointCloud = (data) => {
  if (!Array.isArray(data)) {
    return false
  }
  for (const elem of data) {
    if (isNil(elem?.time)) {
      return false
    }
    for (const k in elem) {
      if (typeof elem[k] !== "number") {
        return false
      }
    }
  }
  return true
}

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
  numBins: number
  columnName: string
  displayMode: DisplayMode
  navigation: NavigationOptions
  presetColors: { [key: string]: string }
  logLevelPresetColors: boolean
  textures: boolean
  backgroundColor: string
  onBarHover: (any) => void
}

export type TimeSeriesChartProps = Partial<TimeSeriesChartData>

//standardized, representative colors for common log levels
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

//if the value is literally the name of a common color,
//don't be misleading and generate some random color instead
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

const countDisplayIncrements = [
  1, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000,
  1000000, 2000000, 5000000, 10000000, 20000000, 50000000, 100000000, 200000000, 500000000,
  1000000000, 2000000000, 5000000000, 10000000000,
]

const abbreviateNumber = (n: number) =>
  Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n)

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
    columnName: "value",
    numBins: 30,
    displayMode: DisplayMode.StackedBar,
    navigation: { scrollToZoom: true, clickAndDragToZoom: true, clickToToggle: true },
    presetColors: {},
    logLevelPresetColors: true,
    textures: false,
    children: null,
    backgroundColor: "#202027",
    onBarHover: () => {},
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

const nearestMultipleBelow = (value, step) => Math.floor(value / step) * step
const nearestMultipleAbove = (value, step) => Math.ceil(value / step) * step
const createSvg = (chartProps: TimeSeriesChartData) => {
  const { data, columnName, numBins, start, end, backgroundColor, onBarHover } = chartProps
  const startTime = toEpochMs(start)
  const endTime = toEpochMs(end)
  const binSizeMs = closestTimeIncrement(Math.round((endTime - startTime) / numBins))
  const times = range(
    nearestMultipleBelow(startTime, binSizeMs),
    nearestMultipleAbove(endTime, binSizeMs),
    binSizeMs
  )
  const displayData = times.map((timestamp) => {
    const bucketStart = timestamp
    const bucketEnd = timestamp + binSizeMs
    const bucketData = data
      .filter((item) => bucketStart <= toEpochMs(item.time) && toEpochMs(item.time) < bucketEnd)
      .map((item) => item.counts)
      .reduce((curr, next) => mergeWith((a, b) => a + b, curr, next), {})
    return { time: timestamp, counts: bucketData }
  })
  const dispStartTime = min(...displayData.map(({ time }) => time))
  const dispEndTime = max(...displayData.map(({ time }) => time))
  // total SVG dimensions
  const width = 1200
  const height = 400
  //dimensions for part of SVG in which bars can be drawn
  //leave room for axis markers and padding
  const dispWidth = Math.round(width * 0.9)
  const dispHeight = Math.round(height * 0.82)
  const columnPadY = Math.round((height - dispHeight) / 2)
  const columnPadX = Math.round((width - dispWidth) / 2)
  const barWidth = Math.ceil(dispWidth / displayData.length)
  const tallestBarTotalCount = max(...displayData.map(({ counts }) => sum(Object.values(counts))))
  const countDisplayIncrement = closestNumber(tallestBarTotalCount / 4, countDisplayIncrements)
  const countsToIndicate = [
    ...range(0, tallestBarTotalCount - countDisplayIncrement / 2, countDisplayIncrement),
    tallestBarTotalCount,
  ]
  const getPixelHeight = (count: number) => Math.round((count / tallestBarTotalCount) * dispHeight)
  const countToPixel = (count: number) => height - columnPadY - 1 - getPixelHeight(count)
  const timeToPixel = (time: number) =>
    Math.round(((time - dispStartTime) / (dispEndTime - dispStartTime)) * dispWidth) + columnPadX
  const pixelToTime = (pixel: number) =>
    Math.round(((pixel - columnPadX) / dispWidth) * (dispEndTime - dispStartTime)) + dispStartTime
  const indicatorColor = invertColor(backgroundColor)
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
      {/* Background rectangle */}
      <rect width="100%" height="100%" fill={backgroundColor} />
      {/* axes */}
      <line
        stroke={indicatorColor}
        x1={columnPadX}
        y1={height - columnPadY}
        x2={width - columnPadX}
        y2={height - columnPadY}
      />
      {/* vertical axis markers */}
      {countsToIndicate.map((count) => (
        <>
          <line
            stroke={indicatorColor}
            x1={columnPadX}
            y1={countToPixel(count)}
            x2={width - columnPadX}
            y2={countToPixel(count)}
            opacity={0.3}
          />
          <text
            x={columnPadX - 8}
            y={countToPixel(count) + 6}
            textAnchor="end"
            fontSize="18"
            fill={indicatorColor}
          >
            {abbreviateNumber(count)}
          </text>
        </>
      ))}
      {/* Data rects */}
      {displayData.map((point, index) => {
        const rects: any[] = []
        let totalHeight = 0
        for (const value in point.counts) {
          const count = point.counts[value]
          if (count === 0) {
            continue
          }
          const currentRectHeight = getPixelHeight(count)
          const padding = 0.93
          rects.push(
            <Tooltip
              title={
                <>
                  {columnName}: {value}{" "}
                  <div style={{ fontWeight: "bold" }}>{abbreviateNumber(count)}</div>
                </>
              }
              placement="right"
              arrow
            >
              <rect
                x={Math.round((barWidth * (1 - padding)) / 2)}
                y={height - columnPadY - 1 - (currentRectHeight + totalHeight)} // Adjust the y position based on value
                width={Math.ceil(barWidth * padding)}
                height={currentRectHeight} // Scale the height based on the value
                fill={getDisplayColor(columnName, value)} // Set the color of the bar
                onMouseOver={() => onBarHover({ columnName, value, count, time: point.time })}
              />
            </Tooltip>
          )
          totalHeight += currentRectHeight
        }
        const x = timeToPixel(point.time)
        return (
          <g key={index} transform={`translate(${x}, 0)`}>
            {rects}
            {index % 5 === 0 ? (
              <>
                <line
                  stroke={indicatorColor}
                  x1={0}
                  y1={height - columnPadY + 8}
                  x2={0}
                  y2={height - columnPadY}
                />
                <text x={0} y={height - 5} textAnchor="middle" fontSize="16" fill={indicatorColor}>
                  {new Date(point.time).toTimeString().split(" ")[0]}
                </text>
              </>
            ) : (
              <line
                stroke={indicatorColor}
                x1={0}
                y1={height - columnPadY + 4}
                x2={0}
                y2={height - columnPadY}
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}
const createLegend = (chartProps: TimeSeriesChartData) => {
  const { data, columnName } = chartProps
  const values: any = {}
  for (const elem of data) {
    for (const k in elem.counts) {
      if (!(k in values)) {
        values[k] = getDisplayColor(columnName, k)
      }
    }
  }
  const vals: any = []
  for (const k in values) {
    vals.push({ value: k, color: values[k] })
  }
  return (
    <ul style={{ listStyle: "none" }}>
      {vals.map(({ value, color }) => (
        <li style={{ float: "left", marginRight: "10px" }}>
          <span style={{ color }}>█</span>
          {` - ${value}`}
        </li>
      ))}
    </ul>
  )
}
export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data, children, ...rest }) => {
  const ref = useRef(null)
  const chartProps = { ...defaultProps(data), ...rest }
  return (
    <div ref={ref} style={{ margin: "auto", width: "80%", height: "100%" }}>
      {createSvg(chartProps)}
      {createLegend(chartProps)}
      {children}
    </div>
  )
}
