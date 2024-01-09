import React, { useState } from "react"
import ReactDOM from "react-dom"
import { TimeSeriesChart } from "../dist"
const second = 1000
const minute = 60 * second
const hour = 60 * minute
const day = 24 * hour
const week = 7 * day
const month = 30 * day
const generateRandomString = (length) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  const charactersLength = characters.length
  let result = ""

  // Create an array of 32-bit unsigned integers
  const randomValues = new Uint32Array(length)

  // Generate random values
  window.crypto.getRandomValues(randomValues)
  randomValues.forEach((value) => {
    result += characters.charAt(value % charactersLength)
  })
  return result
}
const makeBigData = ({
  numColumns = 100,
  valuesPerColumn = 50,
  countMultiplier = 20,
  timeSpacing = minute,
}) => {
  const result = []
  const values = []
  for (let j = 0; j < valuesPerColumn; j++) {
    values.push(generateRandomString(8))
  }
  for (let i = 0; i < numColumns; i++) {
    const counts = {}
    for (const v of values) {
      counts[v] = Math.round(Math.random() * countMultiplier)
    }
    result.push({
      time: Date.now() - timeSpacing * i,
      counts,
    })
  }
  return result
}
const bigData = makeBigData({ countMultiplier: 100, numColumns: 10000, timeSpacing: week })
const data = [
  {
    time: Date.now(),
    counts: {
      red: 5,
      blue: 8,
      green: 11,
    },
  },
  {
    time: Date.now() - 1 * hour,
    counts: {
      red: 1,
      blue: 2,
      bleu: 2,
      green: 3,
    },
  },
  {
    time: Date.now() - 2 * hour,
    counts: {
      green: 0,
      red: 8,
      blue: 5,
      bleu: 2,
    },
  },
  {
    time: Date.now() - 3 * hour,
    counts: {
      red: 8,
      blue: 4,
      green: 0,
    },
  },
]
const logData = [
  {
    time: Date.now(),
    counts: {
      info: 5,
      warn: 8,
      error: 11,
    },
  },
  {
    time: Date.now() - 1 * hour,
    counts: {
      info: 1,
      warn: 2,
      error: 3,
    },
  },
  {
    time: Date.now() - 2 * hour,
    counts: {
      error: 0,
      info: 8,
      warn: 5,
    },
  },
  {
    time: Date.now() - 3 * hour,
    counts: {
      info: 8,
      warn: 4,
      error: 0,
    },
  },
]
const Dashboard = () => {
  const [range, setRange] = useState({ start: Date.now() - 5 * day, end: Date.now() })
  return (
    <>
      <TimeSeriesChart
        data={data}
        start={range.start}
        end={range.end}
        onTimeRangeChange={(s, e) => {
          setRange({ start: s, end: e })
        }}
        columnName="color"
      />
      <TimeSeriesChart data={bigData} />
    </>
  )
}
ReactDOM.render(
  <>
    <TimeSeriesChart data={logData} columnName="level" />
    <Dashboard />
  </>,
  document.getElementById("app")
)
