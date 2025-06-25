import LiveChatConversationMessage from "./LiveChatConversationMessage";

export const LIVE_CHAT_STATUS = {
    IN_PROGRESS: 'IN_PROGRESS',
    CLOSED: 'CLOSED',
}

export const LIVE_CHAT_SOURCE = {
    QCONTACT: "QCONTACT",
    PICUP: "PICUP",
    INTERNAL: "INTERNAL",
}

export const LIVE_CHAT_SOURCE_ABBR = {
    QCONTACT: "DSG",
    PICUP: "PIC",
    INTERNAL: "HQ",
}
export const LIVE_CHAT_CATEGORIES = {
    WEATHER_DELAYS: 'WEATHER_DELAYS',
    DELIVERY_RUNNING_LATE: 'DELIVERY_RUNNING_LATE',
    IN_STORE_DELAY: 'IN_STORE_DELAY',
    DRIVER_RELATED_ISSUE: 'DRIVER_RELATED_ISSUE',
    PAYMENT_ISSUE: 'PAYMENT_ISSUE',
    OTHER: 'OTHER'
}
export default class LiveChatConversation {

    constructor(data = {}) {
        this.id = data.id
        this.orderRef = data.orderRef
        this.liveChatCategory = LIVE_CHAT_CATEGORIES[data.category] ?? data.category
        this.status = LIVE_CHAT_STATUS[data.status]
        this.source = LIVE_CHAT_SOURCE[data.source]
        this.storeId = data.storeId
        this.basketId = data.basketId
        this.customerId = data.customerId
        this.latestMessageBody = data.latestMessageBody ?? "No messages yet";
        this.latestMessageSender = data.latestMessageSender;
        this.latestMessageTime = data.latestMessageTime;
        this.created = data.created
        this.subject = data.subject
    }

    getSourceInitials() {
        return LIVE_CHAT_SOURCE_ABBR[this.source]
    }
}

export class LiveChatConversationFull {

    constructor(data = {}) {
        this.id = data.id
        this.orderRef = data.orderRef
        this.liveChatCategory = LIVE_CHAT_CATEGORIES[data.category] ?? data.category
        this.status = LIVE_CHAT_STATUS[data.status]
        this.source = LIVE_CHAT_SOURCE[data.source]
        this.storeId = data.storeId
        this.basketId = data.basketId
        this.created = data.created
        this.customerId = data.customerId
        this.latestMessageBody = data.latestMessage.body ?? "No messages yet";
        this.latestMessageSender = data.latestMessage.sender ?? null;
        this.latestMessageTime = data.latestMessage.created ?? null;
        this.subject = data.subject
        this.messages = data.messages.map((m) => new LiveChatConversationMessage(m))
    }

    getSourceInitials() {
        return LIVE_CHAT_SOURCE_ABBR[this.source]
    }
}