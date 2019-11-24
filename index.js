const Telegram = require('telegraf/telegram')
const { json } = require('micro')

const run = require('./src/run')

const telegram = new Telegram(process.env.BOT_KEY)
function reply(chat, message_id, text) {
  telegram.sendMessage(chat, text, {
    reply_to_message_id: message_id
  })
}

function view(from, to) {
  return `${from} ↝ ${to}`
}

function sendPM(user, message_id, from, to) {
  telegram.sendMessage(user, to)
  return view(from, 'I have sent you the requested information in a private message.')
}

function sendError(data, error) {
  telegram.sendMessage(process.env.ADMIN_ID, `Error!\n${view(data, error)}`)
}

function getResponses(message) {
  return function ([from, to, type = 'MSG']) {
    switch(type) {
      case 'PM':
        return sendPM(message.from.id, message.message_id, from, to)
      case 'ERR':
        return sendError(from, to)
      case 'MSG':
        return view(from, to)
    }
  }
}

async function handler(request, response) {
  const { message } = await json(request)

  if (message && message.text) {
    const values = await run(message)
    if (values.length !== 0) {
      const responses = values.map(getResponses(message)).filter(Boolean)
      reply(message.chat.id, message.message_id, responses.join('\n'))
    }
  }

  return ''
}

module.exports = handler
