import '../../util/admin-context-guard'
import GenericCrudService from '../../util/generic-crud-service'
import Snippet from '../../model/authoring/snippet'

class SnippetAuthoringService extends GenericCrudService {

  constructor() {
    super(Snippet, '/system/snippets')
  }

}

export default new SnippetAuthoringService()