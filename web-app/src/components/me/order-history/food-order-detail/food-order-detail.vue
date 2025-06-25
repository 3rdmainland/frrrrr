<template>
  <n-page :overlap-app-header="overlapAppHeader" :padding="false" class="food-order-detail">
    <n-dual-pane>
      <n-page slot="left" ref="leftPage" pattern-bg :padding="false" :docked-footer="$breakpoints.xs" :show-footer="canReorder && !isPublicTrackingContext">

        <portal to="app-header-portal" >
          <n-app-header
           :title="$t('profile.history.detail.food.titleShort')"
           back-title="Orders"
           :transparent="overlapAppHeader"
           :scroll-spy-target="overlapAppHeader ? $refs.leftPage : null"
           :fade-to="appHeaderColor"
           :class="{'white--text': overlapAppHeader}" />
        </portal>

        <n-ordering-contextual-page-hero v-if="ready" :pull-content-above="$breakpoints.smDown" :order-type="basket.orderType">
          <template v-if="basket.orderNumber">
            <h2 class="mb-1">{{ $t('order.food.withOrderNumber.title', {orderNumber: basket.orderNumber} ) }}</h2>
            <p>{{ $t('order.food.withOrderNumber.content', {date: $options.filters.date(basket.orderPlacedTime, 'full') }) }}</p>
          </template>
          <template v-else>
            <h2 class="mb-1">{{ $t('order.food.withoutOrderNumber.title', {orderNumber: basket.orderNumber} ) }}</h2>
            <p>{{ $t('order.food.withoutOrderNumber.content', {date: $options.filters.date(basket.orderPlacedTime, 'full') }) }}</p>
          </template>
        </n-ordering-contextual-page-hero>

        <n-container v-if="ready" :narrow="twoColumnLayout" class="food-order-detail__order-details mb-5">

          <!-- Kerbside instructions -->
          <n-tile v-if="basket.kerbsideCollect && !orderIsComplete" class="kerbside-instructions" column>
            <n-tile-content block class="text-xs-left">
              <p class="display-3">{{ $t('order.food.kerbsideInstructions.title') }}</p>
              <div v-html="store && store.kerbsideInstructions || $t('order.food.kerbsideInstructions.description')" class="mb-4"></div>

              <n-button v-if="allowKerbsideCustomerActions" @click.native.stop="showChangeKerbsideStateDialog = true" block secondary with-triangle v-track="{'food-detail-fulfilment': 'customer-arrived'}">
                {{ $t('profile.history.detail.food.kerbside.arrived.cta') }}
                <n-icon v-if="basket.kerbsideState.status == KERBSIDE_STATUSES.CUSTOMER_ARRIVED" right class="lumo-pink--text">tick</n-icon>
              </n-button>
            </n-tile-content>
          </n-tile>

          <!-- Order fulfilment progress -->
          <n-tile>
            <n-tile-content xs12 md6 class="pa-0">
              <img :src="fulfilmentStatusImage" class="fulfilment-status-image">
              <!-- <n-lottie-player v-if="progressAnimation" :animation-data="progressAnimation" /> -->
            </n-tile-content>
            <n-tile-content xs12 md6 class="text-xs-left">
              <section style="width: 100%;">
                <div class="flexbox justify-space-between">
                  <div>
                    <strong class="grey--text">{{ $t(`order.food.fulfilmentProgress.title`) }}</strong>
                    <br>
                    <!-- Fulfillment status title -->
                    <p class="display-3">{{ $t(`order.food.fulfilmentProgress.${orderTypeKey}.${basket.fulfilmentProgress.status}.title`, {location: basket.deliveryAddress, store: basket.storeName}) }}</p>
                  </div>

                  <div>
                    <strong class="grey--text">
                      <template v-if="orderIsComplete">
                        {{ $t(`order.food.fulfilmentProgress.fulfilledTimeTitle`) }}
                      </template>
                      <template v-else>
                        {{ $t(`order.food.fulfilmentProgress.expectedTimeTitle`) }}
                      </template>
                    </strong>
                    <br>
                    <p class="display-3">{{basket.orderExpectedTime | date('time')}}</p>
                  </div>
                </div>

                <!-- Fulfillment status description -->
                <p class="mb-6">{{ $t(`order.food.fulfilmentProgress.${orderTypeKey}.${basket.fulfilmentProgress.status}.description`, {location: basket.deliveryAddress, store: basket.storeName}) }}</p>

                <template v-if="orderIsComplete">
                  <template v-if="!isPublicTrackingContext">
                    <n-button v-if="!basket.hasReview" @click.native.stop="show_order_rating_form = true" block secondary with-triangle v-track="{'food-detail': 'rate order'}" class="mb-3">
                      {{ $t('profile.history.detail.food.orderRating.cta') }}
                    </n-button>
                    <n-button @click.native.stop="show_invoice_form = true" block outline v-track="{'food-detail': 'get invoice'}">
                      {{ $t('profile.history.detail.food.requestInvoice') }}
                    </n-button>
                  </template>
                </template>
                <template v-else-if="basket.orderType == ORDER_TYPES.DELIVERY && store.trackingEnabled">
                  <n-button @click.native.stop="showDeliveryTracking = true" :disabled="isDeliveryTrackingAvailable ? false : true" block secondary with-triangle v-track="{'food-detail': 'track delivery'}">
                    {{ $t('profile.history.detail.food.tracking.available') }}
                  </n-button>
                  <p
                    v-if="!isDeliveryTrackingAvailable"
                    class="mt-3 grey--text"
                  >
                    {{ $t("profile.history.detail.food.tracking.unavailable") }}
                  </p>
                  <n-button
                    :to="PERI_PLAYGROUND_URL"
                    :external="true"
                    inAppBrowserTarget="_blank"
                    block
                    info
                  >
                    {{ $t("nav.periPlayground") }}
                  </n-button>
                </template>

                <!-- Help CTA -->
                <template v-if="basket.orderType != ORDER_TYPES.EAT_IN">
                  <n-list-divider class="my-5 mx-0"/>

                  <div class="flexbox justify-center">
                    <n-button :append="!isPublicTrackingContext" :to="!isPublicTrackingContext ? 'help' : '/contact'" flat small class="my-0" v-track="{'food-detail': 'get-help'}">
                      <span class="mr-1">{{ $t('profile.history.detail.food.help') }}</span>
                      <span class="primary--text underline">{{ $t('profile.history.detail.food.helpCta') }}</span>
                    </n-button>
                  </div>
                </template>

              </section>
            </n-tile-content>
          </n-tile>

          <!-- Customer Flavour preference prompt -->
          <n-tile v-if="!isPublicTrackingContext && !customerHadFlavourPreference && !orderIsComplete" class="column hot pattern-bg pattern-bg--default">
            <n-tile-content class="white--text">
              <n-blocked-heading tag="h3">{{$t('profile.history.detail.food.flavourPreference.title')}}</n-blocked-heading>
              <p>{{$t('profile.history.detail.food.flavourPreference.description')}}</p>
            </n-tile-content>
            <n-tile-content>
              <n-form class="text-xs-left" style="width: 100%;">
                <n-select v-model="customer.preferences.flavour" @input="setCustomerFlavourPreference" :label="$t('profile.history.detail.food.flavourPreference.label')">
                  <option :value="null">{{ $t('profile.history.detail.food.flavourPreference.none') }}</option>
                  <option v-for="(flavourName, flavourId) in configs.flavours" :value="flavourId" :key="flavourId">{{flavourName}}</option>
                </n-select>
              </n-form>
            </n-tile-content>
          </n-tile>

          <n-tile v-if="isPublicTrackingContext" :column="$breakpoints.xs" class="app-download-links">
            <n-tile-content class="yellow pattern-bg pattern-bg--flowery">
              <h3 class="mb-2">{{ $t('profile.history.detail.food.public.getApp.title') }}</h3>
              <i18n tag="p" path="profile.history.detail.food.public.getApp.description">
                <n-button slot="webOrdering" :to="{name: 'menu'}" text-link><span class="underline">{{ $t('profile.history.detail.food.public.getApp.webOrdering') }}</span></n-button>
              </i18n>
            </n-tile-content>
            <n-tile-content>
              <n-button v-if="IOS_APP_STORE_ID" flat :to="`http://apps.apple.com/app/id${IOS_APP_STORE_ID}`" target="_blank" v-track="{'food-detail-public-order-tracking': 'get-app-apple-app-store'}">
                <img src="@/assets/img/app-store-badges/apple-app-store.svg" />
              </n-button>
              <n-button v-if="ANDROID_APP_STORE_ID" flat :to="`http://play.google.com/store/apps/details?id=${ANDROID_APP_STORE_ID}`" target="_blank" v-track="{'food-detail-public-order-tracking': 'get-app-google-play-store'}">
                <img src="@/assets/img/app-store-badges/google-play-store.svg" />
              </n-button>
              <n-button v-if="HUAWEI_APP_STORE_ID" flat :to="`https://appgallery.cloud.huawei.com/marketshare/app/${HUAWEI_APP_STORE_ID}?source=call-center-public-order-tracking&subsource=${HUAWEI_APP_STORE_ID}`" target="_blank" v-track="{'food-detail-public-order-tracking': 'get-app-huawei-app-gallery'}">
                <img src="@/assets/img/app-store-badges/huawei-app-gallery.png" />
              </n-button>
            </n-tile-content>
          </n-tile>

          <!-- Order details -->
          <section>
            <p class="display-3">{{ $t('order.food.summaryTitle') }}</p>

            <n-list-divider class="my-5 mx-0"/>

            <div>
              <p class="grey--text">{{ $t(`profile.history.detail.food.summary.${orderTypeKey}.title`) }}</p>
              <p class="flexbox row wrap">
                <span class="pr-5">{{ $t(`profile.history.detail.food.summary.${orderTypeKey}.content`, {orderType: $t(`orderType.${orderTypeKey}`), location: basket.deliveryAddress, store: basket.storeName, table: basket.tableId}) }}</span>
                <n-spacer />
                <n-button v-if="storeDirectionsUrl" primary text-link external :to="storeDirectionsUrl" target="_blank" class="underline uppercase" v-track="{'food-detail': 'get-directions-to-store'}">{{ $t(`profile.history.detail.food.summary.${orderTypeKey}.directions`) }}</n-button>
              </p>
            </div>

            <n-list-divider class="my-5 mx-0"/>

            <!-- Basket item listing -->
            <n-list class="basket-item-list">

              <n-list-subheader class="mb-2">{{ $t(`order.food.summaryItemsTitle`) }}</n-list-subheader>

              <!-- Basket items -->
              <n-list-item v-for="basketItem in basket.items" :key="basketItem.id">
                <n-list-tile :interactive="false">
                  <n-list-tile-action>
                    <n-chip round class="orange white--text pa-2">
                      {{basketItem.quantity}}x
                    </n-chip>
                  </n-list-tile-action>
                  <n-list-tile-content>
                    <n-list-tile-title v-html="basketItem.productName" />
                    <n-list-tile-sub-title v-html="basketItem.computedDescription" />
                  </n-list-tile-content>
                  <n-list-tile-action class="money">
                    {{basketItem.productPrice * basketItem.quantity | money}}
                  </n-list-tile-action>
                </n-list-tile>
              </n-list-item>

              <n-list-divider class="my-4 mx-0"/>

              <!-- Matched/qualifying campaigns -->
              <template v-if="basket.matchedCampaigns && basket.matchedCampaigns.length">
                <n-list-subheader class="mb-2">You score!</n-list-subheader> <!-- TODO: i18n -->

                <n-list-item v-for="campaign in basket.matchedCampaigns" :key="campaign.id">
                  <n-list-tile :interactive="false">
                    <n-list-tile-content>
                      <n-list-tile-title v-html="campaign.lineItemDescription" />
                    </n-list-tile-content>
                    <n-list-tile-action class="money">
                      <template v-if="campaign.discountValue">- {{campaign.discountValue | money}}</template>
                      <template v-else>Free</template> <!-- TODO: i18n -->
                    </n-list-tile-action>
                  </n-list-tile>
                </n-list-item>
                <n-list-divider class="my-4 mx-0"/>
              </template>

              <!-- Checkout instructions -->
              <template v-if="basket.checkoutInstructions && basket.checkoutInstructions.length">
                <n-list-subheader class="mb-2">Instructions</n-list-subheader> <!-- TODO: i18n -->

                <n-list-item v-for="instruction in basket.checkoutInstructions" :key="instruction.id">
                  <n-list-tile :interactive="false">
                    <n-list-tile-content>
                      <n-list-tile-title v-html="instruction.productName" />
                    </n-list-tile-content>
                    <n-list-tile-action ><n-spacer/></n-list-tile-action> <!-- empty action to make sure money values line-up with basket items -->
                  </n-list-tile>
                </n-list-item>
                <n-list-divider class="my-4 mx-0"/>
              </template>

              <!-- Delivery cost -->
              <n-list-item v-if="basket.forDelivery">
                <n-list-tile :interactive="false">
                  <n-list-tile-content>
                    <n-list-tile-title>{{ $t('order.food.deliveryChargeItem') }}</n-list-tile-title>
                  </n-list-tile-content>
                  <n-list-tile-action class="money">{{
                    basket.deliveryPrice | money
                  }}</n-list-tile-action>
                </n-list-tile>
              </n-list-item>

              <!-- Delivery Driver Tip -->
              <n-list-item v-if="basket.deliveryDriverTipPrice">
                <n-list-tile :interactive="false">
                  <n-list-tile-content>
                    <n-list-tile-title>{{
                      $t("order.food.deliveryDriverTipPrice")
                    }}</n-list-tile-title>
                  </n-list-tile-content>
                  <n-list-tile-action class="money">{{
                    basket.deliveryDriverTipPrice | money
                  }}</n-list-tile-action>
                </n-list-tile>
              </n-list-item>

              <!-- Surcharges -->
              <n-list-item v-for="surcharge in basket.surcharges" :key="surcharge.name">
                <n-list-tile :interactive="false">
                  <n-list-tile-content>
                    <n-list-tile-title v-html="surcharge.name" />
                  </n-list-tile-content>
                  <n-list-tile-action class="money">{{surcharge.amount | money}}</n-list-tile-action>
                </n-list-tile>
              </n-list-item>

              <!-- Total cost -->
              <n-list-item>
                <n-list-tile :interactive="false">
                  <n-list-tile-content>
                    <n-list-tile-title>{{ $t('order.food.orderTotal') }}</n-list-tile-title>
                  </n-list-tile-content>
                  <n-list-tile-action class="money money--large">{{
                    (basket.totalPrice + basket.deliveryDriverTipPrice) | money
                  }}</n-list-tile-action>
                </n-list-tile>
              </n-list-item>
            </n-list>

          </section>
        </n-container>

        <!-- Change kerbside state dialog -->
        <n-dialog slot="floating-content" v-model="showChangeKerbsideStateDialog">
          <div class="pa-5 block-skewed white text-xs-center">
            <h3>{{ $t('profile.history.detail.food.kerbside.arrived.confirmation.title') }}</h3>
            <p v-html="$t('profile.history.detail.food.kerbside.arrived.confirmation.description')"></p>
            <n-button primary block @click.native="updateKerbsideState(KERBSIDE_STATUSES.CUSTOMER_ARRIVED)" :loading="kerbsideStatusLoading" v-track="{'food-detail-kerbside-dialog': 'customer-arrived'}">{{ $t('profile.history.detail.food.kerbside.arrived.confirmation.confirm') }}</n-button>
            <n-button outline block @click.native="updateKerbsideState(KERBSIDE_STATUSES.ASSISTANCE_REQUIRED)" :loading="kerbsideStatusLoading" v-track="{'food-detail-kerbside-dialog': 'assistance-required'}">{{ $t('profile.history.detail.food.kerbside.help.cta') }}</n-button>
          </div>
        </n-dialog>

        <!-- Tracking info now available -->
        <n-dialog slot="floating-content" v-model="showTrackingInfoNewlyAvailableDialog">
          <div class="pa-5 block-skewed white text-xs-center">
            <h3>{{ $t('profile.history.detail.food.trackingNewlyAvailable.title') }}</h3>
            <p class="mb-5">{{ $t('profile.history.detail.food.trackingNewlyAvailable.subtitle') }}</p>
            <n-button primary block with-triangle @click.native.stop="handleTrackingWebview" v-track="{'food-detail': 'track delivery'}">{{ $t('profile.history.detail.food.trackingNewlyAvailable.cta') }}</n-button>
          </div>
        </n-dialog>

        <!-- Rate my order dialog -->
        <n-order-review slot="floating-content" v-if="ready" v-model="show_order_rating_form" :order="basket">
          <template slot="title">{{ $t('profile.history.detail.food.orderRating.title') }}</template>
          <template slot="subtitle">{{ $t(`profile.history.detail.food.orderRating.subtitle.${orderTypeKey}`, {store: basket.storeName}) }}</template>
        </n-order-review>

        <!-- Get invoice dialog -->
        <n-dialog slot="floating-content" v-model="show_invoice_form" fullscreen overlap-app-header>
          <n-page pattern-bg overlap-app-header>
            <n-container narrow class="mt-6">
              <h2 class="text-xs-center">{{ $t('profile.history.invoice.title') }}</h2>
              <n-form v-if="show_invoice_form" @submit="getInvoice">
                <n-input v-model="form_data.email" type="email" inputmode="email" name="email" :label="$t('profile.history.invoice.form.email')" autocomplete="email" required></n-input>
                <div class="form-group flexbox">
                  <n-spacer />
                  <n-button type="submit" primary with-triangle :loading="send_invoice_loading" v-track="{'food-detail-invoice-form': 'submit'}">{{ $t('profile.history.invoice.form.submit') }}</n-button>
                </div>
              </n-form>
            </n-container>
          </n-page>
        </n-dialog>

        <!-- Delivery tracking -->
        <n-dialog slot="floating-content" v-model="showDeliveryTracking" fullscreen overlap-app-header transition="n-dialog-bottom-transition">
          <n-button slot="closeBtn" icon flat fixed top left small>
            <n-icon>close</n-icon>
          </n-button>
          <n-page pattern-bg overlap-app-header>
            <iframe v-if="loadDeliveryTracking" :src="basket.fulfilmentProgress.deliveryTrackingUrl" class="new-layer ios-safari-rendering-fix"></iframe>
          </n-page>
        </n-dialog>


        <n-page-footer slot="footer">
          <n-container v-if="ready">
            <n-button @click.native.stop="reorder" :loading="reorder_loading" primary with-triangle :skew="$breakpoints.xs" :block="$breakpoints.xs" v-track="{'food-detail': 'reorder'}">{{ $t('profile.history.detail.food.reorder') }}</n-button>
          </n-container>
        </n-page-footer>

      </n-page>

      <n-page slot="right" v-if="twoColumnLayout" :padding="false" :class="placeholder">
        <n-computed-image v-if="heroProduct" :image-collection="heroProduct.getImageCollection()" />
      </n-page>
    </n-dual-pane>
  </n-page>
</template>

<script src="./food-order-detail.js"></script>