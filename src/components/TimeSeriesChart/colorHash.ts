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
