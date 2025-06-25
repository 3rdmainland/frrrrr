import ApiHttp from '../http';
import '../util/admin-context-guard'
import objToFormData from "../util/obj-to-form-data";
import LiveChatConversation, { LiveChatConversationFull } from "../model/live-chat-conversation";
import maxJavaInt from "../util/max-java-int";
import LiveChatConversationMessage from "../model/live-chat-conversation-message";
import Order from "../model/customer-past-order";
import filterToQuery from "../util/filter-to-query";
import { LIVE_CHAT_STATUS } from '@nandos-types/model/live-chat-conversation';
import type { TFilterObject } from '@nandos-types/utils';
import type { 
    TConversationReport, 
    TLiveChatBasket, 
    TLiveChatClose, 
    TLiveChatForOrder, 
    TLiveChatListing, 
    TLiveChatMessages,
    TLiveChatRestart,
    TLiveChatsendMessage,
    TLiveChatStart
} from '@nandos-types/response/live-chat';

class AdminLiveChatService {

    getChatReport(startDate: Date, endDate: Date, page = 0, pageSize = 50 ) {
        const data = {
            startDate: startDate && startDate.getTime(),
            endDate: endDate && endDate.getTime(),
            page,
            pageSize
        };

        return ApiHttp.get<TConversationReport>('/livechat/conversations/report' + filterToQuery(data, true))
            .then(response => response.data);
    }

    getChats(filters: TFilterObject = {}, pageNumber = 0, pageSize = 50) {
        return ApiHttp.post<TLiveChatListing>(`/livechat/conversations/list`, 
            objToFormData(Object.assign({
                    pageNumber,
                    pageSize
                }, 
                filters
            ))
        )
        .then(response => {
            return response.data.conversations.map(conversation => new LiveChatConversation(conversation))
        });
    }

    getOpenChats(filters: TFilterObject = {}, pageNumber = 0, pageSize = 50) {
        return this.getChats(Object.assign(filters, {status: LIVE_CHAT_STATUS.IN_PROGRESS}, pageNumber, pageSize));
    }

    getAllOpenChats(filters: TFilterObject) {
        return this.getChats(Object.assign(filters, {status: LIVE_CHAT_STATUS.IN_PROGRESS}, 0, maxJavaInt));
    }

    getChatForOrder(orderId: TFilterObject) {
        return ApiHttp.get<TLiveChatForOrder>(`/livechat/conversations/for-order/${orderId}`)
            .then(response => {
                return response.data.conversation ?  new LiveChatConversationFull(response.data.conversation) : null;
            })
    }

    getBasketForConversation(conversationId: string){
        return ApiHttp.get<TLiveChatBasket>(`/livechat/basket/${conversationId}`)
            .then(response => new Order(response.data.basket));
    }

    getMessages(conversationId: string) {
        return ApiHttp.get<TLiveChatMessages>(`/livechat/messages/${conversationId}`)
            .then(response => {
                return response.data.messages.map(conversation => new LiveChatConversationMessage(conversation))
            });
    }

    sendMessage(conversationId: string, messageBody: string) {
        return ApiHttp.post<TLiveChatsendMessage>(`/livechat/messages/send`, {conversationId, messageBody})
            .then(response => {
                response.data.message = new LiveChatConversationMessage(response.data.message)
                return response.data.message
            });
    }

    closeConversation(conversationId: string) {
        return ApiHttp.post<TLiveChatClose>(`/livechat/conversations/close/${conversationId}`)
            .then(response => {
                return new LiveChatConversation(response.data.conversation)
            });
    }

    startConversation(orderId: string, chatRequest: string) {
        return ApiHttp.post<TLiveChatStart>(`/livechat/conversations/start/${orderId}`, chatRequest)
            .then(response => {
                return new LiveChatConversation(response.data.conversation)
            })
    }

    restartConversation(conversationId: string) {
        return ApiHttp.post<TLiveChatRestart>(`/livechat/conversations/restart/${conversationId}`)
            .then(response => {
                return new LiveChatConversation(response.data.conversation)
            });
    }

}

export default new AdminLiveChatService();