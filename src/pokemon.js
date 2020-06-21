const PokePromise = require('pokedex-promise-v2')
const Pokedex = new PokePromise()

async function abilities(text) {
  const cmd = /po?k[eé]?mo?n\|a(?:b?i?l?i?t?y?)\|(.*)/gi

  const matches = []
  let match
  while ((match = cmd.exec(text)) !== null) {
    const name = match[1].trim()

    const result = await Pokedex.getAbilityByName(name)
    const { short_effect } = result.effect_entries.find(entry => entry.language.name === 'en') || {}

    if (short_effect) matches.push([name, short_effect])

    match = ''
  }

  return matches
}

async function parse(text) {
  const functions = [abilities]
  const results = await Promise.all(functions.map(async f => await f(text)))
  return results.flat()
}

module.exports = parse
