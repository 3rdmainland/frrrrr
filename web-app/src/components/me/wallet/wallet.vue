<template>
  <n-page pattern-bg :padding="false" class="wallet">

    <portal to="app-header-portal">
      <n-app-header :title="$t('profile.wallet.titleShort')" back-title="Profile"></n-app-header>
    </portal>
    
    <n-page-hero :pull-content-above="$breakpoints.smDown">
      <img slot="background" class="new-layer img--center img--fill" src="@/assets/img/wallet-header.svg" >
      <template v-if="ready">
        <p>
          <strong class="uppercase">{{ $t('profile.wallet.wallet.title') }}</strong>
        </p>
        <h2>{{wallet.balance | money}}</h2>
      </template>
    </n-page-hero>


    <n-container v-if="ready" :wide="$breakpoints.mdUp">
      <n-layout row wrap class="mb-5">
        <!-- Left column -->
        <n-flex xs12 md4 order-md1>
          <!-- Wallet info -->
          <n-tile class="mb-5 wallet-qr-code-tile">
            <n-tile-content>
              <div class="mb-3">
                <img class="gift-card-qr-code" :src="`${wallet.qrCodeUrl}`">
              </div>
              <p>
                <strong class="display-1">{{ $t('profile.wallet.wallet.code', {code: wallet.token}) }}</strong>
              </p>
              <p class="mb-0">{{ $t('profile.wallet.wallet.description') }}</p>
            </n-tile-content>
          </n-tile>
        </n-flex>
        <!-- Right column -->
        <n-flex xs12 md8>
          <!-- Gift card listing heading & Filters -->
          <div class="flexbox justify-space-between py-3">              
            <h6>{{ $t("profile.wallet.cardListing.title") }}</h6>
            <n-toggle v-model="filters.status" :off-value="ACTIVE" :on-value="REDEEMED" :off-label="$t('profile.wallet.cardListing.filter.active')" :on-label="$t('profile.wallet.cardListing.filter.redeemed')" />
          </div>

          <div v-if="cards.length == 0" class="text-xs-center">
            <h3 class="headline">{{ $t('profile.wallet.empty', {listingType: $t(`profile.wallet.cardListing.filter.${filters.status.toLowerCase()}`)}) }}</h3>
          </div>
          <section ref="giftCardListing" v-else>

            <!-- Gift card listing -->
            <n-list>
              <n-list-item v-for="card in cards" :key="card.id" class="gift-card-list-item white">
                <n-list-tile @click.native.stop="onCardClicked(card)" :interactive="card.status == ACTIVE">
                  <n-list-tile-action>
                    <img class="gift-card-list-item__preview-img grey lighten-3" :src="card.renderedImageUrl">
                  </n-list-tile-action>
                  <n-list-tile-content>
                      
                    <i18n tag="n-list-tile-title" path="profile.wallet.cardListing.card.title" class="mb-2">
                      <strong slot="amount" class="display-2">{{card.wiBalance | money}}</strong>
                    </i18n>
                    <template v-if="card.expiryDate > Date.now()"><!-- Card is still valid -->
                      <i18n tag="n-list-tile-sub-title" path="profile.wallet.cardListing.card.value">
                        <span slot="amount" class="black--text">{{card.issuedAmount | money}}</span>
                      </i18n>
                      <i18n tag="n-list-tile-sub-title" path="profile.wallet.cardListing.card.expiration">
                        <span slot="date" class="black--text">{{card.expiryDate | date}}</span>
                      </i18n>
                      <i18n v-if="card.wiBalance" tag="n-list-tile-sub-title" path="profile.wallet.cardListing.card.code">
                        <span slot="code" class="black--text">{{card.wiCode}}</span>
                      </i18n>
                    </template>
                    <template v-else>
                      <n-list-tile-sub-title class="error--text">{{ $t('profile.wallet.cardListing.card.expired') }}</n-list-tile-sub-title>
                    </template>
                  </n-list-tile-content>
                </n-list-tile>
              </n-list-item>
            </n-list>

            <n-pagination v-model="currentPage" :total="totalPages" :pages-to-show="7" />
          </section>
        </n-flex>
      </n-layout>
    </n-container>

    <n-dialog slot="floating-content" v-model="showQRModal" fullscreen overlap-app-header>
      <n-page v-if="selectedCard" pattern-bg>
        <n-container narrow class="text-xs-center mt-6">
          <h2 class="squiggles tilted mb-4">{{ $t('profile.wallet.cardListing.card.qrCode.title') }}</h2>
          <img class="gift-card-qr-code" :src="`${API}/giftcard/qrcode/${user.mobilePhoneNumber}/${selectedCard.wiId}`">
          <p class="display-1">{{ $t('profile.wallet.cardListing.card.qrCode.code', {code: selectedCard.wiCode}) }}</p>
          <p>{{ $t('profile.wallet.cardListing.card.qrCode.description') }}</p>
        </n-container>
      </n-page>
    </n-dialog>

  </n-page>
</template>

<script src="./wallet.js"></script>