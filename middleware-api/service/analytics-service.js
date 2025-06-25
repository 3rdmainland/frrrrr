import GenericCrudService from "../util/generic-crud-service";
import ApiHttp from '../http';
import objToFormData from "../util/obj-to-form-data";
import AggregatorOrder from "../model/aggregator-order";
class AnalyticsService{

  track(serviceId,event,eventData = {}){
    return ApiHttp.post(`/event/${serviceId}`,{event,eventData})
      .then(response => response.data)
  }

}

export default new AnalyticsService();