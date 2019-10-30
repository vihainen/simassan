async function parse(text) {
  const cmd = /\(pick\s([^)]*)\)/gi
  const pattern = /(?:(\d*)"([^"]*)")|([^\s]+)/gi

  const matches = []
  for (let match of text.matchAll(cmd)) {
    const param = match[1].trim()
    
    let opts = []
    for (let match of param.matchAll(pattern)) {
      const weight = +match[1]||1
      const opt = match[2]||match[3]
      opts = [...opts, ...Array(weight).fill(opt)]
    }

    matches.push(['pick', opts[Math.floor(Math.random()*opts.length)]])
  }

  return matches
}

module.exports = parse
