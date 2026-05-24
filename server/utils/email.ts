import { Resend } from 'resend'

const DELIVERY_LABELS: Record<string, string> = {
  branch: 'Відділення Нової Пошти',
  parcel_locker: 'Поштомат Нової Пошти',
  courier: 'Кур\'єр',
}

const PAYMENT_LABELS: Record<string, string> = {
  online: 'Онлайн-картою',
  cash_on_delivery: 'Накладений платіж',
  bank_transfer: 'Безготівковий розрахунок',
}

interface EmailOrderItem {
  name: string
  quantity: number
  price: unknown
}

interface EmailOrder {
  id: string | number
  name: string
  phone: string
  email?: string | null
  comment?: string | null
  city: string
  deliveryType: string
  warehouseDescription?: string | null
  street?: string | null
  building?: string | null
  apartment?: string | null
  paymentType: string
  totalPrice: unknown
  items: EmailOrderItem[]
}

function toNum(val: unknown): number {
  if (typeof val === 'number') return val
  if (typeof val === 'string') return parseFloat(val) || 0
  // Prisma Decimal (decimal.js) — toString() is always correct
  if (val !== null && typeof val === 'object') return parseFloat(String(val)) || 0
  return 0
}

function fmtPrice(val: unknown): string {
  const n = toNum(val)
  return n === 0 ? 'Договірна' : `${n.toLocaleString('uk-UA')}&nbsp;грн`
}

function fmtRowTotal(price: unknown, quantity: number): string {
  const n = toNum(price)
  return n === 0 ? 'Договірна' : `${(n * quantity).toLocaleString('uk-UA')}&nbsp;грн`
}

function fmtTotal(items: EmailOrderItem[], total: unknown): string {
  const hasNegotiable = items.some((i) => toNum(i.price) === 0)
  const hasPriced = items.some((i) => toNum(i.price) > 0)
  const totalNum = toNum(total)

  if (hasNegotiable && !hasPriced) return 'Договірна'
  if (hasNegotiable && hasPriced) return `≈ ${totalNum.toLocaleString('uk-UA')}&nbsp;грн (+ договірна)`
  return `${totalNum.toLocaleString('uk-UA')}&nbsp;грн`
}

function shortId(id: string | number): string {
  return String(id)
}

function itemsTable(items: EmailOrderItem[], total: unknown): string {
  const rows = items.map((item) => {
    return `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e4e4e7;">${item.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e4e4e7;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e4e4e7;text-align:right;">${fmtPrice(item.price)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e4e4e7;text-align:right;">${fmtRowTotal(item.price, item.quantity)}</td>
    </tr>`
  }).join('')

  return `<table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <thead>
      <tr style="background:#f4f4f5;">
        <th style="padding:8px 12px;text-align:left;font-weight:600;">Товар</th>
        <th style="padding:8px 12px;text-align:center;font-weight:600;">К-сть</th>
        <th style="padding:8px 12px;text-align:right;font-weight:600;">Ціна</th>
        <th style="padding:8px 12px;text-align:right;font-weight:600;">Сума</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr>
        <td colspan="3" style="padding:10px 12px;font-weight:600;text-align:right;">Разом:</td>
        <td style="padding:10px 12px;font-weight:700;text-align:right;font-size:16px;">${fmtTotal(items, total)}</td>
      </tr>
    </tfoot>
  </table>`
}

function customerHtml(order: EmailOrder): string {
  return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#09090b;">
    <div style="background:#09090b;padding:20px 24px;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;color:#ffffff;font-size:20px;">ПП Аксінья-Маркет</h1>
    </div>
    <div style="padding:24px;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 8px 8px;">
      <h2 style="margin:0 0 8px;font-size:18px;">Дякуємо за замовлення, ${order.name}!</h2>
      <p style="margin:0 0 20px;color:#52525b;">Замовлення <strong>#${shortId(order.id)}</strong> успішно прийнято.</p>
      ${itemsTable(order.items, order.totalPrice)}
      <div style="background:#f4f4f5;border-radius:6px;padding:16px;margin-top:20px;">
        <p style="margin:0;font-size:15px;">
          З вами зв'яжуться для уточнення деталей замовлення найближчим часов
          за номером телефону: <strong>${order.phone}</strong>
        </p>
      </div>
      <p style="margin:24px 0 0;font-size:13px;color:#71717a;text-align:center;">
        <a href="https://axinia.com.ua" style="color:#09090b;">axinia.com.ua</a>
      </p>
    </div>
  </div>`
}

function shopHtml(order: EmailOrder): string {
  const deliveryLabel = DELIVERY_LABELS[order.deliveryType] ?? order.deliveryType
  const paymentLabel = PAYMENT_LABELS[order.paymentType] ?? order.paymentType

  let deliveryDetail = order.warehouseDescription ?? ''
  if (order.deliveryType === 'courier' && order.street) {
    deliveryDetail = [order.street, order.building, order.apartment].filter(Boolean).join(', ')
  }

  const infoRows = [
    ['Клієнт', `<strong>${order.name}</strong>`],
    ['Телефон', order.phone],
    ['Email', order.email || '—'],
    ['Місто', order.city],
    ['Доставка', deliveryDetail ? `${deliveryLabel} — ${deliveryDetail}` : deliveryLabel],
    ['Оплата', paymentLabel],
    ...(order.comment ? [['Коментар', order.comment]] : []),
  ].map(([label, value]) =>
    `<tr><td style="padding:4px 0;color:#71717a;width:120px;">${label}</td><td style="padding:4px 0;">${value}</td></tr>`,
  ).join('')

  return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#09090b;">
    <div style="background:#16a34a;padding:20px 24px;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;color:#ffffff;font-size:20px;">Нове замовлення #${shortId(order.id)}</h1>
    </div>
    <div style="padding:24px;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 8px 8px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">${infoRows}</table>
      ${itemsTable(order.items, order.totalPrice)}
      <div style="margin-top:16px;text-align:center;">
        <a href="https://axinia.com.ua/admin/orders"
           style="background:#09090b;color:#ffffff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;">
          Відкрити в адмінці
        </a>
      </div>
    </div>
  </div>`
}

export async function sendOrderEmails(order: EmailOrder): Promise<void> {
  const config = useRuntimeConfig()
  if (!config.resendApiKey) return

  const resend = new Resend(config.resendApiKey)
  const shopEmail = config.shopEmail || 'info@axinia.com.ua'
  const id = shortId(order.id)

  const sends: Promise<unknown>[] = [
    resend.emails.send({
      from: 'ПП Аксінья-Маркет <noreply@axinia.com.ua>',
      to: shopEmail,
      subject: `Нове замовлення #${id} — ${order.name}`,
      html: shopHtml(order),
    }),
  ]

  if (order.email) {
    sends.push(
      resend.emails.send({
        from: 'ПП Аксінья-Маркет <noreply@axinia.com.ua>',
        to: order.email,
        subject: `Дякуємо за замовлення #${id}`,
        html: customerHtml(order),
      }),
    )
  }

  await Promise.all(sends)
}
