import "../../util/web-context-guard";
import ApiHttp from "../../http";
import AuthService, { AUTH_CHANGED } from "../auth-service";
import CustomerCreditCard from "../../model/customer-credit-card";
import CustomerService, {
  CUSTOMER_UPDATED,
  CUSTOMER_CHANGED,
} from "./customer-service";
import Customer from "../../model/customer";

const ME = "me";

class MeService extends CustomerService {
  private _meCache: Promise<Customer> | null;

  constructor() {
    super();

    this._meCache = null;

    // Drop cache whenever logged in customer's auth changes (might be a new customer)
    AuthService.addObserver(this, AUTH_CHANGED, () => {
      this._meCache = null;
      AuthService.notifyObservers(CUSTOMER_UPDATED);
    });
  }

  /**
   * @override
   */
  get customerId(): string {
    return ME;
  }

  getMe(): Promise<Customer> {
    if (this._meCache) return this._meCache;

    return (this._meCache = super
      .getCustomer()
      .then((customer) => {
        return customer;
      })
      .catch((e) => {
        this._meCache = null;
        return Promise.reject(e);
      }));
  }

  getCustomerInfo(): Promise<Customer> {
    return this.getMe();
  }

  isAnonymous(): Promise<boolean> {
    return this.getMe().then((customer) => customer.anonymous);
  }

  isVerified(): Promise<boolean> {
    return this.getMe().then((customer) => customer.verified);
  }

  updateCustomer(customer: Partial<Customer>): Promise<Customer> {
    return (this._meCache = super.updateCustomer(customer));
  }

  updateLanguagePreference(language: string): Promise<Customer> {
    return (this._meCache = super.updateLanguagePreference(language));
  }

  getCreditCards(): Promise<CustomerCreditCard[]> {
    return ApiHttp.get(`/customers/${this.customerId}/cards`).then((response) =>
      response.data.cards.map((d: any) => new CustomerCreditCard(d))
    );
  }

  addCreditCard(
    creditCard: Partial<CustomerCreditCard>
  ): Promise<CustomerCreditCard> {
    return ApiHttp.post(`/customers/${this.customerId}/cards`, { creditCard })
      .then(
        (response) =>
          new CustomerCreditCard(response.data.transaction.storableCreditCard)
      )
      .then(this._notifyUpdated);
  }

  deleteCreditCard(id: string): Promise<boolean> {
    return ApiHttp.delete(`/customers/${this.customerId}/cards/${id}`)
      .then(() => true)
      .then(this._notifyUpdated);
  }

  getInFlightTransactions(): Promise<any> {
    return ApiHttp.get(`/modules/payment/inflight`).then(
      (response) => response.data.transaction
    );
  }

  acknowledgeTransaction(transaction: {
    serviceType: string;
    orderId: string;
  }): Promise<boolean> {
    return ApiHttp.post(
      `/modules/payment/inflight/acknowledge/${transaction.serviceType.toLowerCase()}/${transaction.orderId}`
    ).then((response) => response.status == "success");
  }
}

export default new MeService();

// Re-export for convenience
export { CUSTOMER_UPDATED, CUSTOMER_CHANGED };
