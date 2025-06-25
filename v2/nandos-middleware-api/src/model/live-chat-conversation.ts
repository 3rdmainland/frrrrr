import LiveChatConversationMessage from "./live-chat-conversation-message";
import { 
    LIVE_CHAT_STATUS,
    LIVE_CHAT_SOURCE,
    LIVE_CHAT_CATEGORIES,
    LIVE_CHAT_SOURCE_ABBR,
    type TLiveChatStatus,
    type TLiveChatSource,
    type TLiveChatCategory,
    type ILiveChatConversation,
    type ILiveChatConversationFull,
} from '@nandos-types/model/live-chat-conversation';


export default class LiveChatConversation {

    public id: string;
    public orderRef: string;
    public liveChatCategory: TLiveChatCategory;
    public status: TLiveChatStatus;
    public source: TLiveChatSource;
    public storeId: string;
    public basketId: string;
    public customerId: string;
    public latestMessageBody: string;
    public latestMessageSender: string;
    public latestMessageTime: number;
    public created: number;
    public subject: string;

    constructor(data: ILiveChatConversation = {
        id: "",
        orderRef: "",
        category: "WEATHER_DELAYS",
        status: "IN_PROGRESS",
        source: "QCONTACT",
        storeId: "",
        basketId: "",
        customerId: "",
        latestMessageBody: "",
        latestMessageSender: "",
        latestMessageTime: 0,
        created: 0,
        subject: ""
    }) {
        this.id = data.id;
        this.orderRef = data.orderRef;
        this.liveChatCategory = LIVE_CHAT_CATEGORIES[data.category] ?? data.category;
        this.status = LIVE_CHAT_STATUS[data.status];
        this.source = LIVE_CHAT_SOURCE[data.source];
        this.storeId = data.storeId;
        this.basketId = data.basketId;
        this.customerId = data.customerId;
        this.latestMessageBody = data.latestMessageBody ?? "No messages yet";;
        this.latestMessageSender = data.latestMessageSender;;
        this.latestMessageTime = data.latestMessageTime;;
        this.created = data.created;
        this.subject = data.subject;
    }

    getSourceInitials() {
        return LIVE_CHAT_SOURCE_ABBR[this.source];
    }
}

export class LiveChatConversationFull {

    public id: string;
    public orderRef: string;
    public liveChatCategory: TLiveChatCategory;
    public status: TLiveChatStatus;
    public source: TLiveChatSource;
    public storeId: string;
    public basketId: string;
    public created: number;
    public customerId: string;
    public latestMessageBody: string;
    public latestMessageSender: string;
    public latestMessageTime: string;
    public subject: string;
    public messages: LiveChatConversationMessage[];

    constructor(data: ILiveChatConversationFull = {
        id: "",
        orderRef: "",
        category: "WEATHER_DELAYS",
        status: "IN_PROGRESS",
        source: "QCONTACT",
        storeId: "",
        basketId: "",
        created: 0,
        customerId: "",
        latestMessage: {
            body: "",
            sender: "",
            created: ""
        },
        subject: "",
        messages: []
    }) {
        this.id = data.id;
        this.orderRef = data.orderRef;
        this.liveChatCategory = LIVE_CHAT_CATEGORIES[data.category] ?? data.category;
        this.status = LIVE_CHAT_STATUS[data.status];
        this.source = LIVE_CHAT_SOURCE[data.source];
        this.storeId = data.storeId;
        this.basketId = data.basketId;
        this.created = data.created;
        this.customerId = data.customerId;
        this.latestMessageBody = data.latestMessage.body ?? "No messages yet";
        this.latestMessageSender = data.latestMessage.sender ?? null;
        this.latestMessageTime = data.latestMessage.created ?? null;
        this.subject = data.subject;
        this.messages = data.messages.map((m) => new LiveChatConversationMessage(m));
    }

    getSourceInitials() {
        return LIVE_CHAT_SOURCE_ABBR[this.source];
    }
}