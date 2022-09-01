const stickerMap = {
  "AgADgAIAAqW3eEc": "CAACAgEAAxkBAAECzjZjEMKCCRYVbcFAsM61L8sjBnpNrQACYwEAApj0eEcuOYZaFLbOjSkE"
}

async function parse({ sticker }) {
  const result = []
  if (sticker) {
      const response = stickerMap[sticker.file_unique_id]

      if (response)
        result.push([null, response, 'STICKER'])
  }

  return result
}

module.exports = parse
