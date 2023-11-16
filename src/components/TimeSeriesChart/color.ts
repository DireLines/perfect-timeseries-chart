// @ts-nocheck
export const colorHash = (inputString) => {
  let sum = 0

  for (var i in inputString) {
    sum += inputString.charCodeAt(i)
  }

  const r = ~~(
    ("0." +
      Math.sin(sum + 1)
        .toString()
        .substr(6)) *
    256
  )
  const g = ~~(
    ("0." +
      Math.sin(sum + 2)
        .toString()
        .substr(6)) *
    256
  )
  const b = ~~(
    ("0." +
      Math.sin(sum + 3)
        .toString()
        .substr(6)) *
    256
  )

  const hex = "#"

  hex += ("00" + r.toString(16)).substr(-2, 2).toUpperCase()
  hex += ("00" + g.toString(16)).substr(-2, 2).toUpperCase()
  hex += ("00" + b.toString(16)).substr(-2, 2).toUpperCase()

  return hex
}

export function invertColor(hex) {
  if (hex.indexOf("#") === 0) {
    hex = hex.slice(1)
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
  if (hex.length !== 6) {
    throw new Error("Invalid HEX color.")
  }
  // invert color components
  var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
    g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
    b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16)
  // pad each with zeros and return
  return "#" + padZero(r) + padZero(g) + padZero(b)
}

function padZero(str, len) {
  len = len || 2
  var zeros = new Array(len).join("0")
  return (zeros + str).slice(-len)
}
