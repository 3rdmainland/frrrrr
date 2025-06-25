<template>
  <n-page
    ref="page"
    class="checkout"
    pattern-bg
    :padding="false"
    :docked-footer="$breakpoints.smDown"
    :show-footer="show_footer"
  >
    <portal to="app-header-portal">
      <n-app-header />
    </portal>

    <n-page-hero :pull-content-above="$breakpoints.smDown">
      <img
        slot="background"
        class="new-layer img--center img--fill"
        src="@/assets/img/checkout-header.svg"
      />
      <h2>{{ $t("basket.checkout.titleShort") }}</h2>
    </n-page-hero>

    <n-container :wide="$breakpoints.mdUp">
      <n-layout row wrap v-if="ready">
        <!-- Left column -->
        <n-flex xs12 md8>
          <n-tile v-if="$breakpoints.smDown" column class="mb-4">
            <n-tile-content block class="text-xs-left">
              <div class="flexbox justify-space-between mb-2">
                <span class="display-3">{{
                  $t("basket.checkout.summary.total")
                }}</span>
                <span class="display-3">{{ basket.totalPrice | money }}</span>
              </div>
              <div class="grey--text">
                <span
                  v-html="
                    $t(`order.food.summary.full.${orderTypeKey}`, {
                      orderType: $t(`orderType.${orderTypeKey}`),
                      store: basket.storeName,
                      location: basket.deliveryAddress,
                      color:
                        basket.customerVehicle &&
                        $t(`common.colors.${basket.customerVehicle.color}`),
                      make:
                        basket.customerVehicle && basket.customerVehicle.make,
                      registration:
                        basket.customerVehicle &&
                        basket.customerVehicle.registration,
                      table: basket.tableId,
                    })
                  "
                ></span>
              </div>
            </n-tile-content>
          </n-tile>

          <n-payment-processor
            ref="paymentProcessor"
            :class="{ 'fill-height': checkoutInProgress }"
            :payment-service="paymentService"
            :required-payment-amount="basket.totalPrice"
            :order-type="basket.orderType"
            @some-payment-methods-available="
              somePaymentMethodsAvailable = $event
            "
            @wallet-contribution="walletContribution = $event"
            @voucher-contributions="voucher_contributions = $event"
            @additional-payment-amount="additional_payment_amount = $event"
            @is-final-step="isFinalStep = $event"
            @checkout-state-change="
              checkoutInProgress = $event.inProgress == true
            "
            @tip-contribution="tipContribution = $event"
            @success="onSuccessfulPayment"
            @cancelled="onPaymentCancelled"
          />
        </n-flex>
        <!-- Right column -->
        <n-flex xs12 md4 v-if="$breakpoints.mdUp">
          <n-ordering-order-summary-tile :basket="basket">
            <template
              v-if="additional_payment_amount == basket.totalPrice"
              slot="additional-info"
            >
              <!-- Total Due -->
              <n-list-item>
                <n-list-tile :interactive="false">
                  <p
                    class="flexbox justify-space-between mb-0"
                    style="width: 100%"
                  >
                    <strong class="display-2">{{
                      $t("basket.checkout.summary.total")
                    }}</strong>
                    <strong class="display-2">{{
                      basket.totalPrice | money
                    }}</strong>
                  </p>
                </n-list-tile>
              </n-list-item>
            </template>
            <template v-else slot="additional-info">
              <!-- If there are voucher/wallet components to this transaction -->
              <n-list-item>
                <n-list-tile :interactive="false">
                  <!-- Total Due -->
                  <p
                    class="flexbox justify-space-between mb-1"
                    style="width: 100%"
                  >
                    <strong>{{ $t("basket.checkout.summary.total") }}</strong>
                    <strong>{{ basket.totalPrice | money }}</strong>
                  </p>
                  <!-- Driver Tip -->
                  <p
                    v-if="tipContribution"
                    class="flexbox justify-space-between mb-1"
                    style="width: 100%"
                  >
                    <span>{{ $t("basket.checkout.summary.tip") }}</span>
                    <span>+ {{ tipContribution | money }}</span>
                  </p>
                  <!-- Wallet -->
                  <p
                    v-if="walletContribution"
                    class="flexbox justify-space-between mb-1"
                    style="width: 100%"
                  >
                    <span>{{ $t("basket.checkout.summary.wallet") }}</span>
                    <span>- {{ walletContribution | money }}</span>
                  </p>
                  <!-- Voucher -->
                  <p
                    v-if="voucher_contributions"
                    class="flexbox justify-space-between mb-1"
                    style="width: 100%"
                  >
                    <span>{{ $t("basket.checkout.summary.voucher") }}</span>
                    <span>- {{ voucher_contributions | money }}</span>
                  </p>
                </n-list-tile>
              </n-list-item>
              <!-- Balance Due -->
              <n-list-item>
                <n-list-tile :interactive="false">
                  <p
                    class="flexbox justify-space-between mb-0"
                    style="width: 100%"
                  >
                    <strong class="display-2">{{
                      $t("order-setup-summary.balance")
                    }}</strong>
                    <strong class="display-2">{{
                      (additional_payment_amount + driverTipAmount) | money
                    }}</strong>
                  </p>
                </n-list-tile>
              </n-list-item>
            </template>
            <n-button
              v-if="!isFinalStep"
              slot="footer"
              @click.native.stop="onProceedBtnClick"
              large
              block
              primary
              with-triangle
              v-track="{ proceed: 'order-summary-tile' }"
            >
              {{ $t("basket.checkout.proceed") }}
            </n-button>
            <n-button
              v-else
              slot="footer"
              @click.native.stop="onPayBtnClick"
              :disabled="!somePaymentMethodsAvailable || checkoutInProgress"
              :loading="loading"
              large
              block
              primary
              with-triangle
              v-track="{ pay: 'order-summary-tile' }"
            >
              <i18n tag="span" path="basket.checkout.confirm">
                <span class="money" slot="amount">{{
                  basket.totalPrice | money
                }}</span>
              </i18n>
            </n-button>
          </n-ordering-order-summary-tile>
        </n-flex>
      </n-layout>
    </n-container>

    <n-page-footer slot="footer">
      <n-container v-if="ready">
        <n-button
          v-if="!isFinalStep"
          @click.native.stop="onProceedBtnClick"
          :square="$breakpoints.smDown"
          :block="$breakpoints.smDown"
          primary
          v-track="{ proceed: 'footer' }"
          class="hero-cta"
        >
          <span class="nandos-hand">{{ $t("basket.checkout.proceed") }}</span>
        </n-button>
        <n-button
          v-else
          @click.native.stop="onPayBtnClick"
          :disabled="!somePaymentMethodsAvailable || checkoutInProgress"
          :loading="loading"
          :square="$breakpoints.smDown"
          :block="$breakpoints.smDown"
          primary
          v-track="{ pay: 'footer' }"
          class="hero-cta"
        >
          <i18n tag="span" path="basket.checkout.confirm" class="nandos-hand">
            <span class="money" slot="amount">{{
              basket.totalPrice | money
            }}</span>
          </i18n>
        </n-button>
      </n-container>
    </n-page-footer>
  </n-page>
</template>

<script src="./checkout.js"></script>
