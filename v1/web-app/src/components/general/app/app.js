import InFlightTransactionPoller from '@/in-flight-transaction-poller'
import {App as CapacitorApp} from '@capacitor/app'
import {SplashScreen} from '@capacitor/splash-screen'
import {ViewStateService} from 'nandos-core-ui'
import CustomerService from 'nandos-middleware-api/service/customer/me-service'
import GlobalConfigService from 'nandos-middleware-api/service/global-config-service'
import MyOrderReviewService from 'nandos-middleware-api/service/my-order-review-service'
import NotificationService, {NOTIFICATION_ACTIONED} from 'nandos-middleware-api/service/notification-service'
import SystemNotificationService from 'nandos-middleware-api/service/system-notification-service'
import Tracker from "nandos-ordering/src/e-commerce-tracker-adapter"

export default {

	data() {
		return {
			view_state: ViewStateService,
			systemMessagesData: null,
			reviewOrderData: null,
			showOrderRatingForm: false,
			inFlightTransactionPoller: InFlightTransactionPoller,
			bannerNotification: null
		}
	},

	computed: {

		pageTransition() {
			switch (this.view_state.lastNavigationDirection) {
				case 'up':
					return 'page-slide-left-to-right'
				case 'down':
					return 'page-slide-right-to-left'
				case 'jump-up':
					return 'page-slide-up'
				case 'jump-down':
					return 'page-slide-down'
			}
		},

		/**
		 * Get the computed route key for the current route
		 */
		routeKey() {
			let record = this.$route.matched[0] // [0] because we only care about the parent route

			return record && record.meta.computeRouteKey
				? record.meta.computeRouteKey(this.$route)
				: this.$route.path
		}
	},

	watch: {
		'inFlightTransactionPoller.transaction'(transaction) {
			if (transaction.completed) {

				this.inFlightTransactionPoller.acknowledgeTransaction()

				if (transaction.success) {
					let link = `/me/history/${transaction.serviceType == 'FOOD' ? 'food' : 'gift-card'}/${transaction.orderId}`
					this.$toaster.show(null,
						{
							template: `${this.$t('transactionPoller.success.title')} <n-button @click.native="$parent.isActive = false" jump to="${link}" text-link v-track="{'in-flight-transaction-poller': 'success clicked'}">${this.$t('transactionPoller.success.linkText')}</n-button>`,
							success: true,
							timeout: 0,
							dismissable: true,
							parent: this
						})
				}
				// Too long, silently give up
				else if (transaction.expired) {
					// do nothing
				}
				// Failed
				else {
					let link = `/basket`
					this.$toaster.show(null,
						{
							template: `${this.$t('transactionPoller.error.title')} <n-button @click.native="$parent.isActive = false" jump to="${link}" text-link secondary v-track="{'in-flight-transaction-poller': 'error clicked'}">${this.$t('transactionPoller.error.linkText')}</n-button>`,
							error: true,
							timeout: 0,
							dismissable: true,
							parent: this
						})
				}
			}
		}
	},

	created() {
		if (this.$isCordovaApp) {
			// The cordova app's should default to the app-promo page as their landing
			this.$router.push('/app-promos')
			// Deep links
			CapacitorApp.addListener('appUrlOpen', (event) => {
				const url = new URL(event.url)

				const params = new URLSearchParams(url.search)

				let internalPath = url.pathname.replace(this.$router.options.base, '')
				this.$router.push(internalPath + url.search)
				if (params.has('utm_campaign') || params.has('utm_medium') || params.has('utm_source')) {
					Tracker.track('setAttributionData', {
						campaign: params.get('utm_campaign'),
						medium: params.get('utm_medium'),
						source: params.get('utm_source')
					})
				}
			})

			// Hide the app splash screen after 1 second
			setTimeout(SplashScreen.hide, 1000)
		}

		this.intaliseNotificationService()

		this.processPromptQueue()
			.then(this.retrieveBannerNotifications)
	},

	methods: {

		intaliseNotificationService() {
			if (this.$isBrowserApp) {
				/*if ('serviceWorker' in navigator) {
				  window.addEventListener('load', () => {
					navigator.serviceWorker.register('/static/firebase-messaging-sw.js')
					.then(registration => {
					  NotificationService.init(registration, process.env.VUE_APP_FIREBASE_SENDER_ID, process.env.VUE_APP_FIREBASE_PUBLIC_VAPID_KEY)
					})
				  })
				}*/
			} else if (this.$isCordovaApp) {
				NotificationService.init()
			}

			NotificationService.addObserver(this, NOTIFICATION_ACTIONED, this.onPushNotificationAction)
		},

		onPushNotificationAction({actionId, notification}) {
			if (notification.data && notification.data.path) {

				try {
					if (this.$isCordovaApp) SplashScreen.hide()

					const params = new URLSearchParams(notification.data.path.split('?')[1])

					if (params.has('utm_campaign') || params.has('utm_medium') || params.has('utm_source')) {
						Tracker.track('setAttributionData', {
							campaign: params.get('utm_campaign'),
							medium: params.get('utm_medium'),
							source: params.get('utm_source')
						})
					}

				}
				catch (error) {
					console.error("Error occurred while processing notification data:", error)
				}

				this.$router.push(notification.data.path)
			}
		},

		/**
		 * Check for prompts to display, including:
		 *  - System messages
		 *  - In-flight transactions
		 *  - "looking for your last order" prompt
		 *  - "Review your previous order experience" prompt
		 */
		processPromptQueue() {

			const DID_PROMPT = 'DID_PROMPT'
			// Breaks the promise chain, so as soon as 1 prompt is shown, we don't attempt to show anymore
			const handleResult = didPrompt => didPrompt ? Promise.reject(DID_PROMPT) : null

			return Promise.resolve()
				.then(() => this.attemptSystemMessagesPrompt(handleResult))
				.then(() => this.attemptInFlightTransactionPrompt(handleResult))
				.then(() => this.attemptRecentOrderPrompt(handleResult))
				.then(() => this.attemptOrderReviewPrompt(handleResult))
				.catch(error => error === DID_PROMPT ? null : Promise.reject(error))
		},

		retrieveBannerNotifications() {
			return SystemNotificationService.getSystemBannerNotifications().then((notifications) => this.bannerNotification = ( notifications && notifications.length > 0 ? notifications[0] : null ))
		},

		attemptSystemMessagesPrompt(didPrompt) {
			return SystemNotificationService.getSystemNotificationCategory()
				.then(category => this.systemMessagesData = category)
				.then(category => didPrompt(!category.isEmpty))
		},

		attemptInFlightTransactionPrompt(didPrompt) {
			return GlobalConfigService.getConfigs()
				.then(configs => {
					if (configs.onlinePaymentRequirements.asyncPaymentResult) {
						return this.inFlightTransactionPoller.fetchNow()
							.then(transaction => didPrompt(transaction != null))
					} else {
						return didPrompt(false)
					}
				})
		},

		attemptOrderReviewPrompt(didPrompt) {
			return MyOrderReviewService.getPendingReview()
				.then(order => this.reviewOrderData = order)
				.then(order => this.showOrderRatingForm = order != null)
				.then(_ => didPrompt(this.showOrderRatingForm))
		},

		/**
		 * Checks to see if the customer has a recent enough order, that we might want to give them
		 * quick access to via a toast.
		 */
		attemptRecentOrderPrompt(didPrompt) {
			return CustomerService.getMe()
				.then(customer => {
					if (customer.anonymous) {
						return didPrompt(false)
					} else {
						let activeOrderTimeFrame = 30 * 60 * 1000 // 30 minutes
						return CustomerService.getFoodOrders()
							.then(orders => {
								let activeOrder = orders.find(order => Date.now() - order.orderExpectedTime <= activeOrderTimeFrame)

								if (activeOrder != null) {
									let link = `/me/history/food/${activeOrder.id}`
									if (this.$route.path !== link) {
										this.$toaster.show(this.$t('recentOrderPopUp'), {
											link,
											timeout: 7000,
											tracking: {'recent order pop-up': 'clicked'},
											parent: this
										})
									}
								}

								return didPrompt(activeOrder != null)
							})
					}

				})
		}
	}
}