import '../util/admin-context-guard'
import GenericCrudService from '../util/generic-crud-service'
import User from '../model/user'

class AdminUserService extends GenericCrudService {

  constructor() {
    super(User, '/admin/users')
  }

  // @Override
  // TODO:: Update MW to conform to RESTful standard so we don't need this override
  findAll() {
    return this._buildRequest({params: `/all?pageSize=999`, responseParser: this._parseMultipleEntityResponse})
  }

  generateAuthTokenForUser(id) {
    return this._buildRequest({params: `/${id}/auth-token`, responseParser: r => r.data.credentials.token})
  }
}

export default new AdminUserService()