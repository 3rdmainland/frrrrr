<template>
  <n-page :show-footer="showFooter" :padding="false" pattern-bg class="gift-card-basket">

    <portal to="app-header-portal">
      <n-app-header :title="$t('giftCard.basket.titleShort')"></n-app-header>
    </portal>

    <n-page-hero :image-collection="headerImageCollection">
      <template v-if="ready">
        <h2 v-if="basket.isEmpty">{{ $t('giftCard.basket.empty.title') }}</h2>
        <h2 v-else>{{ $t('giftCard.basket.hasItems.title') }}</h2>
      </template>
    </n-page-hero>

    <n-container v-if="ready">

      <!-- Empty Basket -->
      <template v-if="basket.isEmpty">
        <section class="text-xs-center">
          <p>{{ $t('giftCard.basket.empty.description') }}</p>
          <n-button primary append to="new/design" v-track="{'gift-card-basket': 'empty basket: create new card'}">{{ $t('giftCard.basket.empty.createNew') }}</n-button>
        </section>
      </template>
      <!-- Basket Contains Card/s -->
      <template v-else>

        <n-alert error :value="basket.exceedsMaximumOrderValue">
          <div>
            <p>{{ $t('giftCard.basket.hasItems.errors.exceedsMaximumOrderValue', {amount: $options.filters.money(basket.maximumOrderValue, 'moneyRounded')}) }}</p>
          </div>
        </n-alert>

        <n-alert error :value="basket.exceedsDailyPurchaseLimit">
          <div>
            <i18n tag="p" path="giftCard.basket.hasItems.errors.exceedsDailyPurchaseLimit">
              <n-button slot="link" text-link primary external :to="`mailto:${CUSTOMER_CARE_EMAIL}`">{{CUSTOMER_CARE_EMAIL}}</n-button>
            </i18n>
          </div>
        </n-alert>

        <!-- Gift Card Listing -->
        <n-list class="mb-5">
          <n-list-item v-for="card in basket.items" :key="card.id" class="gift-card-list-item">
            <n-list-tile append :to="`${card.id}/design`">
              <n-list-tile-action class="gift-card-list-item__quantity">
                <n-chip round class="orange white--text pa-2">
                  {{card.quantity}}x
                </n-chip>
              </n-list-tile-action>
              <n-list-tile-action>
                <span>
                  <img class="gift-card-list-item__preview-img" :src="card.renderedImageUrl">                
                </span>
              </n-list-tile-action>
              <n-list-tile-content>
                <n-list-tile-title>{{ $tc('giftCard.basket.hasItems.card.title', card.quantity, {name: card.cards[0].toName, price: $options.filters.money(card.price)}) }}</n-list-tile-title>
                <n-list-tile-sub-title>{{ $tc('giftCard.basket.hasItems.card.subtitle', card.quantity, {phone: card.cards[0].toMobilePhoneNumber}) }}</n-list-tile-sub-title>
              </n-list-tile-content>
              <n-list-tile-action class="money">
                {{card.price * card.quantity | money}}
              </n-list-tile-action>
              <n-list-tile-action>
                <n-button icon flat @click.native.stop.prevent="deleteCard(card)" :loading="card_pending_delete == card" class="grey--text">
                  <n-icon small>close</n-icon>
                </n-button>
              </n-list-tile-action>
            </n-list-tile>
            <n-list-divider/>
          </n-list-item>
        </n-list>
      </template>

    </n-container>

    <n-page-footer slot="footer">
      <n-container>
        <n-button append to="new/design" flat :small="$breakpoints.xs" v-track="{'gift-card-basket': 'footer: create another card'}">
          {{ $t(`giftCard.basket.footer.${$breakpoints.xs ? 'createNewShort' : 'createNew'}`) }}
        </n-button>
        <n-button primary append to="checkout" :disabled="!canPlaceOrder"  v-track="{'gift-card-basket': 'footer: checkout'}">{{ $t('common.checkout') }}</n-button>
      </n-container>
    </n-page-footer>
  </n-page>
</template>

<script src="gift-card-basket.js"></script>