const got = require('got')
const default_to = 'brl'

let cached = {}
async function initCache() {
  const url = `https://free.currconv.com/api/v7/currencies?apiKey=${process.env.MONEY_KEY}`
  try {
    const { results } = JSON.parse((await got(url)).body)
    cached.info = results
    cached.codes = Object.keys(cached.info)
    return true
  } catch (e) {
    console.log(e)
    return false
  }
}

async function checkCache(response) {
  if (!cached.codes) {
    const hasUpdatedCache = await initCache()
    if (!hasUpdatedCache)
      response.push(['ERROR', 'Currency service is unavailable', 'ERR'])

    return hasUpdatedCache
  }

  return true
}

async function listCodes(text) {
  const pattern = /^\/list_?currencies$/g
  const result = []
  let match
  if ((match = pattern.exec(text)) !== null) {
    try {
      const isCacheOk = await checkCache(result)
      if (!isCacheOk) return result

      const from = match[0]
      const to = 'Currently, I support using the following currencies:\n' + cached.codes.sort().reduce((acc, curr) => {
        if(acc.length && acc[acc.length - 1].length <= 5*4) acc[acc.length - 1] = `${acc[acc.length - 1]}, ${curr}`
        else acc.push(curr)

        return acc
      }, []).join('\n') + ''

      result.push([from, to, 'PM'])
    } catch (error) {
      result.push(['money.js@listCodes', error.toString(), 'ERR'])
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
      const isCacheOk = await checkCache(matches)
      if (!isCacheOk) return matches

      if (await checkCodes(from)) {
        const info = cached.info[from]
        const to = `${info.currencyName}, ${info.currencySymbol||'symbol not found.'}`
        
        matches.push([from, to])
      }
    } catch (error) {
      matches.push(['money.js@queryCurrency', error.toString(), 'ERR'])
    }
  }
  
  return matches
}

async function checkCodes(...codes) {
  const isCacheOk = await checkCache([])
  if (!isCacheOk) return false

  return codes.every(code => cached.codes.includes(code))
}

async function getRatio(curr) {
  let LOG = `BEFORE REQUEST FOR ${curr}: ${JSON.stringify(cached[curr])}`

  if (!cached[curr] || !cached[curr].when || cached[curr].when < new Date()) {
    const url = `https://free.currconv.com/api/v7/convert?q=${curr}&compact=ultra&apiKey=${process.env.MONEY_KEY}`
    const then = new Date()
    then.setTime(then.getTime() + 30*60*1000)
    
    cached[curr] = {
      ratio: JSON.parse((await got(url)).body)[curr],
      when: then
    }
    
    LOG = `${LOG}\nMADE REQUEST`
  }
  
  LOG = `${LOG}\nAFTER REQUEST: ${JSON.stringify(cached[curr])}`

  return {
    ratio: cached[curr].ratio,
    log: ['log', LOG, 'ADM']
  }
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
      const isCacheOk = await checkCache(matches)
      if (!isCacheOk) return matches

      if (await checkCodes(from, to)) {
        const { ratio, log } = await getRatio(`${from}_${to}`)

        matches.push(view(from, to, value, ratio), log)
      }
    } catch (error) {
      matches.push(['money.js@convert', error.toString(), 'ERR'])
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
