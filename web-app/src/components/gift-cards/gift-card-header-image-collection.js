import ImageCollection from 'nandos-middleware-api/model/image-collection'

export default new ImageCollection([
  {
    path: `https://images.nandos.co.za/giftcards/headers/${process.env.VUE_APP_REGION}/giftcard-header.jpg`,
    width: 1920,
    height: 1000,
  },
  {
    path: `https://images.nandos.co.za/giftcards/headers/${process.env.VUE_APP_REGION}/giftcard-header-1024x700.jpg`,
    width: 1024,
    height: 700,
  },
])