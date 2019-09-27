const got = require('got')
const default_to = 'brl'

let cached = {}
async function checkCodes(...codes) {
  if (!cached.codes) {
    const url = `https://free.currconv.com/api/v7/currencies?apiKey=${process.env.MONEY_KEY}`
    cached.codes = Object.keys((await got(url, { json: true })).body.results)
  }

  return codes.every(code => cached.codes.includes(code))
}

async function getRatio(curr) {
  if (!cached[curr]) {
    const url = `https://free.currconv.com/api/v7/convert?q=${curr}&compact=ultra&apiKey=${process.env.MONEY_KEY}`
    cached[curr] = (await got(url, { json: true })).body[curr]
  }

  return cached[curr]
}

const view = (from, to, value, ratio) => [`${value} ${from}`, `${(value*ratio).toFixed(2)} ${to}`]

async function parse(text) {
  const pattern = /(\d*[,.]?\d+)\s(\w{3})(?:\sto\s(\w{3}))?(?:[\W]|$)/gi

  const matches = []
  let match
  while ((match = pattern.exec(text)) !== null) {
    const value = +match[1]
    const from = match[2].toUpperCase()
    const to = (match[3] || default_to).toUpperCase()

    if (await checkCodes(from, to)) {
      const ratio = await getRatio(`${from}_${to}`)
     
      matches.push(view(from, to, value, ratio))
    }
  }

  return matches
}

module.exports = parse
module.exports.checkCodes = checkCodes
module.exports.getRatio = getRatio
