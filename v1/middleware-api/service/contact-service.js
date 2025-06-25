import ApiHttp from '../http';

class ContactService {

	talkToUs(name, lastName, mobilePhoneNumber, email, message) {
		return ApiHttp.post(`/talk-to-us`, {name, lastName, mobilePhoneNumber, email, message})
			.then(response => response.data)
	}
}

export default new ContactService();