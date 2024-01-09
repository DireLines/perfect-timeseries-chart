import { curry } from "ramda"
export const millisecond = 1
export const second = 1000 * millisecond
export const minute = 60 * second
export const hour = 60 * minute
export const day = 24 * hour
export const week = 7 * day
export const month = 30 * day
export const year = 365 * day

//allowed bar widths on time series chart
const allowedBarWidths = [
  millisecond,
  10 * millisecond,
  20 * millisecond,
  50 * millisecond,
  100 * millisecond,
  200 * millisecond,
  500 * millisecond,
  second,
  5 * second,
  30 * second,
  minute,
  5 * minute,
  10 * minute,
  30 * minute,
  hour,
  3 * hour,
  6 * hour,
  12 * hour,
  day,
  2 * day,
  week,
  month,
  2 * month,
  6 * month,
  year,
  5 * year,
  10 * year,
  50 * year,
  100 * year,
]
//allowed display intervals on time series chart
const allowedDisplayIntervals = [
  millisecond,
  10 * millisecond,
  100 * millisecond,
  second,
  5 * second,
  30 * second,
  minute,
  5 * minute,
  10 * minute,
  30 * minute,
  hour,
  3 * hour,
  6 * hour,
  12 * hour,
  day,
  week,
  month,
  2 * month,
  6 * month,
  year,
  2 * year,
  5 * year,
  10 * year,
  20 * year,
  50 * year,
  100 * year,
]
const timeFormats = {
  [10 * millisecond]: ".mil",
  [100 * millisecond]: ".mil",
  [500 * millisecond]: ".mil",
  [second]: ":s",
  [5 * second]: ":s",
  [15 * second]: ":s",
  [30 * second]: ":s",
  [minute]: "h:m",
  [5 * minute]: "h:m",
  [15 * minute]: "h:m",
  [30 * minute]: "h:m",
  [hour]: "h:m",
  [3 * hour]: "h:m",
  [12 * hour]: "h:m",
  [day]: "w d",
  [week]: "w d",
  [month]: "M",
  [3 * month]: "M",
  [6 * month]: "M",
  [year]: "y",
  [5 * year]: "y",
  [10 * year]: "y",
}

function format_two_digits(n) {
  return n < 10 ? "0" + n : n
}
const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const weekdayShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]
const formatDate = curry((formatString: any, date: number | Date) => {
  let s = formatString
  const d = new Date(date)
  const replacements = {
    mil: d.getMilliseconds(),
    y: d.getFullYear(),
    Y: d.getFullYear(),
    M: format_two_digits(monthNames[d.getMonth()]),
    d: format_two_digits(d.getDate()),
    D: format_two_digits(d.getDate()),
    h: format_two_digits(d.getHours()),
    H: format_two_digits(d.getHours()),
    m: format_two_digits(d.getMinutes()),
    s: format_two_digits(d.getSeconds()),
    W: weekday[d.getDay()],
    w: weekdayShort[d.getDay()],
  }
  for (const toReplace in replacements) {
    s = s.replaceAll(toReplace, replacements[toReplace])
  }
  return s
})

const getTimeFormat = (binSizeMs: number, index: number) => {
  const displayInterval = getDisplayInterval(binSizeMs)
  const formats =
    timeFormats[
      closestNumber(
        binSizeMs,
        Object.keys(timeFormats).map((x) => parseInt(x))
      )
    ]
  if (Array.isArray(formats))
    return formats[Math.floor(index / (displayInterval / binSizeMs)) % formats.length]
  return formats
}

export const getDisplayInterval = (binSizeMs: number) =>
  closestNumber(5 * binSizeMs, allowedDisplayIntervals)
export const timeLabel = (timestamp: number | Date, binSizeMs: number, index: number) => {
  console.log("binSize", binSizeMs)
  console.log("format", getTimeFormat(binSizeMs, index))
  return formatDate(getTimeFormat(binSizeMs, index), timestamp)
}
export const closestNumber = (n: number, nums: number[]) => {
  let minDiff = Number.MAX_SAFE_INTEGER
  let min = 0
  for (const num of nums) {
    const diff = Math.abs(num - n)
    if (diff < minDiff) {
      min = num
      minDiff = diff
    }
  }
  return min
}

export const closestTimeIncrement = (n) => closestNumber(n, allowedBarWidths)
const nearestMultipleBelow = (value, step) => Math.floor(value / step) * step
const startOfDayLocalTime = (timestamp) => {
  const date = new Date(timestamp)
  const hoursOffset = Math.floor(date.getTimezoneOffset() / 60)
  const minutesOffset = date.getTimezoneOffset() % 60
  const tz = `GMT-${hoursOffset}:${minutesOffset}`
  const ymd = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${tz}`
  return new Date(ymd).getTime()
}
const startOfMonthLocalTime = (timestamp) => {
  const date = new Date(timestamp)
  const hoursOffset = Math.floor(date.getTimezoneOffset() / 60)
  const minutesOffset = date.getTimezoneOffset() % 60
  const tz = `GMT-${hoursOffset}:${minutesOffset}`
  const ymd = `${date.getFullYear()}-${date.getMonth() + 1}-01 ${tz}`
  return new Date(ymd).getTime()
}
const startOfYearLocalTime = (timestamp) => {
  const date = new Date(timestamp)
  const hoursOffset = Math.floor(date.getTimezoneOffset() / 60)
  const minutesOffset = date.getTimezoneOffset() % 60
  const tz = `GMT-${hoursOffset}:${minutesOffset}`
  const ymd = `${date.getFullYear()}-01-01 ${tz}`
  return new Date(ymd).getTime()
}
export const getTimeMarkers = (startTimeMs: number, endTimeMs: number) => {
  const timezoneOffsetMs = new Date().getTimezoneOffset() * 1000 * 60
  const timeSpan = Math.abs(endTimeMs - startTimeMs)
  const result: any = {}
  for (const timeInterval in timeFormats) {
    const timeIntervalMs = parseInt(timeInterval)
    if (timeSpan > 20 * timeIntervalMs) {
      continue
    }

    let timestamp =
      nearestMultipleBelow(startTimeMs - timezoneOffsetMs, timeIntervalMs) + timezoneOffsetMs
    const format = formatDate(timeFormats[timeInterval])
    while (timestamp <= endTimeMs) {
      let timestampToDisplay = timestamp
      if (timeIntervalMs >= day) {
        //anchor to start of day
        timestampToDisplay = startOfDayLocalTime(timestamp)
      }
      if (timeIntervalMs >= month) {
        //anchor to start of day
        timestampToDisplay = startOfMonthLocalTime(timestamp)
      }
      if (timeIntervalMs >= year) {
        //anchor to start of day
        timestampToDisplay = startOfYearLocalTime(timestamp)
      }
      if (timestamp >= startTimeMs) {
        result[timestamp] = format(timestamp)
      }
      timestamp += timeIntervalMs
    }
  }
  return result
}
