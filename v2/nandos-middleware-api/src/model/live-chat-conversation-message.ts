import {
    LIVE_CHAT_SOURCE, 
    LIVE_CHAT_SOURCE_ABBR, 
    type TLiveChatSource
} from "@nandos-types/model/live-chat-conversation";
import { 
    type ILiveChatConversationMessage, 
    type ILiveChatMessageAttachment 
} from "@nandos-types/model/live-chat-conversation-message";

export class LiveChatMessageAttachment {

    public filename: string;
    public imgUrl: string;
    public url: string;

    constructor(data: ILiveChatMessageAttachment = {
        filename: "",
        imgUrl: "",
        url: ""
    }) {
        this.filename = data.filename;
        this.imgUrl = data.imgUrl;
        this.url = data.url;;
    }
}

export default class LiveChatConversationMessage {

    public id: string;
    public created: number;
    public updated: number;
    public conversationId: string;
    public sender: string;
    public subject: string;
    public body: string;
    public source: TLiveChatSource;
    public systemMessage: boolean;
    public attachments: LiveChatMessageAttachment[];

    constructor(data: ILiveChatConversationMessage = {
        id: "",
        created: 0,
        updated: 0,
        conversationId: "",
        sender: "",
        subject: "",
        body: "",
        source: "QCONTACT",
        systemMessage: false,
        attachments: []
    }) {
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
        return LIVE_CHAT_SOURCE_ABBR[this.source];
    }
}