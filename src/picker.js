async function parse(text) {
  const cmd = /\(pick\s([^)]*)\)/gi

  const matches = []
  let match
  while ((match = cmd.exec(text)) !== null) {
    const param = match[1].trim()
    
    const pattern = /(?:(\d*)"([^"]*)")|([^\s]+)/gi
    let opts = []
    while ((match = pattern.exec(param)) !== null) {
      const weight = +match[1]||1
      const opt = match[2]||match[3]
      opts = [...opts, ...Array(weight).fill(opt)]
    }

    matches.push(['pick', opts[Math.floor(Math.random()*opts.length)]])
    
    match = ''
  }

  return matches
}

module.exports = parse
