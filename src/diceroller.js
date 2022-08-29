function sumLine(line) {
  const calcRegex = /[+-]?(\d+(\.\d+)?)/g
  const calc = line.match(calcRegex) || [];
  let total = 0

  while (calc.length) {
    total += parseFloat(calc.shift());
  }

  return `${total}`;
}

function getRoll(max, min = 1) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function parse({ text }) {
  const cmd = /\(roll\s([^)]+)\)/gi
  const dice = /(?:([+\-])?(?:(\d*)?([><]))?(\d*)?d(\d*)?)/gi

  const results = []
  let match
  while ((match = cmd.exec(text)) !== null) {
    const queries = match[1].trim()

    queries.split(' ').forEach(query => {
      let rollLog = '';
      const line = query.replace(dice, (...matches) => {
        let [match, groupOp, limit, filterOp, nDice = 1, diceN] = matches
        let rolls = []
        let log = ''

        let rolling = nDice
        while (rolling--) {
          const roll = diceN ? getRoll(diceN) : getRoll(1, -1)

          rolls.push(roll)
        }
        rolls.sort((a, b) => a - b)

        if (filterOp) {
          const actualLimit = limit ? (limit > nDice ? nDice : limit) : 1

          if (filterOp == '>') {
            const divise = nDice - actualLimit
            let discarded = rolls.slice(0, divise)
            let kept = rolls.slice(divise, rolls.length)

            log = `${discarded.join(' ')}${discarded.length && kept.length ? ' ' : ''}**${kept.join(' ')}**`
            rolls = kept
          } else {
            let kept = rolls.slice(0, actualLimit)
            let discarded = rolls.slice(actualLimit, rolls.length)

            log = `**${kept.join(' ')}**${kept.length && discarded.length ? ' ' : ''}${discarded.join(' ')}`
            rolls = kept
          }
        } else {
          log = rolls.join(' ')
        }

        if (groupOp == '-' || nDice > 1) {
          let result = 0
          if (groupOp == '-') {
            result = rolls.reduce((a, b) => a - b, 0)
          } else {
            result = rolls.reduce((a, b) => a + b, 0)
          }

          log += ` ↝ ${result}`
          rolls = result
        } else {
          [rolls] = rolls
        }

        rollLog += `${rollLog ? '\n' : ''}[${match} ↝ ${log}]`
        return rolls >= 0 ? `+${rolls}` : rolls
      })
    
      results.push([rollLog, sumLine(line)])
    });
  }

 return results
}

module.exports = parse
