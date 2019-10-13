const money = require('./money')

function parserRunner(text) {
  return async parser => {
    try {
      return await parser(text)
    } catch (error) {
      return [['error', 'An error occurred when handling the request.'], ['run.js', JSON.stringify(error), 'ERR']]
    }
  }
}

async function run({ text }) {
  const runner = parserRunner(text)
  const parsers = [money]
  const promisedResults = parsers.map(runner)
  const results = await Promise.all(promisedResults)

  return results.flat()
}

module.exports = run
