<template>
  <section v-if="ready">

    <div class="form-group">
      <n-input v-if="card_requires_name" v-model="new_credit_card.cardHolderName" type="text" maxlength="30" name="ccname" :label="$t('newCreditCard.form.name.label')" autocomplete="cc-name" required />
      <n-input v-model="new_credit_card.cardNumber" type="text" inputmode="decimal" credit-card name="cardnumber" :label="$t('newCreditCard.form.number.label')" autocomplete="cc-number" required :error-message="{patternMismatch: $t('newCreditCard.form.number.errors.patternMismatch') }">
        <img slot="append" v-if="accepted_cards.includes(new_credit_card.type)" :src="`${BASE_URL}img/credit-card/${new_credit_card.type}.svg`" class="credit-card-issuer">
      </n-input>

      <n-layout row wrap>
        <n-flex xs12 md8 class="form-group">
          <div class="form-group form--inline align-start ">
            <n-select v-model="new_credit_card.expiryMonth" class="flex-grow" :label="$t('newCreditCard.form.expirationMonth.label')" name="ccmonth" autocomplete="cc-exp-month" required>
              <option disabled :value="undefined">{{ $t('newCreditCard.form.expirationMonth.placeholder') }}</option>
              <option v-for="month in months" :value="month" :key="`month-${month}`">{{month}}</option>
            </n-select>

            <n-select v-model="new_credit_card.expiryYear" class="flex-grow" :label="$t('newCreditCard.form.expirationYear.label')" name="ccyear" autocomplete="cc-exp-year" required>
              <option disabled :value="undefined">{{ $t('newCreditCard.form.expirationYear.placeholder') }}</option>
              <option v-for="year in years" :value="year" :key="`year-${year}`">{{year}}</option>
            </n-select>
          </div>
        </n-flex>
        <n-flex xs12 md4 class="form-group">
          <n-input v-model="new_credit_card.cvv" type="text" inputmode="decimal" pattern="[0-9]{3,4}" name="cvv" :label="$t('newCreditCard.form.cvv.label')" required :error-message="{patternMismatch: $t('newCreditCard.form.cvv.errors.patternMismatch') }"></n-input>
        </n-flex>
      </n-layout>
    </div>

    <!-- Allow additional form fields to be placed here -->
    <slot></slot>

    <!-- Info about accepted cards and security notice -->
    <section>
      <p>{{ $t('newCreditCard.acceptedCards') }}</p>
      <div class="mb-3">
        <img v-for="cardType in accepted_cards" :src="`${BASE_URL}img/credit-card/${cardType}.svg`" class="credit-card-issuer mx-1">
      </div>
      <div class="flexbox align-center justify-center">
        <img src="@/assets/img/payment-secure-lock.svg" class="payment-secure-lock"> {{ $t('newCreditCard.securityLabel') }}
      </div>            
    </section>
  </section>
</template>

<script src="./new-credit-card.js"></script>