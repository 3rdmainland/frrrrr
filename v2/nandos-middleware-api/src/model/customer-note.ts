import User from './user';
import { type ICustomerNote, type TCustomerNoteType } from '@nandos-types/model/customer';

export default class CustomerNote implements ICustomerNote {

	public id: string;
	public type: TCustomerNoteType;
	public customerId: string;
	public adminUser: User;
	public note: string;

	constructor(data: ICustomerNote = {
		id: '',
		type: "INFO",
		customerId: '',
		adminUser: {
			id: '',
			email: '',
			mobilePhoneNumber: '',
			name: '',
			lastName: '',
			password: '',
			roles: [],
			permissions: [],
			stores: [],
			lastLogin: 0,
			adminMobilePhoneNumber: '',
			deleted: false
		},
		note: ''
	}) {
		this.id = data.id;
		this.type = data.type;
		this.customerId = data.customerId;
		this.adminUser = data.adminUser && new User(data.adminUser);
		this.note = data.note;
	}
}