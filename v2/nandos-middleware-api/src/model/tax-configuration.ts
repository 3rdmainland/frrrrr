import '../util/admin-context-guard';
import { type ITaxConfiguration } from '@nandos-types/model/tax-configuration';

export default class TaxConfiguration {

  public id: string;
  public name: string;
  public effectiveFrom: number;
  public rate: number;

	constructor(data: ITaxConfiguration = {
    id: '',
    name: '',
    effectiveFrom: 0,
    rate: 0
  }) {
		this.id = data.id;
    this.name = data.name;
    this.effectiveFrom = data.effectiveFrom;
    this.rate = data.rate;
	}
}