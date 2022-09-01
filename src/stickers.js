const stickerMap = {
  "CAACAgEAAxkBAAEFu4VjEL4RN_d8tjGuAAHxzL79BlcIzf4AAoACAAKlt3hH01FOBBnH8OApBA": "CAACAgEAAxkBAAEFu4djEL6z5eah0PXYNb16Hwxge0V46QACYwEAApj0eEcuOYZaFLbOjSkE"
}

async function parse({ sticker }) {
  const result = []
  if (sticker) {
      const response = stickerMap[sticker.file_id]

      if (response)
        result.push([null, response, 'STICKER'])
  }

  return result
}

module.exports = parse
