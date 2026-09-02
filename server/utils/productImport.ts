// Утиліти для парсингу XML-фіда товарів (Google Merchant RSS: <rss><channel><item g:id="..."><g:title>...)

import sanitizeHtml from 'sanitize-html'

export function escapeHtml(text: unknown): string {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Число з ціни виду "260.00 UAH" — валюта в тому ж рядку, що й сума.
 */
export function parsePriceWithCurrency(value: unknown): number | null {
  if (typeof value !== 'string') return null
  const match = value.match(/\d+(?:[.,]\d+)?/)
  if (!match) return null
  const parsed = Number(match[0].replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Короткий опис-заготовка з готового HTML-опису — просто прибираємо теги.
 */
export function extractShortDescriptionFromHtml(html: string, maxLength = 240): string {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1).trimEnd()}…`
}

const ALLOWED_DESCRIPTION_TAGS = ['h1', 'h2', 'h3', 'h4', 'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'ul', 'ol', 'li', 'blockquote', 'a']

/**
 * Опис у фіді — чужий HTML з довільного джерела, який іде через v-html на сторінці товару.
 * Обов'язково санітизуємо: прибираємо script/style/on*-атрибути/небезпечні протоколи, лишаємо тільки базове форматування.
 */
export function sanitizeDescriptionHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_DESCRIPTION_TAGS,
    allowedAttributes: { a: ['href', 'target', 'rel'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' }),
    },
  })
}

/**
 * Дописує характеристики товару (g:product_detail) в кінець опису окремим списком.
 */
export function appendSpecsHtml(html: string, details: { product_name?: string; product_value?: string }[]): string {
  const items = details
    .filter((d): d is { product_name: string; product_value: string } => !!d.product_name && !!d.product_value)
    .map((d) => `<li><strong>${escapeHtml(d.product_name)}:</strong> ${escapeHtml(d.product_value)}</li>`)
    .join('')

  if (!items) return html
  return `${html}<h3>Характеристики</h3><ul>${items}</ul>`
}
