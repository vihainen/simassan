function buildHelper(pattern, response) {
  return async function help(text) {
    const result = []
    let match
    if ((match = pattern.exec(text)) !== null) {
      result.push([match[0], response])
    }

    return result
  }
}

const moneyHelpText = 'Inline. (value) CODE to CODE, eg "500 JPY to USD". The "to" part can be omitted to get the default BRL, eg "20 USD"'
const money = buildHelper(/^\/money$/g, moneyHelpText)

const moneyDefHelpText = 'Inline. def|CODE, eg def|USD.'
const moneydef = buildHelper(/^\/moneydef$/g, moneyDefHelpText)

const listCurrenciesHelpText = 'Sends a private message showing supported currency CODEs.'

const rollHelpText = 'Inline. (roll NdS), eg: (roll 4d20). You can roll multiple dice with a single command and use some modifiers, eg: (roll 1d20 +4d10+5) will roll one d20 and sum the results of 4 d10 with a single +5 modifier. The default die is a fate dice (-1, 0, +1)'
const roll = buildHelper(/^\/roll$/g, rollHelpText)

const pickHelpText = 'Inline. (pick A B C). Encase an option with quotes if you want spaces, eg (pick one two "third option"). Can use modifiers, eg (pick 2"A" B C) will behave as if there were two "A" options.'
const pick = buildHelper(/^\/pick$/g, pickHelpText)

const pokemonHelpText = 'WIP, inline. pokemon|move|NAME. Fetches some info about a pokemon move. You can omit letters, eg "pkmn|mv|hyper fang"'
const pokemonMove = buildHelper(/^\/pokemon_?move$/g, pokemonHelpText)

//basically the botfather /setcommands text, slightly edited
const help = buildHelper(/^\/help$/g, `/help - Sends this very ugly message. Might (and should) make this look better in the future. I prolly won't.

The following comands are help commands. Those will just return a help message, the actual command they refer to is outlined in the message.

/money - ${moneyHelpText}

/moneydef - ${moneyDefHelpText}

/roll - ${rollHelpText}

/pick - ${pickHelpText}

/pokemonmove - ${pokemonHelpText}

The following commands are support/help commands

/listcurrencies - ${listCurrenciesHelpText}`)

async function parse({ text }) {
  const functions = [help, money, moneydef, roll, pick, pokemonMove]
  const results = await Promise.all(functions.map(async f => await f(text)))
  return results.flat()
}

module.exports = parse
