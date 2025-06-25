import '../../util/admin-context-guard'
import { mapI18nValues } from '../../service/admin-language-service'

export default class Snippet {
  
  constructor(data = {}) {
    this.id = data.id
    this.snippet = mapI18nValues(data.snippet)
  }
}