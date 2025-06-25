<template>
  <n-page v-bind="$attrs">

    <portal to="app-header-portal">
      <n-app-header :title="$t('profile.history.titleShort')" back-title="Profile"></n-app-header>
    </portal>

    <n-container v-if="ready">
      <h3 v-if="orders.length == 0" class="headline">{{ $t('profile.history.empty') }}</h3>

      <n-list>
        <n-list-item v-for="order in orders" :key="order.id">
          <n-list-tile :to="(order.isGiftCardOrder ? '/me/history/gift-card/' : '/me/history/food/' ) + order.id + orderLinkSuffix">
            <n-list-tile-content>
              <n-list-tile-title>{{order.orderPlacedTime | date('full')}}</n-list-tile-title>
              <n-list-tile-sub-title v-if="order.isGiftCardOrder">{{ $tc('order.giftCard.title', order.totalItems) }}</n-list-tile-sub-title>
              <n-list-tile-sub-title v-else>{{ $t(`order.food.summary.short.${$options.filters.orderTypeKey(order)}`, {location: order.deliveryAddress, store: order.storeName}) }}</n-list-tile-sub-title>
            </n-list-tile-content>
            <n-list-tile-action class="money">{{order.totalPrice | money}}</n-list-tile-action>
          </n-list-tile>
          <n-list-divider/>
        </n-list-item>
      </n-list>
    </n-container>
  </n-page>
</template>

<script src="order-history-listing.js"></script>