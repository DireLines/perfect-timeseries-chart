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
  2 * minute,
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
  2 * week,
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
  2 * minute,
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
  [10 * millisecond]: "m:s.mil",
  [100 * millisecond]: "h:m:s",
  [second]: "h:m:s",
  [5 * second]: ["h:m", "h:m:s"],
  [10 * second]: "h:m",
  [minute]: "h:m",
  [hour]: "h:m",
  [12 * hour]: ["w d", "h:m"],
  21600000: ["w d", "h:m"],
  604800000: "y-M",
  [day]: ["y-M-d", "w d"],
  [week]: "y-M-d",
  [month]: "y-M",
  [6 * month]: "y-M",
  [year]: "y",
}

function format_two_digits(n) {
  return n < 10 ? "0" + n : n
}
const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const weekdayShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const formatDate = curry((formatString: any, date: number | Date) => {
  let s = formatString
  const d = new Date(date)
  const replacements = {
    mil: d.getMilliseconds(),
    y: d.getFullYear(),
    Y: d.getFullYear(),
    M: format_two_digits(d.getMonth()),
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
  // console.log("binSize", binSizeMs)
  // console.log("format", getTimeFormat(binSizeMs, index))
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
