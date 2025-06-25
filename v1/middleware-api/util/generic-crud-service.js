import logger from 'nandos-dev-logger'
import Observable from './observable'
import ApiHttp from '../http'
import filterToQuery from './filter-to-query'

export const ENTITIES_MODIFIED = 'ENTITIES_MODIFIED'

export default class GenericCrudService extends Observable {

  constructor(entityClass, basePath) {
    super()

    if(basePath == null) throw new Error('Missing required argument "basePath"')

    this.entityClass = entityClass
    this._basePath = basePath

    this._parseSingleEntityResponse = this._parseSingleEntityResponse.bind(this)
    this._parseMultipleEntityResponse = this._parseMultipleEntityResponse.bind(this)
    this._notifyModified = this._notifyModified.bind(this)
  }

  findAll(filters, ...rest) {
    return this._buildRequest({method: 'get', params: `?${filterToQuery(filters)}`, responseParser: this._parseMultipleEntityResponse}, ...rest)
  }

  findById(id, ...rest) {
    return this._buildRequest({method:'get', params: `/${id}`}, ...rest)
  }

  create(entity, ...rest) {
    return this._buildRequest({method:'post', data: entity}, ...rest)
      .then(this._notifyModified)
  }

  update(entity, ...rest) {
    return this._buildRequest({method:'put', data: entity}, ...rest)
      .then(this._notifyModified)
  }

  delete(entity, ...rest) {
    return this._buildRequest({method:'delete', params:`/${this._getEntityIdentifier(entity)}`, responseParser: r => r.status == 'success'}, ...rest)
      .then(this._notifyModified)
  }

  _buildRequest({method='get', params='', data = null, responseParser=this._parseSingleEntityResponse}, ...rest) {

    let basePath = this._compileBasePath(...rest)

    let config = {
      method: method,
      url: `${basePath}${params}`,
      data: data && this._buildRequestData(data),
    }

    let additionalConfig = this._buildRequestConfig(...rest)
    if(additionalConfig) config = Object.assign(config, additionalConfig)

    /**
     * Use axios's get method where possible, instead of the generic `request` method as we have special
     * handlers that prevent multiple concurrent in-flight GET requests to the same URL.
     */
    return (method == 'get' ? ApiHttp.get(config.url, additionalConfig) : ApiHttp.request(config))
      .then(response => responseParser(response, basePath))
      
  }

  _compileBasePath() {
    if(typeof this._basePath == 'function')
      return this._basePath(...arguments)
    else
      return this._basePath
  }

  _buildRequestData(entity) { return entity }

  _buildRequestConfig() {} // no-op

  _parseSingleEntityResponse(response, basePath) {
    let prop = this._getSignleEntityResponsePropertyName(basePath)
    let data = response.data[prop]
    if(!data) this._onParseError(prop, response)
    return new this.entityClass(data)
  }

  _parseMultipleEntityResponse(response, basePath) {
    let prop = this._getResponsePropertyName(basePath)
    let data = response.data[prop]
    if(!data) this._onParseError(prop, response)
    return data.map(e => new this.entityClass(e))
  }

  // Takes the last part of the path and converts to camel case (path/to/my-things -> myThings)
  _getResponsePropertyName(basePath) {
    return basePath
      .split('/')
      .pop()
      .toLowerCase()
      .replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''))
  }

  // myThings -> myThing
  _getSignleEntityResponsePropertyName(basePath) {
    return this._getResponsePropertyName(basePath).replace(/s$/, '')
  }

  _getEntityIdentifier(entity) {
    if(entity.id == null) logger.error(`Nandos Middleware`, `GenericCrudService:`, `Unable to get entity identifier using "id" for entity`, entity)
    return entity.id
  }

  // As a convenience, `_notifyModified` passes back whatever argument is passed in to allow chaining
  _notifyModified(x) {
    this.notifyObservers(ENTITIES_MODIFIED)
    return x
  }

  _onParseError(prop, response) {
    logger.error(`Nandos Middleware`, `GenericCrudService:`, `Error parsing response. "${prop}" not found on`, response)
  }
}

/**
 * Simple Usage:
 *
    class SomeRepoService extends GenericCrudService {
      constructor() {
        super(MyThingModel, '/path/to/my-things')
      }
    }

 * Provides:
 * findAll:  GET /path/to/my-things -> response.data.myThings -> Array<MyThingModel>
 * findById: GET /path/to/my-things/{id} -> response.data.myThing -> MyThingModel
 * create:   POST /path/to/my-things -> response.data.myThing -> MyThingModel
 * update:   PUT /path/to/my-things -> response.data.myThing -> MyThingModel
 * delete:   DELETE /path/to/my-things/{id} -> response.status == 'success' -> Boolean
 *
 * 
 * Advanced Usage: Parameterised base path
 * The constructor's basepath argument accepts a function that will be compiled using extraneous args passed to any CRUD method
 * Methods can optionally be overridden to produce the desired method signature, although this is not a requirement
 * 
    class SomeRepoService extends GenericCrudService {
      constructor() {
        super(MyThingModel, store => `/api/stores/${store}/my-things`)
      }

      findAll(store, filters) { return super.findAll(filters, store) }

      findById(store, id) { return super.findById(id, store) }
    }
    
    let store = 123
    SomeRepoService.findAll(store) // GET /api/stores/123/my-things
    SomeRepoService.findById(store, 456) // GET /api/stores/123/my-things/456
    // Non overridden create method, `store` must be passed in last
    SomeRepoService.create({'a new': 'thing'}, store) // POST /api/stores/123/my-things
 */