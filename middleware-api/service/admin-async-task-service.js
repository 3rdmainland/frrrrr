import '../util/admin-context-guard'
import ApiHttp from '../http';

class AdminAsyncTaskService {

  getStatus(asyncTask) {
    return ApiHttp.get(`/admin/async/${asyncTask.id}`)
      .then(response => response.data.asyncTask)
  }

  abort(asyncTask) {
    return ApiHttp.delete(`/admin/async/${asyncTask.id}`)
      .then(response => response.status === 200)
  }

  deleteTask(asyncTask) {
    return ApiHttp.delete(`/admin/async/${asyncTask.id}/force`)
        .then(response => {
          if (response.status === 200) {
            return true;
          } else {
            throw new Error('Failed to delete task');
          }
        });
  }

  forceCompleteAll() {
}

}

export default new AdminAsyncTaskService();