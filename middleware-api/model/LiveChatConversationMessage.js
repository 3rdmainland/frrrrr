import {LIVE_CHAT_SOURCE, LIVE_CHAT_SOURCE_ABBR} from "./LiveChatConversation";

export class LiveChatMessageAttachment {
    constructor(data = {}) {
        this.filename = data.filename
        this.imgUrl = data.imgUrl
        this.url = data.url;
    }
}

export default class LiveChatConversationMessage {

    constructor(data = {}) {
        this.id = data.id
        this.created = data.created
        this.updated = data.updated
        this.conversationId = data.conversationId
        this.sender = data.sender
        this.subject = data.subject
        this.body = data.body
        this.source = LIVE_CHAT_SOURCE[data.source]
        this.systemMessage = data.systemMessage
        this.attachments = data.attachments ? data.attachments.map((a) => new LiveChatMessageAttachment(a)) : []
    }

    getSourceInitials() {
        return LIVE_CHAT_SOURCE_ABBR[this.source]
    }
}