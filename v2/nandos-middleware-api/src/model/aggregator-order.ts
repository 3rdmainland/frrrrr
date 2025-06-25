import { type IAggregatorOrder } from "@nandos-types/model/order";

export default class AggregatorOrder {

  public id: string;
  public orderId: string;
  public displayId: string;
  public posReference: string;
  public aggregatorKey: string;
  public orderTime: number;
  public customerName: string;
  public storeId: string;
  public totalPrice: number;
  public success: boolean;
  public errorMessage: string;

  constructor(data: IAggregatorOrder) {
    this.id = data.id;
    this.orderId = data.orderId;
    this.displayId = data.displayId;
    this.posReference = data.posReference;
    this.aggregatorKey = data.aggregatorKey;
    this.orderTime = data.orderTime;
    this.customerName = data.customerName;
    this.storeId = data.storeId;
    this.totalPrice = data.totalPrice;
    this.success = data.success;
    this.errorMessage = data.errorMessage;
  }
}