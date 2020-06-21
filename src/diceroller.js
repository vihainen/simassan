function getRoll(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getOpText(result, op, rolls) {
  return `*${result}* _${op}(${rolls})_`
}

function getRolledDices(op, n, min, max, mod) {
  const dice = `d${(min != -1 || max != 1)? `${min != 1? `${min},` : ''}${max}` : ''}`
  return `${op}${n}${dice}${mod? ` (${mod > 0? `+${mod}` : mod})` : ''}`
}

function getRolls(op, n, min, max, mod) {
  const rolls = []
  let i = n
  while(i--) {
    rolls.push(getRoll(min, max))
  }
  
  let result = rolls.join(' ')
  
  let roll;
  switch(op) {
    case '+': roll = mod + rolls.reduce((sum, roll) => sum + roll); break
    case '>': roll = mod + rolls.reduce((max, roll) => (roll > max)? roll : max); break
    case '<': roll = mod + rolls.reduce((min, roll) => (roll < min)? roll : min, rolls[0]); break
    case '~': roll = mod + Math.round(rolls.reduce((sum, roll) => sum + roll)/rolls.length); break
    default: roll = rolls.map(roll => roll + mod).join(' ')
  }

  result = getOpText(roll, op, result)
  
  return [getRolledDices(op, n, min, max, mod), result]
}

async function parse(text) {
  const cmd = /\(roll\s([^)]*)\)/gi

  const matches = []
  let match
  while ((match = cmd.exec(text)) !== null) {
    const param = match[1].trim()
    
    const pattern = /(?:([+><~]?)(\d*)d(?:(-?\d*),)?(\d*))([+-]\d*)?/gi
    let opts = []
    while ((match = pattern.exec(param)) !== null) {
      const op = match[1]||''
      const n = +match[2]||1
      let max = +match[4]
      const mod = +match[5]||0
      
      let min
      if(match[3] === undefined) {
        if(match[4] === '') [min, max] = [-1, 1]
        else min = 1
      } else min = +match[3]
      
      matches.push(getRolls(op, n, min, max, mod))
    }
    
    match = ''
  }

  return matches
}

module.exports = parse



