export const millisecond = 1
export const second = 1000 * millisecond
export const minute = 60 * second
export const hour = 60 * minute
export const day = 24 * hour
export const week = 7 * day
export const month = 30 * day
export const year = 365 * day

//allowed bar widths on time series chart
export const timeDisplayIncrements = [
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
  5 * year,
  10 * year,
  50 * year,
  100 * year,
]

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

export const closestTimeIncrement = (n) => closestNumber(n, timeDisplayIncrements)
