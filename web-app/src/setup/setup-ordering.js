import NandosOrdering from 'nandos-ordering'
import NandosOrderingTrackingAdapter from 'nandos-ordering/src/e-commerce-tracker-adapter'
import Tracker from 'nandos-tracking'

export default function (Vue) {
  Vue.use(NandosOrdering)
  NandosOrderingTrackingAdapter.tracker = Tracker
}