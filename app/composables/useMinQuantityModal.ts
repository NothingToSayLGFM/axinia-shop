export const MIN_QUANTITY = 5

export const useMinQuantityModal = () => {
  const isOpen = useState('minQtyModalOpen', () => false)
  return { isOpen }
}
