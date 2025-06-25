<template>
  <n-page class="basket" pattern-bg :padding="false" docked-footer :show-footer="showFooter">

    <portal to="app-header-portal">
      <n-app-header title="Basket"></n-app-header>
    </portal>

    <!-- Empty basket message -->
    <section v-if="ready && basket.isEmpty" class="flexbox fill-height flex-grow text-xs-center">
      <n-container narrow class="my-auto">
        <router-link :to="{name: 'menu'}">
          <n-button icon flat has-badge class="mb-5" style="transform: scale(2);">
            <n-icon large v-badge="{value: 0, overlap: true, right: true}" class="nandos-pink--after">shopping_basket</n-icon>
          </n-button>
          <h1>{{ $t('basket.emptyBasketTitle') }}</h1>
        </router-link>
      </n-container>
    </section>

    <n-page-hero v-if="ready && !basket.isEmpty" :image-collection="heroImageCollection">
      <template v-if="basket.isOrderSetup && !displaySummaryColumn">
        <n-icon x-large class="nandos-shadow mb-1">
          <template v-if="basket.orderType == ORDER_TYPES.COLLECTION">collection</template>
          <template v-else-if="basket.orderType == ORDER_TYPES.EAT_IN">eat_in_table</template>
          <template v-else>delivery</template>
        </n-icon>

        <div class="mb-3">
          <n-marked-text>
            <span v-html="$t(`order.food.summary.full.${orderTypeKey}`, {orderType: $t(`orderType.${orderTypeKey}`), store: basket.storeName, location: basket.deliveryAddress, color: basket.customerVehicle && $t(`common.colors.${basket.customerVehicle.color}`), make: basket.customerVehicle && basket.customerVehicle.make, registration: basket.customerVehicle && basket.customerVehicle.registration, table: basket.tableId} )"></span>
          </n-marked-text>
        </div>
        <n-button jump :to="{name: 'order-setup-start'}" secondary with-triangle small>{{ $t('basket.editOrderSetup') }}</n-button>
      </template>
      <template v-else>
        <h3 class="nandos-shadow">{{ $t('basket.title') }}</h3>
      </template>
    </n-page-hero>

    <n-container v-if="canPlaceOrder && !displaySummaryColumn" wide class="fab-btn__container">
      <n-button floating absolute top right secondary class="fab-btn">
        <div class="fab-btn__inner">
          <span>{{ $t(`basket.fab.${orderTypeKey}`) }}</span>
          <span>{{basket.expectedReadyTime | date('time')}}</span>
        </div>
      </n-button>
    </n-container>

    <n-container wide>
      <n-layout row wrap style="min-height: 100%;" class="ios-safari-rendering-fix">
        <!-- Left column -->
        <n-flex xs12 :md8="displaySummaryColumn" class="basket-details-column">
          <template v-if="ready">

            <!-- Issue with selected store message -->
            <n-alert v-if="basket.isOrderSetup && basket.orderSetupIssue != null" error :value="basket.orderSetupIssue != null">
              <div>            
                <span v-if="basket.orderSetupIssue === 'OFFLINE'">{{ $t('basket.errors.storeOffline') }} </span>
                <span v-else-if="basket.orderSetupIssue === 'CLOSED'">{{ $t('basket.errors.storeClosed') }} </span>
                <span v-else-if="basket.orderSetupIssue === 'UNABLE_TO_DELIVER_TO_LOCATION'">{{ $t('basket.errors.deliveryLocation') }} </span>
                <span v-else-if="basket.orderSetupIssue === 'KERBSIDE_COLLECTION_UNAVAILABLE'">{{ $t('basket.errors.kerbsideCollectionUnavailable') }} </span>
                <span v-else>{{ $t('basket.errors.unknown') }} </span>
                <i18n tag="span" path="basket.changeStore">
                  <n-button slot="clickHere" text-link secondary jump :to="{name: 'order-setup-start'}">{{ $t('basket.clickHere') }}</n-button>
                </i18n>
              </div>
            </n-alert>

            <template v-if="!basket.isEmpty">
              <!-- Basket exceeds maximum order value -->
              <n-alert error :value="basket.isOrderSetup && basket.exceedsMaximumOrderValue">
                <div>
                  <p>
                    <strong class="display-1">{{ $t('basket.exceedsMaximumOrderValue.title') }}</strong>
                  </p>
                  <p>{{ $t('basket.exceedsMaximumOrderValue.description', {amount: $options.filters.money(basket.maximumOrderValue, 'moneyRounded')}) }}</p>
                  <p v-if="CALL_CENTER_PHONE">
                    {{ $t('basket.exceedsMaximumOrderValue.resolution.callCenter') }}
                    <a :href="`tel:${CALL_CENTER_PHONE}`" class="secondary--text">{{CALL_CENTER_PHONE}}</a>
                  </p>
                  <i18n v-else tag="p" path="basket.exceedsMaximumOrderValue.resolution.other.title">
                    <a slot="action" :href="$t('basket.exceedsMaximumOrderValue.resolution.other.actionURL')" class="secondary--text">{{ $t('basket.exceedsMaximumOrderValue.resolution.other.action') }}</a>
                  </i18n>
                </div>
              </n-alert>

              <!-- Basket does not meet minimum order value -->
              <n-alert error :value="basket.isOrderSetup && basket.underMinimumOrderValue">
                <div>
                  <p>
                    <strong class="display-1">{{ $t('basket.underMinimumOrderValue.title') }}</strong>
                  </p>
                  <p>{{ $t('basket.underMinimumOrderValue.description', {amount: $options.filters.money(basket.minimumOrderValue, 'moneyRounded')}) }}</p>
                </div>
              </n-alert>

              <!-- Basket contains 1 or more items that are unavailable -->
              <n-alert error :value="!basket.allItemsAvailable">
                <div>
                  <p>
                    <strong class="display-1">{{ $t('basket.basketContainsExcludedProducts.title') }}</strong>
                  </p>
                  <p>{{ $t('basket.basketContainsExcludedProducts.description') }}</p>
                </div>
              </n-alert>

              <!-- Snippet outlet for anonymous customers (log in prompt) -->
              <section v-if="anonymousCustomerPromptSnippet != null" class="mb-5">
                <n-template-string :content="anonymousCustomerPromptSnippet" :data="{}" />
              </section>

              <!-- Basket item listing -->
              <n-list class="basket__item-listing mb-4">
                <n-list-item v-for="basketItem in basket.items" :key="basketItem.id">
                  <n-list-tile :interactive="basketItem.available" @click.native="basketItem.available ? editItem(basketItem) : null">
                    <n-list-tile-action>
                      <n-chip round class="white--text pa-2" :class="basketItem.available ? 'orange' : 'error'">
                        {{basketItem.quantity}}x
                      </n-chip>
                    </n-list-tile-action>
                    <n-list-tile-content>
                      <n-list-tile-title v-html="basketItem.productName"></n-list-tile-title>
                      <n-list-tile-sub-title v-if="!basketItem.available" class="error--text">
                        <i18n path="basket.excludedProducts.unavailable" tag="span">
                          <template slot="reasons" v-for="exclusion in basketItem.exclusions">
                            <n-chip v-if="exclusion != EXCLUSION_TYPES.HIDDEN" :key="exclusion" error>{{ $t(`product.exclusions.${exclusion}`) }}</n-chip>
                          </template>
                        </i18n>
                      </n-list-tile-sub-title>
                      <n-list-tile-sub-title v-else-if="!basketItem.allItemsAvailable">
                        <n-chip error>{{ $t('basket.excludedProducts.hasUnavailableSelections') }}</n-chip>
                      </n-list-tile-sub-title>
                      <n-list-tile-sub-title v-else v-html="basketItem.computedDescription"></n-list-tile-sub-title>
                    </n-list-tile-content>
                    <n-list-tile-action class="money">
                      {{basketItem.productPrice * basketItem.quantity | money}}
                    </n-list-tile-action>
                    <n-list-tile-action narrow>
                      <n-button small icon flat @click.native.stop="removeItem(basketItem)" :loading="removing == basketItem" class="basket__item-listing-remove-btn grey--text ma-0" v-track="{'basket view': 'remove item'}">
                        <n-icon small>close</n-icon>
                      </n-button>
                    </n-list-tile-action>
                  </n-list-tile>
                </n-list-item>

                <n-list-divider/>

                <!-- Add an item (back to menu)-->
                <n-list-item>
                  <n-list-tile router :to="{name: 'menu'}">
                    <n-list-tile-action>
                      <n-icon primary>add</n-icon>
                    </n-list-tile-action>
                    <n-list-tile-content>
                      <n-list-tile-title>
                        <span class="primary--text">{{ $t('basket.goToMenu') }}</span>
                      </n-list-tile-title>
                    </n-list-tile-content>
                  </n-list-tile>

                  <n-list-divider/>
                </n-list-item>

                <!-- Matched/qualifying campaigns -->
                <div v-if="basket.matchedCampaigns && basket.matchedCampaigns.length">
                  <n-list-subheader class="my-3">
                    <h3 class="text-xs-left black--text">You score!</h3> <!-- TODO: i18n -->
                  </n-list-subheader>
                  <n-list-item v-for="campaign in basket.matchedCampaigns" :key="campaign.id">
                    <n-list-tile @click.stop="selectedCampaign = campaign; showCompaignDetails = true">
                      <n-list-tile-content>
                        <n-list-tile-title>
                          <span v-html="campaign.lineItemDescription"></span>
                          <n-icon small class="grey--text text--darken-1 ml-1">faq</n-icon>
                        </n-list-tile-title>
                      </n-list-tile-content>
                      <n-list-tile-action class="money">
                        <template v-if="campaign.discountValue">- {{campaign.discountValue | money}}</template>
                        <template v-else>Free</template><!-- TODO: i18n -->
                      </n-list-tile-action>
                      <n-list-tile-action narrow><n-button small icon disabled class="invisible ma-0"></n-button></n-list-tile-action> <!-- empty action to make sure money values line-up with basket items -->
                    </n-list-tile>
                  </n-list-item>
                  <n-list-divider/>
                  <free-product-selector v-if="freeProducts.length > 0"  :free-products="freeProducts" :value="selectedFreeProduct" @select="addSelectedFreeProductToBasket"/>

                </div>
                <!-- Delivery cost -->
                <n-list-item v-if="basket.forDelivery && basket.deliveryPrice !== null">
                  <n-list-tile :interactive="false">
                    <n-list-tile-content>
                      <n-list-tile-title>{{ $t('order.food.deliveryChargeItem') }}</n-list-tile-title>
                    </n-list-tile-content>
                    <n-list-tile-action class="money">{{basket.deliveryPrice | money}}</n-list-tile-action>
                    <n-list-tile-action narrow><n-button small icon disabled class="invisible ma-0"></n-button></n-list-tile-action> <!-- empty action to make sure money values line-up with basket items -->
                  </n-list-tile>
                </n-list-item>

                <!-- Surcharges -->
                <n-list-item v-for="surcharge in basket.surcharges" :key="surcharge.name">
                  <n-list-tile :interactive="false">
                    <n-list-tile-content>
                      <n-list-tile-title v-html="surcharge.name" />
                    </n-list-tile-content>
                    <n-list-tile-action class="money">{{surcharge.amount | money}}</n-list-tile-action>
                    <n-list-tile-action narrow><n-button small icon disabled class="invisible ma-0"></n-button></n-list-tile-action> <!-- empty action to make sure money values line-up with basket items -->
                  </n-list-tile>
                </n-list-item>

                <!-- Total cost -->
                <n-list-item>
                  <n-list-tile :interactive="false">
                    <n-list-tile-content>
                      <n-list-tile-title>{{ $t('order.food.orderTotal') }}</n-list-tile-title>
                    </n-list-tile-content>
                    <n-list-tile-action class="money money--large">{{basket.totalPrice | money}}</n-list-tile-action>
                    <n-list-tile-action narrow><n-button small icon disabled class="invisible ma-0"></n-button></n-list-tile-action> <!-- empty action to make sure money values line-up with basket items -->
                  </n-list-tile>
                  <n-list-divider/>
                </n-list-item>

              </n-list>

              <!-- Store's Collection Instructions -->
              <section v-if="basket.storeCapacity && basket.storeCapacity.instructions" class="text-xs-center my-2">
                <h6 class="mb-1 grey--text text--darken-2">{{ $t('basket.collectionInstructions') }}</h6>
                <p>{{basket.storeCapacity.instructions}}</p>
              </section>

              <!-- Basket VAT disclaimer -->
              <p v-if="SHOW_VAT_DISCLAIMER" class="text-xs-center grey--text text--darken-2">
                <small>{{ $t('basket.vatDisclaimer') }}</small>
              </p>

              <section class="py-4" :style="displaySummaryColumn ? '' : 'margin: 0 -2rem;'">

                <!-- Auto combo recommendations -->
                <div v-if="autoComboMatches && autoComboMatches.length">
                  <div class="mb-5 px-4 text-xs-center">
                    <h3 class="mb-1">{{ $t('basket.autoCombos.title') }}</h3>
                    <p class="grey--text text--darken-2">{{ $t('basket.autoCombos.description') }}</p>
                  </div>

                  <!-- We generate a key for the carousel based on its contents, so when that changes it re-renders, because the default slot used to pass it tiles in non-reactive  -->
                  <n-carousel :peek="!displaySummaryColumn" :key="`auto-combo-carousel-${autoComboMatches.map(item => item.comboProduct.id).join('')}`" key="auto-combo-carousel" :per-page="Math.min(carouselSlidesPerPage, autoComboMatches.length)" :rtl="languageService.rtl" class="mb-4">
                    <n-ordering-auto-combo-tile v-for="(item, idx) in autoComboMatches" :auto-combo-item="item" @click.native.stop="confirmUseOfAutoComboItem(item)" :key="`auto-combo-${item.comboProduct.id}-${idx}`" />
                  </n-carousel>
                </div>

                <!-- Upsells -->
                <div v-if="upsells && upsells.length">
                  <div class="mb-5 px-4 text-xs-center">
                    <h3 class="mb-1">{{ $t('basket.upsells.title') }}</h3>
                    <p class="grey--text text--darken-2">{{ $t('basket.upsells.description') }}</p>
                  </div>

                  <!-- We generate a key for the carousel based on its contents, so when that changes it re-renders, because the default slot used to pass it tiles in non-reactive  -->
                  <n-carousel :peek="!displaySummaryColumn" :key="`upsells-carousel-${upsells.map(upsell => upsell.item.id).join('')}`" :per-page="Math.min(carouselSlidesPerPage, upsells.length)" :rtl="languageService.rtl" class="upsells mb-4">
                    <n-ordering-menu-tile v-for="upsell in upsells" :data="upsell.item" hide-description :redirect="$route.fullPath" :show-children="false" :row="false" :key="upsell.item.id">
                      <div slot="product-details" class="grey--text pb-2">
                        <small>{{ $t('basket.upsells.relatedProduct', {product: Object.values(upsell.origins)[0].shortName}) }}</small>
                      </div>
                    </n-ordering-menu-tile>
                  </n-carousel>
                </div>

                <!-- Recommended Products -->
                <div v-if="hasRecommendedProducts">
                  <div class="mb-5 text-xs-center">
                    <h3 class="mb-1">{{ $t('basket.recommendedProducts.title') }}</h3>
                    <p class="grey--text text--darken-2">{{ $t('basket.recommendedProducts.description') }}</p>
                  </div>
                  <!-- We generate a key for the carousel based on its contents, so when that changes it re-renders, because the default slot used to pass it tiles in non-reactive  -->
                  <n-carousel :peek="!displaySummaryColumn" :key="`recommendations-carousel-${recommendedProducts.map(product => product.id).join('')}`" :per-page="Math.min(carouselSlidesPerPage, recommendedProducts.length)" :rtl="languageService.rtl" class="mb-4">
                    <n-ordering-menu-tile v-for="product in recommendedProducts" :data="product" hide-description :redirect="$route.fullPath" :row="false" :key="`recommended-product-${product.id}`" />
                  </n-carousel>
                </div>

              </section>
            </template>
          </template>
        </n-flex> <!-- Left column end -->

        <!-- Right column -->
        <n-flex v-if="displaySummaryColumn" xs12 md4 class="basket-summary-column">
          <n-ordering-order-summary-tile :basket="basket" editable>
            <template v-if="basket.isOrderSetup">

              <n-button slot="footer" class="hero-cta" v-if="promptOptionalAuthBeforeNext" @click.native.stop="showAuthPrompt = true" large block primary with-triangle :disabled="!canPlaceOrder" :loading="loading" v-track="{'checkout': 'basket'}">
                <span class="nandos-hand">{{ $t('basket.footer.confirm') }}</span>
              </n-button>

              <n-button slot="footer" class="hero-cta" v-else :to="{name: 'basket-instructions'}" large block primary with-triangle :disabled="!canPlaceOrder" :loading="loading" v-track="{'checkout': 'basket'}">
                <span class="nandos-hand">{{ $t('basket.footer.confirm') }}</span>
              </n-button>
            </template>
            <n-button slot="footer" class="hero-cta" v-else router jump :to="{name: 'order-setup-start'}" large block primary with-triangle v-track="{'setup': 'basket'}">
              <span class="nandos-hand">{{ $t('basket.footer.confirm') }}</span>
            </n-button>
          </n-ordering-order-summary-tile>
        </n-flex>
      </n-layout>
    </n-container>

    <n-page-footer slot="footer">
      <n-container v-if="ready">
        <n-button v-if="basket.isEmpty" :to="{name: 'menu'}" square block class="mb-0 hero-cta" v-track="{'start your order now': 'footer'}">
          <span class="nandos-hand">{{ $t('basket.footer.emptyBasket') }}</span>
        </n-button>
        <template v-else-if="basket.isOrderSetup">

          <n-button v-if="promptOptionalAuthBeforeNext" @click.native.stop="showAuthPrompt = true"  square block primary :disabled="!canPlaceOrder" :loading="loading" class="mb-0 hero-cta" v-track="{'checkout': 'footer'}">
            <span class="nandos-hand">{{ $t('basket.footer.confirm') }}</span>
          </n-button>
          <n-button v-else :to="{name: 'basket-instructions'}"  square block primary :disabled="!canPlaceOrder" :loading="loading" class="mb-0 hero-cta" v-track="{'checkout': 'footer'}">
            <span>&nbsp;</span>
            <span class="nandos-hand px-3">{{$t('basket.footer.confirm')}}</span>
            <n-chip round class="my-0 lumo-pink money">{{basket.totalPrice | money}}</n-chip>
          </n-button>
        </template>
        <n-button v-else jump :to="{name: 'order-setup-start'}"  square block primary class="mb-0 hero-cta" v-track="{'setup': 'footer'}">
          <span class="nandos-hand">{{ $t('basket.footer.setupOrder') }}</span>
        </n-button>
      </n-container>
    </n-page-footer>

    <!-- Confirm switching to a auto combo suggestion dialog -->
    <n-dialog slot="floating-content" v-model="showAutoComboSwitchDialog" class="comfirm-auto-combo-dialog">
      <div v-if="selectedAutoComboItem" :key="selectedAutoComboItem.comboProduct.id" class="comfirm-auto-combo-dialog__content-wrapper">
        <n-page-hero :seed="selectedAutoComboItemPlaceholderSeed" :image-collection="selectedAutoComboItem.comboProduct.imageCollection" class="comfirm-auto-combo-dialog__header">
          <div slot="background" class="block-clipped__accent-line" style="z-index: 1;"></div>
        </n-page-hero>
        <div class="comfirm-auto-combo-dialog__content white pattern-bg pattern-bg--default text-xs-center">
          <div class="px-5 mb-4">
            <h3>{{ $t('basket.autoCombos.confirmationDialog.title') }}</h3>
            <i18n class="mb-5" tag="p" path="basket.autoCombos.confirmationDialog.description">
              <span slot="comboProduct">
                <n-marked-text simple>{{selectedAutoComboItem.comboProduct.name}}</n-marked-text>
                <br>
              </span>
              <span slot="replacedProducts" class="grey--text text--darken-2">
                <br>
                <span v-html="selectedAutoComboItem.replacedBasketItems.map(item => item.productName).join(', ')"></span>
              </span>
            </i18n>
            <div class="flexbox">
              <n-button @click.native="abortAutoComboSwitch" class="flex-grow">{{ $t('basket.autoCombos.confirmationDialog.cancel') }}</n-button>
              <n-button primary with-triangle @click.native="useAutoComboItem(selectedAutoComboItem)" :loading="loadingAutoComboItemSwitch" class="flex-grow">{{ $t('basket.autoCombos.confirmationDialog.confirm') }}</n-button>
            </div>
          </div>
          <footer class="comfirm-auto-combo-dialog__footer flexbox">
            <p class="text-xs-left grey--text text--darken-2 mx-3">{{ $t('basket.autoCombos.confirmationDialog.disclaimer') }}</p>
            <div class="px-3 py-2 yellow black--text flex-grow flexbox justify-center align-center money">{{ $t('basket.autoCombos.confirmationDialog.savings', {amount: $options.filters.money(selectedAutoComboItem.savings)}) }}</div>
          </footer>
        </div>
      </div>
    </n-dialog>

    <!-- Campaign explainer -->
    <n-dialog slot="floating-content" v-model="showCompaignDetails">
      <div v-if="selectedCampaign" class="text-xs-center">
        <div class="white pa-5 px-5 block-skewed">
          <h2 v-html="selectedCampaign.title"></h2>
          <p v-html="selectedCampaign.description" class="grey--text text--darken-2"></p>
        </div>
        <n-button @click="showCompaignDetails = false" secondary with-triangle style="margin-top: -1em;">Cool, got it</n-button> <!-- TODO:: i18n -->
      </div>
    </n-dialog>


    <!-- Auth prompt dialog (ask guest users if they would prefer to register) -->
    <n-dialog slot="floating-content" v-model="showAuthPrompt" fullscreen overlap-app-header >
      <n-page pattern-bg :padding="false">

        <n-page-hero v-if="ready" style="background-color: #88B919;" hero-class="black--text pattern-bg pattern-bg--flowery pattern-bg--scale-up px-6" :placeholder-bg="false">
          <div class="tilted">
            <h1 v-html="$t('basket.guestCheckoutAuthPrompt.title')"></h1>
          </div>
          <div slot="background" class="new-layer">
            <img src="../../assets/img/chicken-heart-sunshine.svg" class="fill-height">
          </div>
        </n-page-hero>

        <n-container v-if="ready" class="text-xs-center">

          <section class="mb-6">
            <n-progress-circular v-if="!guestCheckoutAuthPromptDialogSnippet" size="45" indeterminate />
            <n-template-string v-else :content="guestCheckoutAuthPromptDialogSnippet" :data="{}" />
          </section>

          <section class="mb-5">
            <n-button primary with-triangle :to="{path: '/sign-in?checkoutAuthPrompt=true', query: {redirect:'/basket/options', jump: true}}" v-track="{'checkout-auth-prompt': 'log in'}">{{ $t('basket.guestCheckoutAuthPrompt.logIn') }}</n-button>
            <n-button text-link primary :to="{name: 'basket-instructions'}" v-track="{'checkout-auth-prompt': 'continue as guest'}" class="px-2">{{ $t('basket.guestCheckoutAuthPrompt.continueAsGuest') }}</n-button>
          </section>

          <p>
            {{$t('signIn.signUpPrompt')}} <n-button :to="{path: '/sign-up?checkoutAuthPrompt=true', query: {redirect:'/basket/options', jump: true}}" text-link v-track="{'checkout-auth-prompt': 'sign up'}">{{ $t('signIn.signUp') }}</n-button>
          </p>
        </n-container>

      </n-page>
    </n-dialog>

  </n-page>
</template>
<style scoped>
.free-product-dialog {
  min-width: 400px;
  max-width: 600px;
  min-height: 200px;
  max-height: 600px;
  overflow-y: auto;
}
</style>

<script src="./basket.js"></script>