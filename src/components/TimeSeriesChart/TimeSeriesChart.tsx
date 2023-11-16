import React, { useRef } from "react"
import { mapObjIndexed, mergeWith, sum, isEmpty, isNil } from "ramda"
import { colorHash, invertColor } from "./color"
import { closestTimeIncrement, timeDisplayIncrements } from "./timeUnits"

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
    numBins: 30,
    displayMode: DisplayMode.StackedBar,
    navigation: { scrollToZoom: true, clickAndDragToZoom: true, clickToToggle: true },
    presetColors: {},
    logLevelPresetColors: true,
    textures: false,
    children: null,
    backgroundColor: "#202027",
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
  const { data, columnName, numBins, start, end, backgroundColor } = chartProps
  const startTime = toEpochMs(start)
  const endTime = toEpochMs(end)
  const binSizeMs = Math.round((endTime - startTime) / numBins)
  const displayBinSizeMs = closestTimeIncrement(binSizeMs)
  const times = range(
    nearestMultipleBelow(startTime, displayBinSizeMs),
    nearestMultipleAbove(endTime, displayBinSizeMs),
    displayBinSizeMs
  )
  const displayData = times.map((timestamp) => {
    const bucketStart = timestamp
    const bucketEnd = timestamp + displayBinSizeMs
    const bucketData = data
      .filter((item) => bucketStart <= toEpochMs(item.time) && toEpochMs(item.time) < bucketEnd)
      .map((item) => item.counts)
      .reduce((curr, next) => mergeWith((a, b) => a + b, curr, next), {})
    return { time: timestamp, counts: bucketData }
  })
  const dispStartTime = min(...displayData.map(({ time }) => time))
  const dispEndTime = max(...displayData.map(({ time }) => time))
  // total SVG dimensions
  const width = 1000
  const height = 300
  //dimensions for part of SVG in which bars can be drawn
  //leave room for axis markers and padding
  const dispWidth = Math.round(width * 0.9)
  const dispHeight = Math.round(height * 0.82)
  const columnPadY = Math.round((height - dispHeight) / 2)
  const columnPadX = Math.round((width - dispWidth) / 2)
  const barWidth = Math.ceil(dispWidth / displayData.length)
  const tallestBarTotalCount = max(...displayData.map(({ counts }) => sum(Object.values(counts))))
  const getPixelHeight = (count: number) => Math.round((count / tallestBarTotalCount) * dispHeight)
  const getXCoord = (time: number) =>
    Math.round(((time - dispStartTime) / (dispEndTime - dispStartTime)) * dispWidth) + columnPadX
  const indicatorColor = invertColor(backgroundColor)
  return (
    <svg width="100%" height="400px" viewBox={`0 0 ${width} ${height}`}>
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
      <line
        stroke={indicatorColor}
        x1={columnPadX}
        y1={height - columnPadY}
        x2={columnPadX}
        y2={columnPadY}
      />
      {/* Data rects */}
      {displayData.map((point, index) => {
        const rects: any[] = []
        let totalHeight = 0
        for (const k in point.counts) {
          const currentRectHeight = getPixelHeight(point.counts[k])
          rects.push(
            <rect
              y={height - columnPadY - 1 - (currentRectHeight + totalHeight)} // Adjust the y position based on value
              width={Math.ceil(barWidth * 0.95)}
              height={currentRectHeight} // Scale the height based on the value
              fill={getDisplayColor(columnName, k)} // Set the color of the bar
            />
          )
          totalHeight += currentRectHeight
        }
        const x = getXCoord(point.time)
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
                <text
                  x={barWidth / 2}
                  y={height - 5} // Position the text at the bottom
                  textAnchor="middle"
                  fontSize="16"
                  fill={indicatorColor}
                >
                  {new Date(point.time).toLocaleTimeString("en-US")}
                </text>
              </>
            ) : null}
          </g>
        )
      })}
    </svg>
  )
}
const createLegend = (chartProps: TimeSeriesChartData) => {}
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
