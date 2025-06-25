import '../util/admin-context-guard';
import ApiHttp from '../http';
import { type TAdminAsyncTask } from '@nandos-types/response/admin-async-task';

class AdminDataSyncService {

    getCurrentSync() {
        return ApiHttp.get<TAdminAsyncTask>(`/system/sync/current`)
            .then(response => response.data.asyncTask)
            .catch(e => null);
    }

    startSync(stsgen2Mode: boolean, syncCapabilities: boolean, storeDataOnly: boolean, stores: string[], emails: string[]) {
        const data = {
            revisedSync: true,
            syncCapabilities,
            storeDataOnly,
            stsgen2Mode,
            stores,
            emails,
        };

        return ApiHttp.post<TAdminAsyncTask>(`/system/sync`, data)
            .then(response => response.data.asyncTask);
    }
}

export default new AdminDataSyncService();