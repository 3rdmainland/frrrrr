import ImageCollection from './image-collection'

export default class Promotion {
  
  constructor(data = {}) {
    this.id = data.id
    this.name = data.name
    this.link = data.link
    this.linkText = data.linkText
    this.youtubeId = data.youtubeId
    this.index = data.index
    this.description = data.description
    this.dateStart = data.dateStart && new Date(data.dateStart)
    this.dateEnd = data.dateStart && new Date(data.dateEnd)
    this.imageCollection = new ImageCollection(data.images)
    this.accentColor = data.accentColor
  }

  get linkIsExternal() {
    return this.link != null && this.link.includes('http')
  }

  get internalPath() {
    return this.link != null && this.link.replace(process.env.VUE_APP_ROUTER_BASE_PATH, '')
  }
}