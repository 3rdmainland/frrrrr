<template>
  <section>

    <!-- Card Amount -->
    <div class="form-group">
      <n-button v-for="price in prices" @click.native="selected_preset = price" small round :outline="selected_preset != price" :key="price" v-track="{'gift-card-creator': 'amount: preset selected'}">
        {{ price| money('moneyRounded') }}
      </n-button>
    </div>

    <div class="text-xs-center my-3 grey--text text--darken-2">{{ $t('common.orSeparator') }}</div>

    <!-- Custom Card Amount -->
    <n-form @submit="$emit('next-step')">
      <n-input
       v-model="input_price"
       type="number"
       inputmode="decimal"
       :label="$t('giftCard.creation.steps.amount.form.amount.label')"
       :min="minPrice / 100"
       :max="maxPrice / 100"
       :required="!card.price"
       autocomplete="off"
       :error-message="{
        stepMismatch: $t('giftCard.creation.steps.amount.form.amount.errors.stepMismatch'),
        rangeUnderflow: $t('giftCard.creation.steps.amount.form.amount.errors.minAmount', {amount: $options.filters.money(minPrice, 'moneyRounded')}),
        rangeOverflow: $t('giftCard.creation.steps.amount.form.amount.errors.maxAmount', {amount: $options.filters.money(maxPrice, 'moneyRounded')})
       }"
      />

      <div class="form-group">
        <n-button type="submit" primary block with-triangle :disabled="!selectionIsValid" v-track="{'gift-card-creator': 'amount: next'}">{{ $t('giftCard.creation.steps.amount.form.confirm') }}</n-button>
      </div>

    </n-form>
  </section>
</template>

<script src="card-amount.js"></script>