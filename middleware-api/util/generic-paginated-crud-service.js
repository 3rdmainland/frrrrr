import GenericCrudService from './generic-crud-service'
import filterToQuery from '../util/filter-to-query'

export default class GenericPaginatedCrudService extends GenericCrudService {

  constructor() {
    super(...arguments)
  }

  // @Override
  findAll(filters, pageNumber = 0, pageSize = 50, ...rest) {

    return this._buildRequest({
      method: 'get',
      params: `?pageNumber=${pageNumber}&pageSize=${pageSize}&${filterToQuery(filters)}`,
      responseParser: (response, basePath) => {
        let prop = this._getResponsePropertyName(basePath)
        let {pageNumber:currentPage, totalPages, [prop]:entities, totalEntities } = response.data
        if(!entities) this._onParseError(prop, response)

        return {
          entities: entities.map(e => new this.entityClass(e)),
          currentPage,
          totalPages,
          totalEntities,
        }
      }
    }, ...rest)
  }
}