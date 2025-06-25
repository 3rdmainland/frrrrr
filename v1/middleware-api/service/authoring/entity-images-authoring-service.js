import '../../util/admin-context-guard'
import Observable from '../../util/observable'
import ApiHttp from '../../http'
import ImageData from '../../model/image-data'

export const ENTITY_IMAGES_CHANGED = 'ENTITY_IMAGES_CHANGED';

class EntityImagesAuthoringService extends Observable  {

  constructor() {
    super()
    this._notifyChange = this._notifyChange.bind(this)
  }

  getEntityImages(entityId) {
    return ApiHttp.get(`/system/entity/${entityId}/images`)
      .then(response => response.data.images.map(i => new ImageData(i)))
  }

  addEntityImage(entityId, imageId) {
    return ApiHttp.post(`/system/entity/${entityId}/link/${imageId}`)
      .then(response => response.status == 'success')
      .then(this._notifyChange)
  }

  deleteEntityImage(entityId, imageId) {
    return ApiHttp.delete(`/system/entity/${entityId}/link/${imageId}`)
      .then(response => response.status == 'success')
      .then(this._notifyChange)
  }

  _notifyChange(x) { // as a convenience, `_notifyChange` passing back whatever argument is passed in to allow chaining
    this.notifyObservers(ENTITY_IMAGES_CHANGED)
    return x
  }

}

export default new EntityImagesAuthoringService()