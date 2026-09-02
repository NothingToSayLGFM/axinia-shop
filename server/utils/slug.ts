// Транслітерація кирилиці (укр + рос літери, які можуть зустрітись у фідах постачальників) в латиницю для slug'ів
const TRANSLIT_MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ie', ж: 'zh', з: 'z',
  и: 'y', і: 'i', ї: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p',
  р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'shch', ь: '', ю: 'iu', я: 'ia',
  // росiйські літери, яких немає в укр. алфавіті — про всяк випадок, якщо фід не українізований
  ы: 'y', э: 'e', ъ: '', ё: 'e',
}

function transliterate(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map((char) => TRANSLIT_MAP[char] ?? char)
    .join('')
}

export function slugify(text: string): string {
  return transliterate(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

/**
 * Генерує slug, унікальний в межах переданого набору вже зайнятих значень.
 * Мутує `taken`, додаючи туди згенерований результат.
 */
export function generateUniqueSlug(text: string, taken: Set<string>): string {
  const base = slugify(text) || 'tovar'
  let candidate = base
  let suffix = 2
  while (taken.has(candidate)) {
    candidate = `${base}-${suffix}`
    suffix += 1
  }
  taken.add(candidate)
  return candidate
}
