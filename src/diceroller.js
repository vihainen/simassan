function getRoll(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getOpText(result, op, rolls) {
  return `${result} ${op}(${rolls})`
}

function getRolledDices(op, n, min, max) {
  return `${op}${n}d${min != 1? `${min},` : ''}${max}`
}

function getRolls(op, n, min, max) {
  const rolls = []
  let i = n
  while(i--) {
    rolls.push(getRoll(min, max))
  }
  
  let result = rolls.join(' ')
  
  switch(op) {
    case '+': result = getOpText(rolls.reduce((sum, roll) => sum + roll), op, result); break
    case '>': result = getOpText(rolls.reduce((max, roll) => (roll > max)? roll : max), op, result); break
    case '<': result = getOpText(rolls.reduce((min, roll) => (roll < min)? roll : min, rolls[0]), op, result); break
    case '~': result = getOpText(Math.round(rolls.reduce((sum, roll) => sum + roll)/rolls.length), op, result); break
  }
  
  return [getRolledDices(op, n, min, max), result]
}

async function parse(text) {
  const cmd = /\(roll\s([^)]*)\)/gi

  const matches = []
  let match
  while ((match = cmd.exec(text)) !== null) {
    const param = match[1].trim()
    
    const pattern = /(?:([+><~]?)(\d*)d(?:(-?\d*),)?(\d*))/gi
    let opts = []
    while ((match = pattern.exec(param)) !== null) {
      const op = match[1]
      const n = +match[2]||1
      let max = +match[4]
      
      let min
      if(match[3] === undefined) {
        if(match[4] === '') [min, max] = [-1, 1]
        else min = 1
      } else min = +match[3]
      
      matches.push(getRolls(op, n, min, max))
    }
    
    match = ''
  }

  return matches
}

module.exports = parse



