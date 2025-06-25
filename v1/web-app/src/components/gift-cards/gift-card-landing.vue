<template>
  <n-page pattern-bg :padding="false">

    <portal to="app-header-portal">
      <n-app-header :title="$t('giftCard.titleShort')"></n-app-header>
    </portal>

    <n-page-hero :image-collection="headerImageCollection">
      <h1 class="squiggles tilted white--text">{{ $t('giftCard.title') }}</h1>
      <div> <!-- Make sure inline heading and marked text don't appear in same line -->
        <n-marked-text>{{ $t('giftCard.subtitle') }}</n-marked-text>
      </div>
    </n-page-hero>

    <n-container class="text-xs-center">

      <section class="mb-5">
        <n-button jump to="/me/wallet" v-track="{'gift-card-landing': 'go to your cards'}">{{ $t('giftCard.yourCards') }}</n-button>
        <n-button :to="purchaseCardDestinationUrl" primary v-track="{'gift-card-landing': 'buy gift cards'}">{{ $t('giftCard.createCards') }}</n-button>
      </section>

      <!-- Disclaimers -->
      <section>
        <small>{{ $t('giftCard.basket.b2bDisclaimer','') }}</small>
        <i18n class="mt-4" tag="p" path="giftCard.basket.disclaimer">
          <n-button place="tandCs" append to="terms-and-conditions" text-link primary v-track="{'gift-card-landing': 'terms and conditions'}">{{ $t('giftCard.basket.tandCs') }}</n-button>
        </i18n>

        <p>{{ $t('giftCard.basket.redemtionDisclaimer') }}</p>
      </section>
    </n-container>
  </n-page>
</template>

<script src="gift-card-landing.js"></script>