const money = require('./money')
const picker = require('./picker')
const diceroller = require('./diceroller')

function parserRunner(text) {
  return async parser => {
    try {
      return await parser(text)
    } catch (error) {
      console.error(error)
      return [['error', 'An error occurred when handling the request.'], ['run.js', error.toString(), 'ERR']]
    }
  }
}

async function run({ text }) {
  const runner = parserRunner(text)
  const parsers = [money, picker, diceroller]
  const promisedResults = parsers.map(runner)
  const results = await Promise.all(promisedResults)

  return results.flat()
}

module.exports = run
