const got = require('got')
const default_to = 'brl'

let cached = []
async function getConv(curr) {
  if (cached[curr] === undefined) {
    const url = `https://free.currconv.com/api/v7/convert?q=${curr}&compact=ultra&apiKey=${process.env.MONEY_KEY}`
    cached[curr] = (await got(url, { json: true })).body[curr]
  }

  return cached[curr]
}

function view(from, to, value, ratio) {
  if (ratio === undefined) return ['error', `Check if ${from} ${to != default_to? `and ${to} are valid currencies.` : 'is a valid currency.'}`]
  else return [`${value} ${from}`, `${(value*ratio).toFixed(2)} ${to}`]
}

async function parse(text) {
  const pattern = /(\d*[,.]?\d+)\s(\w{3})(?:\sto\s(\w{3}))?(?:[\W]|$)/gi

  const matches = []
  let match
  while ((match = pattern.exec(text)) !== null) {
    const value = +match[1]
    const from = match[2]
    const to = match[3] || default_to

    const ratio = await getConv(`${from}_${to}`.toUpperCase())
    
    matches.push(view(from, to, value, ratio))
  }

  return matches
}

module.exports = parse
module.exports.getConv = getConv
