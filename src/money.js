const got = require('got')
const default_to = 'brl'

let cached = {}
async function initCache() {
  const url = `https://free.currconv.com/api/v7/currencies?apiKey=${process.env.MONEY_KEY}`
  cached.info = (await got(url, { json: true })).body.results
  cached.codes = Object.keys(cached.info)
}

async function listCodes(text) {
  const pattern = /\/list_?currencies/gi
  const result = []
  let match
  if ((match = pattern.exec(text)) !== null) {
    try {
      if (!cached.codes) await initCache()
    
      const from = match[0]
      const to = 'Currently, I support using the following currencies:\n<code>' + cached.codes.reduce((acc, curr) => {
        if(acc.length && acc[acc.length - 1].length <= 5*4) acc[acc.length - 1] = `${acc[acc.length - 1]}, ${curr}`
        else acc.push(curr)

        return acc
      }, []).join('\n') + '</code>'

      result.push([from, to, 'PM'])
    } catch (error) {
      result.push(['money.js@listCodes', JSON.stringify(error), 'ERR'])
    }
  }
  
  return result
}

async function queryCurrency(text) {
  const pattern = /def\|(\w{3})(?:[\W]|$)/gi
  
  const matches = []
  let match
  while((match = pattern.exec(text)) !== null) {
    const from = match[1].toUpperCase()
    try {
      if (await checkCodes(from)) {
        const info = cached.info[from]
        const to = `${info.currencyName}, ${info.currencySymbol||'symbol not found.'}`
        
        matches.push([from, to])
      }
    } catch (error) {
      matches.push(['money.js@queryCurrency', JSON.stringify(error), 'ERR'])
    }
  }
  
  return matches
}

async function checkCodes(...codes) {
  if (!cached.codes) await initCache()

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

async function convert(text) {
  const pattern = /(\d*[,.]?\d+)\s(\w{3})(?:\sto\s(\w{3}))?(?:[\W]|$)/gi

  const matches = []
  let match
  while ((match = pattern.exec(text)) !== null) {
    const value = +match[1]
    const from = match[2].toUpperCase()
    const to = (match[3] || default_to).toUpperCase()

    try {
      if (await checkCodes(from, to)) {
        const ratio = await getRatio(`${from}_${to}`)

        matches.push(view(from, to, value, ratio))
      }
    } catch (error) {
      matches.push(['money.js@convert', JSON.stringify(error), 'ERR'])
    }
  }

  return matches
}

async function parse(text) {
  const functions = [convert, listCodes, queryCurrency]
  const results = await Promise.all(functions.map(async f => await f(text)))
  return results.flat()
}

module.exports = parse
module.exports.checkCodes = checkCodes
module.exports.convert = convert
module.exports.getRatio = getRatio
module.exports.initCache = initCache
module.exports.listCodes = listCodes
