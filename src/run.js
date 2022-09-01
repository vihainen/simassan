const help = require('./help')
const money = require('./money')
const picker = require('./picker')
const diceroller = require('./diceroller')
const pokemon = require('./pokemon')
const regex = require('./replace')
const stickers = require('./stickers')

function parserRunner(message) {
  return async parser => {
    try {
      return await parser(message)
    } catch (error) {
      console.error(error)
      return [['error', 'An error occurred when handling the request.'], ['run.js', error.toString(), 'ERR']]
    }
  }
}

async function run(message) {
  const runner = parserRunner(message)
  const parsers = [help, money, picker, diceroller, pokemon, regex, stickers]
  const promisedResults = parsers.map(runner)
  const results = await Promise.all(promisedResults)

  return results.flat()
}

module.exports = run
