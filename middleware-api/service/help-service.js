import ApiHttp from '../http'
import MeService from './customer/me-service';
import Cache from './i18n-cache-service'

const parseContext = str => str.replace(/-/g, '_').toUpperCase()

class HelpService  {

  get customerId() {
    return MeService.customerId
  }

  getHelpItems(context) {
  	let path = context ? `/help-items/${parseContext(context)}` : `/help-items`
  	return Cache.get(path)
  		|| Cache.put(path, ApiHttp.get(path)
  			   .then(response => response.data.items)
  			   .then(items => items.sort((a, b) => a.displayOrder - b.displayOrder)))
  }

  getHelpItem(context, id) {
  	return this.getHelpItems(parseContext(context))
  		.then(items => items.find(item => item.id == id) || Promise.reject(new Error('ITEM_NOT_FOUND')))
  }

  submitQuery(userMessage, helpItemId, relatedEntityId, context) {
  	return ApiHttp.post(`/customers/${this.customerId}/feedback`, {userMessage, helpItemId, relatedEntityId, context: parseContext(context)})
  		.then(response => response.status == 'success')
  }
}

export default new HelpService()