import ApiHttp from '../http'
import Cache from './i18n-cache-service'

class SnippetService  {

  getSnippet(id) {
    let key = `snippets-${id}`
    return Cache.get(key) ||
      Cache.put(key, ApiHttp.get(`/snippets/${id}`).then(r => r.data.snippet))
  }

}

export default new SnippetService()