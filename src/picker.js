
async function parse(text) {
  const cmd = /\(pick\s([^)]*)\)/gi

  const matches = []
  let match
  while ((match = cmd.exec(text)) !== null) {
    const param = match[1].trim()
    
    const pattern = /(?:(\d*)"([^"]*)")|([^\s]+)/gi
    let opts = [], max = 0
    while ((match = pattern.exec(param)) !== null) {
      max += +match[1]||1
      const opt = match[2]||match[3]
      opts = [...opts, [max, opt]]
    }
    const pick = (Math.floor(Math.random()*max) + 1)
    
    matches.push(['pick', opts.find(opt => opt[0] > pick)[1]])
    
    match = ''
  }

  return matches
}

module.exports = parse
