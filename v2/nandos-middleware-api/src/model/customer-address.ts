import { ICustomerAddress } from "@nandos-types/model/customer-address";

export default class CustomerAddress implements ICustomerAddress {
  id?: string;
  name?: string;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  street?: string;
  streetNumber?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  building?: string;
  instructions?: string;

  constructor(data: Partial<ICustomerAddress> = {}) {
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
