import { type IVoucher } from '@nandos-types/model/voucher';

export default class Voucher {

  public code: string;
  public reference: string;
  public amount: number;
  public title: string;
  public description: string;
  public disclaimer: string;

  constructor(data: IVoucher = {
    token: '',
    reference: '',
    amountProcessed: 0,
    title: '',
    description: '',
    disclaimer: ''
  }) {
    this.code = data.token;
    this.reference = data.reference;
    this.amount = data.amountProcessed;
    this.title = data.title;
    this.description = data.description;
    this.disclaimer = data.disclaimer;
  }
}