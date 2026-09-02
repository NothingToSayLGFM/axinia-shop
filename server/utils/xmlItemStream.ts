import sax from 'sax'

// Сирий (ще не оброблений) товар з Google Merchant RSS <item> — рядки як є в XML.
export interface RawRssItem {
  id: string
  title: string
  description: string
  imageLink: string
  additionalImageLinks: string[]
  price: string
  availability: string
  productDetails: { name: string; value: string }[]
}

/**
 * SAX-стрімінговий прохід по <rss><channel><item>...</item></channel></rss> —
 * на відміну від DOM-парсера (fast-xml-parser), не тримає все дерево товарів у памʼяті одночасно:
 * кожен <item> віддається в колбек одразу після закриття тега і після цього звільняється.
 * Це і є оптимізація під малий RAM — викликається двічі (для дублікатів і для повної обробки),
 * але пікове споживання памʼяті лишається на рівні "один товар", а не "усі 3000+ одразу".
 */
export function streamRssItems(xml: string, onItem: (item: RawRssItem) => void): void {
  // strict: true — обов'язково: нестрогий режим sax переводить усі теги/атрибути у ВЕРХНІЙ
  // РЕГІСТР (розрахований на HTML-подібний розбір), через що "g:title" стає "G:TITLE"
  // і перестає збігатися нижче. Наш XML валідний, строгий режим тут — правильний вибір.
  const parser = sax.parser(true, { trim: false, normalize: false })

  let currentItem: RawRssItem | null = null
  let currentDetail: { name: string; value: string } | null = null
  let textBuffer = ''

  parser.ontext = (t) => { textBuffer += t }
  parser.oncdata = (t) => { textBuffer += t }

  parser.onopentag = (node) => {
    textBuffer = ''

    if (node.name === 'item') {
      const attrs = node.attributes as Record<string, string>
      currentItem = {
        id: attrs['g:id'] ?? attrs.id ?? '',
        title: '',
        description: '',
        imageLink: '',
        additionalImageLinks: [],
        price: '',
        availability: '',
        productDetails: [],
      }
    } else if (node.name === 'g:product_detail' && currentItem) {
      currentDetail = { name: '', value: '' }
    }
  }

  parser.onclosetag = (name) => {
    if (currentItem) {
      switch (name) {
        case 'g:title': currentItem.title = textBuffer; break
        case 'g:description': currentItem.description = textBuffer; break
        case 'g:image_link': currentItem.imageLink = textBuffer; break
        case 'g:additional_image_link': currentItem.additionalImageLinks.push(textBuffer); break
        case 'g:price': currentItem.price = textBuffer; break
        case 'g:availability': currentItem.availability = textBuffer; break
        case 'g:product_name': if (currentDetail) currentDetail.name = textBuffer; break
        case 'g:product_value': if (currentDetail) currentDetail.value = textBuffer; break
        case 'g:product_detail':
          if (currentDetail) currentItem.productDetails.push(currentDetail)
          currentDetail = null
          break
        case 'item':
          onItem(currentItem)
          currentItem = null
          break
      }
    }
    textBuffer = ''
  }

  parser.onerror = () => {
    // Нестрогий режим сам толерантний до дрібних відхилень — просто продовжуємо,
    // а не валимо весь імпорт через один зіпсований символ десь у файлі постачальника.
    parser.resume()
  }

  parser.write(xml)
  parser.close()
}
