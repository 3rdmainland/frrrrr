import User from './user'

export default class Customer extends User {

	constructor(data = {}) {
		super(data);
		this.hasPassword = data.hasPassword;
		this.anonymous = data.anonymous;
		this.verified = data.verified;
		this.birthday = data.birthday;
		this.loyaltyNumber = data.loyaltyNumber;
    this.banned = data.blacklisted;
    this.preferredLanguage = data.languageIso;
    this.preferences = new CustomerPreferences(data.preferences || undefined);
    this.marketingOptIn = data.marketingOptIn;
    this.hasAdminSetMarketingOptIn = data.hasAdminSetMarketingOptIn;
	}
}

class CustomerPreferences {
	constructor(data = {}) {
		this.flavour = data.flavour || null
	}
}