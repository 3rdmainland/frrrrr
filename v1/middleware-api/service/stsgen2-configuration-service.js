import '../util/admin-context-guard'
import GenericCrudService from '../util/generic-crud-service'
import STSGen2Configuration from '../model/stsgen2-configuration'
import objToFormData from "../util/obj-to-form-data";

class STSGen2ConfigurationService extends GenericCrudService {

  constructor() {
    super(STSGen2Configuration, '/system/stsgen2/configuration')
  }

  async findAll() {
    const response = await this._buildRequest({
      method: 'GET',
      url: this.basePath
    });

    const configData = response?.data || {};
    return new STSGen2Configuration(configData);
  }

  saveConfig(config) {
    return this._buildRequest({
      method: 'POST',
      params: '/save',
      headers: { 'Content-Type': 'application/json' },
      data: {
        username: config.username,
        password: config.password,
      }
    })
  }

  clearCredentials() {
    return this._buildRequest({
      method: 'POST',
      params: '/clear',
    })
  }

  togglePing(disablePing) {
    return this._buildRequest({
      method: 'POST',
      params: '/toggle-ping',
      data: { disablePing }
    });
  }

  testConnection(config) {
    return this._buildRequest({
      method: 'POST',
      params: '/test-connection',
      headers: { 'Content-Type': 'application/json' },
      data: {
        username: config.username,
        password: config.password,
        disablePing: config.disablePing
      }
    })
  }

  // Override to Align with Other Services
  _getResponsePropertyName(basePath) {
    return 'data';
  }
}

export default new STSGen2ConfigurationService()
