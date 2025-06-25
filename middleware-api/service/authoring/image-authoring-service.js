import '../../util/admin-context-guard'
import GenericPaginatedCrudService from '../../util/generic-paginated-crud-service'
import ImageData from '../../model/image-data'

const BASE_PATH = '/system/images'

class ImageAuthoringService extends GenericPaginatedCrudService {

  constructor() {
    super(ImageData, BASE_PATH)
  }

  //@Override
  // TODO:: MW should support PUT request method, and should NOT require entity id in URL
  update(entity, progressFn) {
    return this._buildRequest({method: 'post', params: `/${entity.id}`, data: entity}, progressFn)
  }

  //@Override
  _buildRequestData(entity) {
    const data = new FormData()
    data.append('id', entity.id)
    data.append('name', entity.name)
    data.append('size', entity.size)
    if(entity.file) data.append('file', entity.file)

    return data
  }

  //@Override
  _buildRequestConfig(progressFn) {
    if(!progressFn) return

    return {
      onUploadProgress(e) {
        progressFn( Math.round((e.loaded * 100) / e.total), e.loaded, e.total )
      }
    }
  }
}

export default new ImageAuthoringService()