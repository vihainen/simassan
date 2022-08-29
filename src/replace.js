function parseFlags(params = '') {
  const cleanParams = params.replace(/[ˆdgimsuy]/g, '')
  const flagSet = new Set(cleanParams.split(''))
  flagSet.add('g')

  return Array.from(flagSet).toString().replace(/,/g, '') 
}

async function parse({ reply_to_message, text }) {
  const result = []
  const haystack = reply_to_message?.text

  if (haystack) {
    const cmd = /^\/s\/(.*\/.*)$/
  
    let match
    if ((match = cmd.exec(text)) !== null) {
      const content = match[1].trim()
      const [needle, hay, paramFlags] = content.split('/')
      const flags = parseFlags(paramFlags)
  
      const response = haystack.replace(RegExp(needle, flags), hay)
  
      result.push(["did you mean", response])
    }
  }

  return result
}

module.exports = parse
