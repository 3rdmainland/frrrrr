<template>
  <n-page
    pattern-bg
    :padding="false"
    :docked-footer="$breakpoints.smDown"
    :show-footer="show_footer"
  >
    <portal to="app-header-portal">
      <n-app-header
        :title="$t('giftCard.checkout.titleShort')"
        back-title="Basket"
      ></n-app-header>
    </portal>

    <n-page-hero :pull-content-above="$breakpoints.smDown">
      <img
        slot="background"
        class="new-layer img--center img--fill"
        src="@/assets/img/checkout-header.svg"
      />
      <h2>{{ $t("giftCard.checkout.titleShort") }}</h2>
    </n-page-hero>

    <n-container :wide="$breakpoints.mdUp">
      <n-layout row wrap v-if="ready">
        <!-- Left column -->
        <n-flex xs12 md8>
          <n-tile v-if="$breakpoints.smDown" column class="mb-4">
            <n-tile-content block class="text-xs-left">
              <div class="flexbox justify-space-between mb-2">
                <span class="display-3">{{
                  $t("giftCard.checkout.summary.total")
                }}</span>
                <span class="display-3">{{ basket.totalPrice | money }}</span>
              </div>
              <div class="grey--text">
                {{
                  $tc(
                    "giftCard.checkout.summary.description",
                    basket.totalItems
                  )
                }}
              </div>
            </n-tile-content>
          </n-tile>

          <n-payment-processor
            ref="paymentProcessor"
            :class="{ 'fill-height': checkoutInProgress }"
            :payment-service="paymentService"
            :required-payment-amount="basket.totalPrice"
            :giftBasket="true"
            @some-payment-methods-available="
              somePaymentMethodsAvailable = $event
            "
            @is-final-step="isFinalStep = $event"
            @checkout-state-change="
              checkoutInProgress = $event.inProgress == true
            "
            @success="onSuccessfulPayment"
            @cancelled="onPaymentCancelled"
          />
        </n-flex>
        <!-- Right column -->
        <n-flex xs12 md4 v-if="$breakpoints.mdUp">
          <n-tile column>
            <n-page-hero :skew="false" class="mb-0 py-5">
              <h3 class="display-4">
                {{
                  $tc(
                    "giftCard.checkout.summary.description",
                    basket.totalItems
                  )
                }}
              </h3>
            </n-page-hero>

            <footer class="px-5 py-3">
              <n-button
                v-if="!isFinalStep"
                @click.native.stop="onProceedBtnClick"
                large
                block
                primary
                with-triangle
                v-track="{ proceed: 'tile' }"
              >
                {{ $t("giftCard.checkout.proceed") }}
              </n-button>
              <n-button
                v-else
                @click.native.stop="onPayBtnClick"
                :disabled="!somePaymentMethodsAvailable || checkoutInProgress"
                :loading="loading"
                large
                block
                primary
                with-triangle
                v-track="{ pay: 'tile' }"
              >
                <span class="money">{{
                  $t("giftCard.checkout.confirm", {
                    amount: $options.filters.money(basket.totalPrice),
                  })
                }}</span>
              </n-button>
            </footer>
          </n-tile>
        </n-flex>
      </n-layout>
    </n-container>

    <n-page-footer slot="footer">
      <n-container v-if="ready">
        <n-button
          v-if="!isFinalStep"
          @click.native.stop="onProceedBtnClick"
          :skew="$breakpoints.smDown"
          :block="$breakpoints.smDown"
          primary
          with-triangle
          v-track="{ proceed: 'footer' }"
        >
          {{ $t("giftCard.checkout.proceed") }}
        </n-button>
        <n-button
          v-else
          @click.native.stop="onPayBtnClick"
          :disabled="!somePaymentMethodsAvailable || checkoutInProgress"
          :loading="loading"
          :skew="$breakpoints.smDown"
          :block="$breakpoints.smDown"
          primary
          with-triangle
          v-track="{ pay: 'footer' }"
        >
          <span class="money">{{
            $t("giftCard.checkout.confirm", {
              amount: $options.filters.money(basket.totalPrice),
            })
          }}</span>
        </n-button>
      </n-container>
    </n-page-footer>
  </n-page>
</template>

<script src="./gift-card-checkout.js"></script>
