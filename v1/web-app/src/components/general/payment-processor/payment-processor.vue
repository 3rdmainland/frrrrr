<template>
  <section v-if="ready" class="payment-processor">
    <!-- We use v-show here, instead of v-if so that components are hidden, not destroyed, so that they can maintain their state -->
    <n-form
      ref="paymentForm"
      @submit="_startPayment"
      v-show="show_payment_options"
      style="position: relative"
    >
      <transition name="payment-proceccor-fade-right-to-left">
        <section v-if="!isMultiStep || !isFinalStep" key="step-1">
          <!-- If Online payment capabilities have been turned off -->
          <n-alert
            :value="!onlinePaymentsAvailable"
            class="grey lighten-3 mb-4"
          >
            <p>
              {{
                paymentOptions.walletPaymentAvailable
                  ? $t(
                      "paymentProcessor.onlinePaymentUnavailable.regionHasWallet"
                    )
                  : $t("paymentProcessor.onlinePaymentUnavailable.default")
              }}
            </p>
          </n-alert>

          <!-- Driver Tip -->
          <section v-if="tipsAvailable">
            <p class="payment-processor__heading flexbox justify-space-between">
              <span>{{ $t("paymentProcessor.paymentTypes.TIP.title") }}</span>
              <span v-if="driverTipAmount">{{ driverTipAmount | money }}</span>
            </p>
            <div class="flexbox row wrap align-center">
              <n-radio
                v-model="driverTip"
                radio-value="0"
                name="driver-tip"
                label="None"
                :key="0"
                class="mb-0 pl-0 flex"
              >
              </n-radio>
              <n-radio
                v-model="driverTip"
                radio-value="10"
                name="driver-tip"
                label="10"
                :key="1"
                class="mb-0 pl-0 flex"
              >
              </n-radio>
              <n-radio
                v-model="driverTip"
                radio-value="20"
                name="driver-tip"
                label="20"
                :key="2"
                class="mb-0 pl-0 flex"
              >
              </n-radio>
              <n-radio
                v-model="driverTip"
                radio-value="30"
                name="driver-tip"
                label="30"
                :key="3"
                class="mb-0 pl-0 flex"
              >
              </n-radio>
              <n-radio
                v-model="driverTip"
                radio-value="40"
                name="driver-tip"
                label="40"
                :key="4"
                class="mb-0 pl-0 flex"
              >
              </n-radio>
              <n-radio
                v-model="driverTip"
                radio-value="custom"
                name="driver-tip"
                label="Custom"
                :key="5"
                class="mb-0 pl-0 flex"
              >
              </n-radio>
            </div>
            <n-input
              v-if="driverTip === 'custom'"
              v-model="driverTipAmountFloat"
            >
              <div slot="prepend" class="pl-3">R</div>
              <div slot="help">
                {{ $t("paymentProcessor.paymentTypes.TIP.help") }}
              </div>
            </n-input>
            <span class="help" v-if="driverTip !== 'custom'">{{
              $t("paymentProcessor.paymentTypes.TIP.help", {
                balance: $options.filters.money(walletBalance),
              })
            }}</span>
            <hr class="list__divider my-3" />
          </section>

          <!-- Wallet payment -->
          <section
            v-if="
              walletPaymentsAvailable &&
              voucher_contributions < requiredPaymentAmount
            "
          >
            <p class="payment-processor__heading flexbox justify-space-between">
              <span>{{
                $t("paymentProcessor.paymentTypes.WALLET.title")
              }}</span>
              <span v-if="useWallet">{{ maxWalletAmount | money }}</span>
            </p>
            <n-checkbox
              v-model="useWallet"
              :label="
                $t('paymentProcessor.paymentTypes.WALLET.description', {
                  amount: $options.filters.money(maxWalletAmount),
                })
              "
            >
              <span slot="help">{{
                $t("paymentProcessor.paymentTypes.WALLET.help", {
                  balance: $options.filters.money(walletBalance),
                })
              }}</span>
            </n-checkbox>
          </section>

          <hr
            v-if="
              walletPaymentsAvailable &&
              voucherPaymentsAvailable &&
              voucher_contributions < requiredPaymentAmount
            "
            class="list__divider my-3"
          />

          <!-- Vouchers -->
          <section
            v-if="voucherPaymentsAvailable"
            v-show="vouchers.length > 0 || needs_additional_payment"
          >
            <p
              class="payment-processor__sub-heading flexbox justify-space-between"
            >
              <span>{{
                $t("paymentProcessor.paymentTypes.VOUCHER.title")
              }}</span>
              <span v-if="vouchers.length > 0">{{
                voucher_contributions | money
              }}</span>
            </p>

            <n-list class="mb-3">
              <n-list-item v-for="voucher in vouchers" :key="voucher.id">
                <n-list-tile class="align-center" :interactive="false">
                  <n-list-tile-content>
                    <n-list-tile-title>{{ voucher.title }}</n-list-tile-title>
                    <n-list-tile-sub-title v-if="voucher.description">{{
                      voucher.description
                    }}</n-list-tile-sub-title>
                    <n-list-tile-sub-title v-if="voucher.disclaimer"
                      ><small>{{ voucher.disclaimer }}</small>
                    </n-list-tile-sub-title>
                  </n-list-tile-content>
                  <n-list-tile-action>
                    <n-button
                      icon
                      flat
                      @click.native.stop="_removeVoucher(voucher)"
                      :loading="voucher_form.removeVoucher == voucher.code"
                    >
                      <n-icon>delete</n-icon>
                    </n-button>
                  </n-list-tile-action>
                </n-list-tile>
              </n-list-item>
            </n-list>

            <n-form
              v-show="needs_additional_payment"
              ref="voucherForm"
              inline
              @submit="_addVoucher"
              @validity="voucher_form.is_valid = $event"
              class="align-start"
            >
              <n-input
                v-model="voucher_form.code"
                name="nandos-voucher"
                :label="$t('paymentProcessor.paymentTypes.VOUCHER.form.label')"
                :placeholder="
                  vouchers.length == 0
                    ? $t(
                        'paymentProcessor.paymentTypes.VOUCHER.form.placeholder'
                      )
                    : $t(
                        'paymentProcessor.paymentTypes.VOUCHER.form.anotherPlaceholder'
                      )
                "
                style="flex: 1 1 auto"
                minlength="3"
                required
              />
              <n-button
                type="submit"
                :secondary="voucher_form.is_valid"
                with-triangle
                :loading="voucher_form.loading"
              >
                {{ $t("paymentProcessor.paymentTypes.VOUCHER.form.submit") }}
              </n-button>
            </n-form>

            <n-alert error :value="voucher_form.error != null">{{
              voucher_form.error
            }}</n-alert>
          </section>

          <section v-if="paymentTypes.length > 0 && needs_additional_payment">
            <hr
              v-if="voucherPaymentsAvailable || walletPaymentsAvailable"
              class="list__divider my-3"
            />

            <template
              v-if="walletContribution == 0 && voucher_contributions == 0"
            >
              <p class="payment-processor__sub-heading">
                {{ $t("paymentProcessor.pay.withoutWallet") }}
              </p>
            </template>
            <template v-else>
              <div class="flexbox justify-space-between mb-2">
                <p class="payment-processor__heading">
                  {{ $t("paymentProcessor.pay.splitPayment.title") }}
                </p>
                <p class="payment-processor__heading">
                  {{ additional_payment_amount | money }}
                </p>
              </div>

              <p class="payment-processor__sub-heading">
                {{ $t("paymentProcessor.pay.splitPayment.description") }}
              </p>
            </template>

            <!-- Payment options (Card or COD) -->
            <n-list class="mb-4">
              <n-list-item v-for="type in paymentTypes" :key="type">
                <n-list-tile selectable>
                  <n-list-tile-content>
                    <n-radio
                      v-model="selectedPaymentType"
                      :radio-value="type"
                      :label="
                        type == CREDIT_CARD
                          ? $t(
                              `paymentProcessor.paymentTypes.CREDIT_CARD.title`
                            )
                          : $t(
                              `paymentProcessor.paymentTypes.${type}.title.${orderTypeKey}`
                            )
                      "
                      name="payment-type"
                      :required="needs_additional_payment"
                      collapse-empty-content
                    />
                  </n-list-tile-content>
                </n-list-tile>
                <n-list-divider />
              </n-list-item>
            </n-list>

            <!-- Credit card payments -->
            <section
              v-if="
                onlinePaymentsAvailable && selectedPaymentType == CREDIT_CARD
              "
            >
              <!-- Saved Cards Selection -->
              <template v-if="has_saved_cards">
                <p class="payment-processor__sub-heading">
                  {{
                    $t("paymentProcessor.paymentTypes.CREDIT_CARD.saved.title")
                  }}
                </p>

                <section>
                  <n-credit-card-list
                    v-model="selectedCard"
                    :cards="cards"
                    selected-classes="selected-card-list__item"
                    :removable="false"
                  >
                    <n-list-tile
                      v-if="selectedCard && saved_card_requires_cvv"
                      slot="selected-card"
                      :interactive="false"
                    >
                      <n-input
                        v-model="selectedCard.cvv"
                        type="text"
                        inputmode="decimal"
                        pattern="[0-9]{3,4}"
                        name="cvv"
                        class="flex-grow"
                        :placeholder="
                          $t(
                            'paymentProcessor.paymentTypes.CREDIT_CARD.saved.requiresCvv.label'
                          )
                        "
                        required
                      >
                        <span slot="help">{{
                          $t(
                            "paymentProcessor.paymentTypes.CREDIT_CARD.saved.requiresCvv.help"
                          )
                        }}</span>
                      </n-input>
                    </n-list-tile>

                    <!-- Add a new card list item -->
                    <n-list-item>
                      <n-list-tile selectable>
                        <n-list-tile-content>
                          <n-radio
                            v-model="selectedCard"
                            :radio-value="newCreditCard"
                            :label="
                              $t(
                                'paymentProcessor.paymentTypes.CREDIT_CARD.saved.switch'
                              )
                            "
                            name="selectedCreditCard"
                            required
                            collapse-empty-content
                          />
                        </n-list-tile-content>
                      </n-list-tile>
                      <n-list-divider />
                    </n-list-item>
                  </n-credit-card-list>
                </section>
              </template>
            </section>

            <!-- Cash payments -->
            <section
              v-if="cashPaymentsAvailable && selectedPaymentType == CASH"
            >
              <section>
                <section
                  v-if="
                    paymentOptions.unpaidOrderPaymentIntents &&
                    paymentOptions.unpaidOrderPaymentIntents.length
                  "
                  class="form-group"
                >
                  <p class="payment-processor__sub-heading">
                    {{
                      $t(
                        "paymentProcessor.paymentTypes.CASH.description.hasUnpaidOrderIntents"
                      )
                    }}
                  </p>

                  <n-list class="mb-4">
                    <n-list-item
                      v-for="option in paymentOptions.unpaidOrderPaymentIntents"
                      :key="option.id"
                    >
                      <n-list-tile selectable>
                        <n-list-tile-content>
                          <n-radio
                            v-model="selectedUnpaidOrderPaymentIntent"
                            :radio-value="option"
                            :label="option.title"
                            name="paymentInstruction"
                            required
                            collapse-empty-content
                          />
                        </n-list-tile-content>
                      </n-list-tile>
                      <n-list-divider />
                    </n-list-item>
                  </n-list>
                </section>
              </section>
            </section>
          </section>
        </section>
        <!-- Final Step (ie. the "add new credit card" form) -->
        <section v-else key="step-2">
          <p class="payment-processor__heading">
            {{ $t("paymentProcessor.paymentTypes.CREDIT_CARD.new.title") }}
          </p>
          <section>
            <n-new-credit-card v-model="newCreditCard">
              <n-checkbox
                v-model="storeCard"
                name="store_card"
                :label="
                  $t(
                    'paymentProcessor.paymentTypes.CREDIT_CARD.new.storeCardDetails'
                  )
                "
              ></n-checkbox>
            </n-new-credit-card>
          </section>
          <div class="flexbox justify-end">
            <n-button small flat @click.native="isFinalStep = false">
              {{ $t("paymentProcessor.paymentTypes.CREDIT_CARD.new.cancel") }}
            </n-button>
          </div>
        </section>
      </transition>

      <!-- A (hidden) submit button is required or else the form will not submit when the user presses enter -->
      <n-button class="hidden" type="submit">Pay</n-button>
    </n-form>
    <!-- end of payment options -->

    <!-- Payment Processing Indicator -->
    <section
      v-if="checkoutInProgress"
      class="flexbox fill-height align-center justify-center text-xs-center"
    >
      <!-- Chicken loader -->
      <div v-if="!userClickRequiredToStartWebflow">
        <section class="chicken-loader">
          <img class="chicken" src="~nandos-core-ui/src/assets/img/barci.svg" />
          <div class="heart-cover"></div>
          <img class="heart pulse" src="@/assets/img/chicken-heart.svg" />
        </section>
        <h3 v-if="web_flow_credit_card_capture">
          {{ $t("paymentProcessor.loading") }}
        </h3>
        <h3 v-else>{{ $t("paymentProcessor.processing") }}</h3>
      </div>
      <!-- Click to start payment in new window -->
      <div v-else>
        <p>{{ $t("paymentProcessor.payInNewWindow.title") }}</p>
        <n-button primary with-triangle @click.native="_startWebFlow"
          >{{ $t("paymentProcessor.payInNewWindow.cta") }}
        </n-button>
      </div>
    </section>

    <!-- Web Flow Iframe (used to display 3D secure flows etc)  -->
    <template v-if="renderIframeAndForm">
      <section
        class="payment-iframe-wrapper ios-safari-rendering-fix"
        :class="{ hidden: !show_web_flow_iframe }"
      >
        <iframe
          ref="webFlowIframe"
          name="web-flow-iframe"
          scrolling="yes"
          class="ios-safari-rendering-fix"
        ></iframe>
      </section>
      <!-- Hidden Form (Used To POST Data To Web Flow Iframe) -->
      <form
        v-if="transaction && transaction.webFlow"
        :action="transaction.webFlow.action"
        :method="transaction.webFlow.method"
        :target="webflowFormPostTargetName"
        ref="webFlowForm"
        class="hidden"
      >
        <input
          v-for="(value, name) in transaction.webFlow.parameters"
          type="hidden"
          :name="name"
          :value="value"
        />
      </form>
    </template>

    <!-- Payment Errors -->
    <section v-if="paymentError" v-scoll-into-view-on-appear>
      <n-alert error :value="paymentError != null">
        <div>
          <h4 class="mb-1">{{ $t("paymentProcessor.errors.title") }}</h4>
          <i18n tag="div" :path="getI18nErrorMessagePath()">
            <n-button
              slot="changeStore"
              text-link
              secondary
              jump
              :to="{ name: 'order-setup-start' }"
              @click.native="paymentError = null"
              >{{ $t("paymentProcessor.errors.changeStore") }}
            </n-button>
            <n-button slot="retry" @click.native="retry" text-link secondary
              >{{ $t("paymentProcessor.errors.retry") }}
            </n-button>
          </i18n>
          <span v-if="paymentError.showVoucherWarning" text-link secondary>{{
            $t("paymentProcessor.errors.voucherWarning")
          }}</span>
        </div>
      </n-alert>
    </section>
  </section>
</template>

<script src="payment-processor.js"></script>
