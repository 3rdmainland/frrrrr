import ApiHttp from '../http';
import '../util/admin-context-guard'
import objToFormData from "../util/obj-to-form-data";
import LiveChatConversation, {LIVE_CHAT_STATUS, LiveChatConversationFull} from "../model/LiveChatConversation";
import maxJavaInt from "../util/max-java-int";
import LiveChatConversationMessage from "../model/LiveChatConversationMessage";
import Order from "../model/customer-past-order";
import filterToQuery from "../util/filter-to-query";

class AdminLiveChatService {

    getChatReport(startDate, endDate, page = 0, pageSize = 50 ) {
        let data = {
            startDate: startDate && startDate.getTime(),
            endDate: endDate && endDate.getTime(),
            page,
            pageSize
        };
        console.log("Filters", filterToQuery(data,true))
        return ApiHttp.get('/livechat/conversations/report' + filterToQuery(data,true))
            .then(response => response.data);
    }

    getChats(filters = {}, pageNumber = 0, pageSize = 50) {
        return ApiHttp.post(`/livechat/conversations/list`, objToFormData(Object.assign({
            pageNumber,
            pageSize
        }, filters)))
            .then(response => {
                return response.data.conversations.map(conversation => new LiveChatConversation(conversation))
            })
    }

    getOpenChats(filters = {}, pageNumber = 0, pageSize = 50) {
        return this.getChats(Object.assign(filters, {status: LIVE_CHAT_STATUS.IN_PROGRESS}, pageNumber, pageSize))
    }

    getAllOpenChats(filters) {
        return this.getChats(Object.assign(filters, {status: LIVE_CHAT_STATUS.IN_PROGRESS}, 0, maxJavaInt))
    }

    getChatForOrder(orderId) {
        return ApiHttp.get(`/livechat/conversations/for-order/${orderId}`)
            .then(response => {
                return response.data.conversation ?  new LiveChatConversationFull(response.data.conversation) : null;
            })
    }

    getBasketForConversation(conversationId){
        return ApiHttp.get(`/livechat/basket/${conversationId}`)
            .then(response => new Order(response.data.basket));
    }

    getMessages(conversationId) {
        return ApiHttp.get(`/livechat/messages/${conversationId}`)
            .then(response => {
                return response.data.messages.map(conversation => new LiveChatConversationMessage(conversation))
            })
    }

    sendMessage(conversationId, messageBody) {
        return ApiHttp.post(`/livechat/messages/send`, {conversationId, messageBody})
            .then(response => {
                response.data.message = new LiveChatConversationMessage(response.data.message)
                return response.data.message
            })
    }

    closeConversation(conversationId) {
        return ApiHttp.post(`/livechat/conversations/close/${conversationId}`)
            .then(response => {
                return new LiveChatConversation(response.data.conversation)
            })
    }

    startConversation(orderId, chatRequest) {
        return ApiHttp.post(`/livechat/conversations/start/${orderId}`, chatRequest)
            .then(response => {
                return new LiveChatConversation(response.data.conversation)
            })
    }

    restartConversation(conversationId) {
        return ApiHttp.post(`/livechat/conversations/restart/${conversationId}`)
            .then(response => {
                return new LiveChatConversation(response.data.conversation)
            })
    }

}

export default new AdminLiveChatService();