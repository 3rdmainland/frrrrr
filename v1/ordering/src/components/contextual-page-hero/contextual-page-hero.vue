<template>
	<n-page-hero v-bind="$attrs" :placeholderBg="false" class="contextual-page-hero">
	  <div :class="contextualOrderTypeClasses" class="new-layer" slot="background"></div>
	  <slot name="background" slot="background"></slot><!-- forward background slot content to <n-page-hero>'s background slot -->
	  <template v-if="orderImagery">
	  	<img v-if="orderType == ORDER_TYPES.DELIVERY "slot="background" class="contextual-page-hero__image--delivery" src="../../assets/img/order-setup-delivery-scooter.svg">
	  	<img v-else-if="orderType == ORDER_TYPES.COLLECTION "slot="background" class="contextual-page-hero__image--collection" src="../../assets/img/order-setup-collection-heart.svg">
	  	<img v-else-if="orderType == ORDER_TYPES.EAT_IN "slot="background" class="contextual-page-hero__image--eat-in" src="../../assets/img/order-setup-eat-in-table-without-new.svg">
	  </template>
	  <slot></slot>
	</n-page-hero>
</template>

<script src="contextual-page-hero.js"></script>
<style lang="scss">
	.contextual-page-hero {

		// Madness
		&__image--delivery {
		  position: absolute;
		  top: calc(6em - 3.5rem);
		  right: -11.5rem;
		  height: 10.5rem;
		  transform: rotate(25deg);
		}

		&__image--collection {
		  position: absolute;
		  top: calc(4em - 1rem);
		  right: 0.5rem;
		  height: 10em;
		}

		&__image--eat-in {
		  position: absolute;
		  top: calc(2em - 2rem);
		  right: calc(-2em - 2rem);
		  height: calc(13em + 6rem);
		}

	}
</style>