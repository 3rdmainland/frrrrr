<template>
  <n-list>
    <n-list-item v-for="card in cards" :key="card.id" :class="selected_card == card ? selectedClasses : null">
      <n-list-tile selectable :interactive="selectable && !card.expired" class="align-center">
        <n-list-tile-content>
          <n-radio v-model="selected_card" :label="card.cardNumber" :radio-value="card" :required="selectable && !card.expired" :disabled="card.expired" name="selectedCreditCard" :error-message="{valueMissing: $t('creditCard.selectionRequired')}" collapse-empty-content>
            <span slot="label" slot-scope="{label}" >
              {{label}}
              <div class="grey--text">
                <template v-if="!card.expired">{{card.expiryMonth}} / {{card.expiryYear}}</template>
                <template v-else-if="card.cardExpired">{{ $t('creditCard.expired') }}</template>
                <template v-else-if="card.tokenExpired">{{ $t('creditCard.tokenExpired') }}</template>
              </div>
            </span>
          </n-radio>
        </n-list-tile-content>

        <n-list-tile-action :style="{'opacity': card.expired ? 0.5 : 1}">
          <img :src="`${BASE_URL}img/credit-card/${card.type || 'generic'}.svg`" class="credit-card-issuer">
        </n-list-tile-action>
        <n-list-tile-action v-if="removable">
          <n-button icon flat @click.native.stop="$emit('delete', card)">
            <n-icon>delete</n-icon>
          </n-button>
        </n-list-tile-action>
      </n-list-tile>
      <slot v-if="selected_card == card" name="selected-card"></slot>
      <n-list-divider/>
    </n-list-item>
    <slot></slot>
  </n-list>
</template>

<script src="credit-card-list.js"></script>
<style lang="scss">
  .credit-card-issuer {
    width: 3em;
    height: 1.75em;
    padding-right: 0.6em;
  }
</style>