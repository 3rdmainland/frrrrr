import User from './user'
import { 
	type ICustomer, 
	type ICustomerPreferences
} from "@nandos-types/model/customer";

export default class Customer extends User implements ICustomer {
	
	hasPassword: boolean;
	anonymous: boolean;
	verified: boolean;
	birthday?: string;
	loyaltyNumber?: string;
	banned: boolean;
	preferredLanguage?: string;
	preferences: ICustomerPreferences;
	marketingOptIn: boolean;
	hasAdminSetMarketingOptIn: boolean;

	constructor(data: Partial<ICustomer> = {}) {
		super(data);
		this.hasPassword = !!data.hasPassword;
		this.anonymous = !!data.anonymous;
		this.verified = !!data.verified;
		this.birthday = data.birthday;
		this.loyaltyNumber = data.loyaltyNumber;
		this.banned = !!data.banned;
		this.preferredLanguage = data.preferredLanguage;
		this.preferences = new CustomerPreferences(data.preferences || {});
		this.marketingOptIn = !!data.marketingOptIn;
		this.hasAdminSetMarketingOptIn = !!data.hasAdminSetMarketingOptIn;
	}
}

class CustomerPreferences implements ICustomerPreferences {
  flavour: string | null;

	constructor(data: Partial<ICustomerPreferences> = {}) {
		this.flavour = data.flavour || null;
	}
}
