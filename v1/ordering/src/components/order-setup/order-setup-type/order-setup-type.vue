<template>
	<n-page pattern-bg :padding="false" class="order-setup-type">

		<section class="flexbox fill-height">
			<n-container class="my-auto py-3">
				
				<h1 :class="{'display-4': $breakpoints.xs}">{{ kerbsideOnlyCollection ? $t('orderSetup.type.titleForcedKerbside') : $t('orderSetup.type.title') }}</h1>

				<section class="tile-grid">

					<!-- Delivery -->
					<n-tile column @click="onOrderTypeTileClicked(ORDER_TYPES.DELIVERY)" v-track="{'order-setup:type': 'delivery'}">
						<n-tile-content class="order-type-header align-end" :class="getContextualOrderClasses(ORDER_TYPES.DELIVERY)">
							<img src="../../../assets/img/order-setup-delivery-scooter.svg" class="order-type-image">
							<div class="nandos-texture new-layer"></div>
						</n-tile-content>
						<n-tile-content>
							<h2 class="display-5 mb-2">{{ $t('orderSetup.type.delivery.title') }}</h2>
							<p class="display-1 grey--text text--darken-2">{{ $t('orderSetup.type.delivery.description') }}</p>
							<small v-if="WARN_ABOUT_DELIVERY_PRICING" class="grey--text text--darken-1">
								{{ $t('orderSetup.type.delivery.deliveryPriceNote') }}<br>
							</small>
							<small v-if="minimumDeliveryAmount" class="grey--text text--darken-1">
								{{ $t('orderSetup.type.delivery.minimumDeliveryAmount', {amount: $options.filters.money(minimumDeliveryAmount, 'moneyRounded')}) }}
							</small>
						</n-tile-content>
					</n-tile>

					<!-- Collection -->
					<n-tile column @click="onOrderTypeTileClicked(ORDER_TYPES.COLLECTION)" v-track="{'order-setup:type': 'collection'}">
						<n-tile-content class="order-type-header" :class="getContextualOrderClasses(ORDER_TYPES.COLLECTION)">
							<div class="nandos-texture new-layer"></div>
							<n-button v-if="kerbsideCollectionEnabled && !kerbsideOnlyCollection" secondary floating absolute class="kerbside-badge">
							  <span>{{ $t('orderSetup.type.collection.kerbsideBadge') }}</span>
							</n-button>
							<img src="../../../assets/img/order-setup-collection-bag.svg" class="order-type-image">
						</n-tile-content>
						<n-tile-content>
							<h2 class="display-5 mb-2">{{ kerbsideOnlyCollection ? $t('orderSetup.type.forcedKerbside.title') : $t('orderSetup.type.collection.title') }}</h2>
							<p class="display-1 grey--text text--darken-1">{{ kerbsideOnlyCollection ? $t('orderSetup.type.forcedKerbside.description') : $t('orderSetup.type.collection.description') }}</p>
						</n-tile-content>
					</n-tile>

					<!-- Eat in -->
					<n-tile v-if="eatInEnabled" column @click="onOrderTypeTileClicked(ORDER_TYPES.EAT_IN)" v-track="{'order-setup:type': 'eat-in'}">
						<n-tile-content class="order-type-header align-start" :class="getContextualOrderClasses(ORDER_TYPES.EAT_IN)">
							<img src="../../../assets/img/order-setup-eat-in-table.svg" class="order-type-image">
							<div class="nandos-texture new-layer"></div>
						</n-tile-content>
						<n-tile-content>
							<h2 class="display-5 mb-2">{{ $t('orderSetup.type.eatIn.title') }}</h2>
							<p class="display-1 grey--text text--darken-2">{{ $t('orderSetup.type.eatIn.description') }}</p>
							<small class="grey--text text--darken-1">{{ $t('orderSetup.type.eatIn.subtitle') }}</small>
						</n-tile-content>
					</n-tile>
				</section>
			</n-container>
		</section>

	</n-page>
</template>

<script src="order-setup-type.js"></script>