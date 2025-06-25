<template>
  <n-page class="lumo-pink white--text pattern-bg pattern-bg--flowery">
    <portal to="app-header-portal">
      <n-app-header force-hamburger :title="$t('giftCard.success.titleShort')" :back-title="$t('giftCard.basket.titleShort')"></n-app-header>
    </portal>

    <n-container v-if="order" narrow class="text-xs-center">

      <section class="mb-5">
        <h1>{{ $t('giftCard.success.title') }}</h1>
        <p class="display-2">{{ $tc('giftCard.success.description', order.totalItems) }}</p>
      </section>

      <section class="mb-5">
        <p>
          <n-button :to="'/me/history/gift-card/' + orderId" small class="secondary--text">{{ $t('giftCard.success.viewOrder') }}</n-button>
        </p>
        <n-button secondary text-link :to="{name: 'menu'}" small>{{ $t('giftCard.success.foodUpsell') }}</n-button>
      </section>

      <section v-if="CALL_CENTER_PHONE" class="display-1">
        <span>{{ $t('giftCard.success.help') }}</span>
        <p class="grey--text"> 
          <a :href="`tel:${CALL_CENTER_PHONE}`">{{CALL_CENTER_PHONE}}</a>
        </p>
      </section>
    </n-container>
  </n-page>
</template>

<script src="./gift-card-basket-checkout-success.js"></script>