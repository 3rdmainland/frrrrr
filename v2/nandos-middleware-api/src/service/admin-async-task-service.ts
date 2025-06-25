import '../util/admin-context-guard';
import ApiHttp from '../http';
import { type IAsyncTask } from '@nandos-types/model/async-task';
import { type TAdminAsyncTask } from '@nandos-types/response/admin-async-task';

class AdminAsyncTaskService {

  getStatus(asyncTask: IAsyncTask) {
    return ApiHttp.get<TAdminAsyncTask>(`/admin/async/${asyncTask.id}`)
      .then(response => response.data.asyncTask);
  }

  abort(asyncTask: IAsyncTask) {
    return ApiHttp.delete<TAdminAsyncTask>(`/admin/async/${asyncTask.id}`)
      .then(response => response.status === "success")
  }

  deleteTask(asyncTask: IAsyncTask) {
    return ApiHttp.delete<TAdminAsyncTask>(`/admin/async/${asyncTask.id}/force`)
    .then(response => {
      if (response.status === "success") {
        return true;
      } else {
        throw new Error('Failed to delete task');
      }
    });
  }

  forceCompleteAll() {}
}

export default new AdminAsyncTaskService();