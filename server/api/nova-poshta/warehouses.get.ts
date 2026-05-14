// TypeOfWarehouseRef from Nova Poshta:
// parcel_locker: f9316480-5f2d-425d-bc2c-ac7cd29decf0
// branch: no filter needed — Nova Poshta doesn't reliably filter branches by GUID
const WAREHOUSE_TYPE_REFS: Record<string, string> = {
  parcel_locker: 'f9316480-5f2d-425d-bc2c-ac7cd29decf0',
}

export default defineEventHandler(async (event) => {
  const { cityRef, type } = getQuery(event)

  if (!cityRef) return []

  const config = useRuntimeConfig()

  const body: Record<string, unknown> = {
    apiKey: config.novaPostApiKey,
    modelName: 'Address',
    calledMethod: 'getWarehouses',
    methodProperties: {
      CityRef: String(cityRef),
      Limit: '200',
      Page: '1',
    },
  }

  if (type && WAREHOUSE_TYPE_REFS[String(type)]) {
    (body.methodProperties as Record<string, string>).TypeOfWarehouseRef = WAREHOUSE_TYPE_REFS[String(type)]
  }

  const response = await $fetch<any>('https://api.novaposhta.ua/v2.0/json/', {
    method: 'POST',
    body,
  })

  if (!response.success || !response.data) return []

  return response.data.map((w: any) => ({
    ref: w.Ref,
    description: w.Description,
    shortAddress: w.ShortAddress,
    number: w.Number,
  }))
})
