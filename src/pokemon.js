const PokePromise = require('pokedex-promise-v2')
const Pokedex = new PokePromise()

async function moves(text) {
  const cmd = /po?k[eé]?mo?n\|m(?:o?v?e?)\|(.*)/gi

  const matches = []
  let match
  while ((match = cmd.exec(text)) !== null) {
    const name = match[1].trim().replace(/\s/g, '-')

    const result = await Pokedex.getMoveByName(name)
    const {
      accuracy,
      pp,
      power,
      effect_entries,
      damage_class: { name: damage_class },
      type: { name: type }
    } = result;
    const { short_effect } = effect_entries.find(entry => entry.language.name === 'en') || {}

    if (short_effect)
      matches.push([
        name,
        `\`\`\`${short_effect}\nPower: ${power} | PP: ${pp} | ACC: ${accuracy}\n${type} | ${damage_class}\`\`\``
      ])

    match = ''
  }

  return matches
}

async function abilities(text) {
  const cmd = /po?k[eé]?mo?n\|a(?:b?i?l?i?t?y?)\|(.*)/gi

  const matches = []
  let match
  while ((match = cmd.exec(text)) !== null) {
    const name = match[1].trim().replace(/\s/g, '-')

    const result = await Pokedex.getAbilityByName(name)
    const { short_effect } = result.effect_entries.find(entry => entry.language.name === 'en') || {}

    if (short_effect) matches.push([name, short_effect])

    match = ''
  }

  return matches
}

async function parse(text) {
  const functions = [abilities, moves]
  const results = await Promise.all(functions.map(async f => await f(text)))
  return results.flat()
}

module.exports = parse
