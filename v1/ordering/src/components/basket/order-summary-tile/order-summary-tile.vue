<template>
  <n-tile column class="order-summary-tile mb-4">
    
    <n-ordering-contextual-page-hero v-if="basket.isOrderSetup" :order-type="basket.orderType" :skew="false" hero-class="py-5 mb-0">
      <p>{{ $t(`order-setup-summary.${orderTypeKey}.header`) }}</p>
      <h3>{{basket.expectedReadyTime | date('time')}}</h3>
    </n-ordering-contextual-page-hero>

    <n-tile-content class="text-xs-left">
      <n-list v-if="basket.isOrderSetup">
        <!-- Delivery details -->
        <template v-if="basket.forDelivery">
          <n-list-subheader>{{ $t('order-setup-summary.delivery.location.title') }}</n-list-subheader>
          <n-list-item>
            <n-list-tile jump :to="editable ? {name: 'order-setup-start'} : null" :interactive="editable" v-track="{'basket-summary-tile': 'change order setup'}">
              <n-list-tile-content>
                <n-list-tile-title>{{ basket.deliveryAddress }}</n-list-tile-title>
              </n-list-tile-content>
              <n-list-tile-action v-if="editable">
                <n-button text-link primary class="uppercase display-1">{{ $t('order-setup-summary.delivery.location.change') }}</n-button>
              </n-list-tile-action>
            </n-list-tile>
          </n-list-item>

          <n-list-subheader>{{ $t('order-setup-summary.delivery.store.title') }}</n-list-subheader>
          <n-list-item>
            <n-list-tile jump :to="editable ? {name: 'order-setup-start'} : null" :interactive="editable" v-track="{'basket-summary-tile': 'change order setup'}">
              <n-list-tile-content>
                <n-list-tile-title>{{ basket.storeName }}</n-list-tile-title>
              </n-list-tile-content>
              <n-list-tile-action v-if="editable">
                <n-button text-link primary class="uppercase display-1">{{ $t('order-setup-summary.delivery.store.change') }}</n-button>
              </n-list-tile-action>
            </n-list-tile>
          </n-list-item>
        </template>

        <!-- Collection details -->
        <template v-else-if="basket.forCollection">
          <n-list-subheader>
            {{ $t('order-setup-summary.collection.store.title', {orderType: basket.kerbsideCollect ? $t('orderType.kerbside') : $t('orderType.collection')}) }}
          </n-list-subheader>
          <n-list-item>
            <n-list-tile jump :to="editable ? {name: 'order-setup-start'} : null" :interactive="editable">
              <n-list-tile-content>
                <n-list-tile-title>{{ basket.storeName }}</n-list-tile-title>
              </n-list-tile-content>
              <n-list-tile-action v-if="editable">
                <n-button text-link primary class="uppercase display-1">{{ $t('order-setup-summary.collection.store.change') }}</n-button>
              </n-list-tile-action>
            </n-list-tile>
            <n-list-divider v-if="!basket.kerbsideCollect" class="my-3"/>
          </n-list-item>

          <!-- Kerbside Collection vehicle details -->
          <template v-if="basket.kerbsideCollect">
            <n-list-subheader>{{ $t('order-setup-summary.collection.kerbside.vehicle.title') }}</n-list-subheader>
            <n-list-item>
              <n-list-tile jump :to="editable ? {name: 'order-setup-start'} : null" :interactive="editable">
                <n-list-tile-content>
                  <n-list-tile-title>
                    <span v-html="$t('order-setup-summary.collection.kerbside.vehicle.content', {color: $t(`common.colors.${basket.customerVehicle.color}`), make: basket.customerVehicle.make, registration: basket.customerVehicle.registration})"></span>
                  </n-list-tile-title>
                </n-list-tile-content>
                <n-list-tile-action v-if="editable">
                  <n-button text-link primary class="uppercase display-1">{{ $t('order-setup-summary.collection.kerbside.vehicle.change') }}</n-button>
                </n-list-tile-action>
              </n-list-tile>
            </n-list-item>
          </template>
        </template>

        <!-- Eat in details -->
        <template v-else-if="basket.forEatIn">
          <n-list-subheader>{{ $t('order-setup-summary.eatIn.store.title', {orderType: $t('orderType.eatIn')}) }}</n-list-subheader>
          <n-list-item>
            <n-list-tile jump :to="editable ? {name: 'order-setup-start'} : null" :interactive="editable">
              <n-list-tile-content>
                <n-list-tile-title>{{ basket.storeName }}</n-list-tile-title>
              </n-list-tile-content>
              <n-list-tile-action v-if="editable">
                <n-button text-link primary class="uppercase display-1">{{ $t('order-setup-summary.eatIn.store.change') }}</n-button>
              </n-list-tile-action>
            </n-list-tile>
          </n-list-item>

          <n-list-subheader>{{ $t('order-setup-summary.eatIn.table.title') }}</n-list-subheader>
          <n-list-item>
            <n-list-tile jump :to="editable ? {name: 'order-setup-start'} : null" :interactive="editable" v-track="{'basket-summary-tile': 'change order setup'}">
              <n-list-tile-content>
                <n-list-tile-title>{{ basket.tableId }}</n-list-tile-title>
              </n-list-tile-content>
              <n-list-tile-action v-if="editable">
                <n-button text-link primary class="uppercase display-1">{{ $t('order-setup-summary.eatIn.table.change') }}</n-button>
              </n-list-tile-action>
            </n-list-tile>
          </n-list-item>
        </template>

        <slot name="additional-info"></slot>

      </n-list>

      <slot></slot>
    </n-tile-content>

    <footer class="px-5 pb-3">
      <slot name="footer"></slot>
    </footer>
  </n-tile>
</template>

<script src="order-summary-tile.js"></script>