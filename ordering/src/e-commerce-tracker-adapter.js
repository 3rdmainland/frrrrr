import logger from 'nandos-dev-logger'

/**
 * This e-commerce tracker adapter provides an opt-in e-commerce tracking solution for various views in
 * this package. If an application chooses to provide an e-commerce tracking service, this adapter can
 * be configured to use the provided service, by setting the `tracker` property on this adapter.
 * If an application doesn't care to to provide a tracking service, a "no-op" tracker will be used instead.
 */
class ECommerceTrackerAdapter {
  
  constructor() {
    this._tracker = new NoOpTracker()
  }

  get tracker() {
    return this._tracker
  }

  set tracker(t) {
    this._tracker = t
  }
  
  track() {
    this._tracker.track(...arguments)
  }
}


class NoOpTracker {

  constructor() {
    this.warnOnce = true
  }

  track() {
    if(this.warnOnce) {
      logger.log('Nandos Ordering', 'No eCommerce tracker installed')
      this.warnOnce = false
    }
  }
}

export default new ECommerceTrackerAdapter()