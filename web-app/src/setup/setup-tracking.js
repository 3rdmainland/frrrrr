import 
Tracker, 
{ 
  GoogleAnalyticsTracker, 
  FirebaseAnalyticsTracker, 
  InsiderAnalyticsTracker, 
  AppsflyerAnalyticsTracker
} from 'nandos-tracking'
import CustomerService from 'nandos-middleware-api/service/customer/me-service'
import FacebookAnalyticsTracker from "nandos-tracking/src/trackers/facebook-analytics";

export default function (Vue) {

  Tracker.customerService = CustomerService
  Tracker.installTrackers(new FacebookAnalyticsTracker())
  Tracker.installTrackers(new GoogleAnalyticsTracker())

  if(process.env.VUE_APP_INSIDER_TRACKING_ID) Tracker.installTrackers( new InsiderAnalyticsTracker() )

  // Cordova only trackers
  window.cordova && document.addEventListener('deviceready', () => {
    Tracker.installTrackers(new AppsflyerAnalyticsTracker());
    Tracker.installTrackers(new FirebaseAnalyticsTracker());
  })
}