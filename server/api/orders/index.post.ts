import { z } from 'zod'

const itemSchema = z.object({
  productId: z.number().int().optional(),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  image: z.string().optional(),
})

const schema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  comment: z.string().optional(),
  city: z.string().min(1),
  cityRef: z.string().min(1),
  deliveryType: z.enum(['branch', 'parcel_locker', 'courier']),
  warehouseRef: z.string().optional(),
  warehouseDescription: z.string().optional(),
  street: z.string().optional(),
  building: z.string().optional(),
  apartment: z.string().optional(),
  paymentType: z.enum(['online', 'cash_on_delivery', 'bank_transfer']),
  items: z.array(itemSchema).min(1),
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, schema.parse)
  const { items, email, ...orderData } = body

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const order = await prisma.order.create({
    data: {
      ...orderData,
      email: email || null,
      totalPrice,
      items: {
        create: items.map((item) => ({
          productId: item.productId ?? null,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image ?? null,
        })),
      },
    },
    include: { items: true },
  })

  return order
})
