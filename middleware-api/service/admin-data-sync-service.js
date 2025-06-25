import '../util/admin-context-guard'
import ApiHttp from '../http';

class AdminDataSyncService {

    getCurrentSync() {
        return ApiHttp.get(`/system/sync/current`)
            .then(response => response.data.asyncTask)
            .catch(e => null)
    }

    startSync(stsgen2Mode, syncCapabilities, storeDataOnly, stores, emails) {
        let data = {
            revisedSync: true,
            syncCapabilities: syncCapabilities,
            storeDataOnly: storeDataOnly,
            stsgen2Mode: stsgen2Mode,
            stores,
            emails: [].concat(emails),
        }

        return ApiHttp.post(`/system/sync`, data)
            .then(response => response.data.asyncTask)
    }
}

export default new AdminDataSyncService();