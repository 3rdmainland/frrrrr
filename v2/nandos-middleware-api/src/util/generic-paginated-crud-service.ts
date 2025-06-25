import GenericCrudService from './generic-crud-service'
import filterToQuery from './filter-to-query'
import type { 
  TGenericConstructorEntity, 
  TFilterObject 
} from '@nandos-types/utils';


export default class GenericPaginatedCrudService<T extends {id: string | number}> extends GenericCrudService<T> {

  constructor(entityClass: TGenericConstructorEntity<T>, basePath: string) {
    super(entityClass, basePath);
  }

  // @Override
  findAll(filters: TFilterObject, pageNumber = 0, pageSize = 50, ...rest: any[]) {

    return this._buildRequest({
      method: 'get',
      params: `?pageNumber=${pageNumber}&pageSize=${pageSize}&${filterToQuery(filters)}`,
      responseParser: (response, basePath) => {
        let prop = this._getResponsePropertyName(basePath)
        let {pageNumber:currentPage, totalPages, [prop]:entities, totalEntities } = response.data
        if(!entities) this._onParseError(prop, response)

        return {
          entities: entities.map((e: any) => new this.entityClass(e)),
          currentPage,
          totalPages,
          totalEntities,
        }
      }
    }, ...rest)
  }
}