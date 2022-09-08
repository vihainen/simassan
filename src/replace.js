function parseFlags(params = '') {
  const cleanParams = params.replace(/[ˆdgimsuy]/g, '')
  const flagSet = new Set(cleanParams.split(''))
  flagSet.add('g')

  return Array.from(flagSet).toString().replace(/,/g, '') 
}

async function parse({ reply_to_message, text }) {
  const result = []
  if (!text) return result

  const haystack = reply_to_message?.text

  if (haystack) {
    const cmd = /^s([dgimsuy]*)(?<!\\)\|(.+?)(?<!\\)\|(.*)$/
  
    let match
    if ((match = cmd.exec(text)) !== null) {
      const [, paramFlags, search, hay] = match

      const needle = `(?:${search})`
      const flags = parseFlags(paramFlags)
  
      const response = haystack.replace(RegExp(needle, flags), hay)
  
      result.push(["did you mean", response, 'REPLYREPLY'])
    }
  }

  return result
}

module.exports = parse
