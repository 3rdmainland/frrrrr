import '../util/admin-context-guard';
import type { IStorePingStatus } from '@nandos-types/model/store';

export default class StorePingStatus {
	public online: boolean;
	public updated: boolean;
	public hostAddress: string;
	public oheicsServerName: string;

	constructor(data: IStorePingStatus) {
		this.online = data.online
		this.updated = data.updated
		this.hostAddress = data.hostAddress
		this.oheicsServerName = data.oheicsServerName
	}
}