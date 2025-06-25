import GlobalConfigService from 'nandos-middleware-api/service/global-config-service'
import NotificationService from 'nandos-middleware-api/service/notification-service'
import CustomerService from 'nandos-middleware-api/service/customer/me-service'

export default {

  data() {
    return {
    	WEBSITE_URL: process.env.VUE_APP_WEBSITE_URL,
    	VERSION: process.env.VUE_APP_VERSION,
      appVersionTapCount: 0,
      debugData: {
      	api: { title: 'API', value: process.env.VUE_APP_API },
      	context: { title: 'Application context', value: process.env.VUE_APP_CONTEXT },
      	gtm: { title: 'Google Tag Manager', value: process.env.VUE_APP_GOOGLE_TAG_MANAGER_ID },
      	env: { title: 'Environment', value: process.env.NODE_ENV },

      	userName: { title: 'User name', value: null },
      	userId: { title: 'User ID', value: null },
      	firebasePushToken: { title: 'Firebase Push Token', value: null },
      	googleMaps: { title: 'Google Maps API Key', value: null },
      }
    }
  },

  computed:{
  	showDebugData() {
  		return this.appVersionTapCount >= 5 || process.env.NODE_ENV == 'development'
  	},

  	displayData() {
  		return Object.values(this.debugData).sort((a, b) => a.title.localeCompare(b.title))
  	}
  },

  watch:{
  	showDebugData: {
  		handler() {
	  		if(this.showDebugData) {
	  			
	  			this.debugData.firebasePushToken.value = NotificationService.token
	  			
	  			CustomerService.getMe()
	  				.then(user => {
	  					this.debugData.userId.value = user.id
	  					this.debugData.userName.value = `${user.anonymous ? 'Anonymous' : user.name}`
	  				})

	  			GlobalConfigService.getConfigs()
	  				.then(configs => this.debugData.googleMaps.value = configs.googleMapsApiKey)
	  		}
	  	},
	  	immediate: true,
  	}
  },
}