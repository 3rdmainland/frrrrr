import { type ICardTransaction, type TOnlinePaymentResultCode } from '@nandos-types/model/card';

export default class CardTransaction {

    public webFlow: any;
    public success: boolean;
    public completed: boolean;
    public expired: boolean;
    public resultCode: TOnlinePaymentResultCode;
    public resultMessage: string;
    public orderId: string;
    public serviceType: string;

	constructor(data: ICardTransaction = {
        webFlow: null,
        success: false,
        completed: false,
        expired: false,
        resultCode: '',
        resultMessage: '',
        orderId: '',
        serviceType: ''
    }) {

        this.webFlow = data.webFlow
        this.success = !!data.success
        this.completed = !!data.completed
        this.expired = !!data.expired
        this.resultCode = data.resultCode
        this.resultMessage = data.resultMessage
        this.orderId = data.orderId
        this.serviceType = data.serviceType
	}
}