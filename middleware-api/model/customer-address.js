export default class CustomerAddress {

  constructor(data = {}) {
    this.id = data.id;
    this.name = data.name;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.formattedAddress = data.formattedAddress;
    this.street = data.street;
    this.streetNumber = data.streetNumber;
    this.city = data.city;
    this.postalCode = data.postalCode;
    this.country = data.country;

    this.building = data.building;
    this.instructions = data.instructions;
  }
}