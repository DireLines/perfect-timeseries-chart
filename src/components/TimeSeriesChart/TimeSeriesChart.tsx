import React from "react"
import { mapObjIndexed } from "ramda"
// import colorHash from "./colorHash"

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

export type TimeSeriesChartProps = {
  data: TimeSeries
  start?: Time
  end?: Time
  active?: boolean
  children?: any
  binSizeMs?: number
  columnName?: string
  displayMode?: DisplayMode
  navigation?: NavigationOptions
  presetColors?: { [key: string]: string }
  logLevelPresetColors?: boolean
  textures?: boolean
}

// const logLevelColors = {
//   info: "#82dd55",
//   debug: "#82dd55",
//   warn: "#edb95e",
//   warning: "#edb95e",
//   error: "#e23636",
//   critical: "#ff0000",
//   fatal: "#ff0000",
//   emergency: "#ff0000",
// }

// const getDisplayColor: (column: string, value: string) => string = (
//   column: string,
//   value: string
// ) => colorHash(`${column}:${value}`)

const min = (list: [number]) => Math.min(...list)
const max = (list: [number]) => Math.max(...list)

const defaultProps: (TimeSeriesData) => TimeSeriesChartProps = (data) => {
  const dataMin = min(data.map(({ time }) => time))
  const dataMax = max(data.map(({ time }) => time))
  return {
    data,
    start: dataMin,
    end: dataMax,
    active: true,
    binSize: (dataMax - dataMin) / 25,
    displayMode: DisplayMode.StackedBar,
    navigation: { scrollToZoom: true, clickAndDragToZoom: true, clickToToggle: true },
    presetColors: {},
    logLevelPresetColors: true,
    textures: false,
  }
}
export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data, children }) => {
  const block = "█"
  return (
    <div>
      {data.map((item) => (
        <li>
          {Object.values(
            mapObjIndexed(
              (v, k) => (
                <span color={k} displayMode="inline">
                  {block.repeat(v)}
                </span>
              ),
              item.counts
            )
          )}
        </li>
      ))}
      <br />
      {JSON.stringify(defaultProps(data), null, 2)}
      <br />
      {children}
    </div>
  )
}
