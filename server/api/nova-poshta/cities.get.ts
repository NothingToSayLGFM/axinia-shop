export default defineEventHandler(async (event) => {
  const { search } = getQuery(event)

  if (!search || String(search).length < 3) return []

  const config = useRuntimeConfig()

  const response = await $fetch<any>('https://api.novaposhta.ua/v2.0/json/', {
    method: 'POST',
    body: {
      apiKey: config.novaPostApiKey,
      modelName: 'Address',
      calledMethod: 'searchSettlements',
      methodProperties: {
        CityName: String(search),
        Limit: '20',
        Page: '1',
      },
    },
  })

  if (!response.success || !response.data?.[0]?.Addresses) return []

  return response.data[0].Addresses.map((a: any) => ({
    ref: a.Ref,
    deliveryCity: a.DeliveryCity,
    present: a.Present,
    mainDescription: a.MainDescription,
    area: a.Area,
    region: a.Region,
    settlementTypeCode: a.SettlementTypeCode,
  }))
})
