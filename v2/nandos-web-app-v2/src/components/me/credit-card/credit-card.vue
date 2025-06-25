<template>
  <CreditCardSkeleton class="relative isolate">
    <!-- Card Delete Btn -->
    <template #default>
      <NButton
        variant="unstyled"
        class="
          absolute z-1 top-0 right-0 transform translate-x-1/4 -translate-y-1/3 p-3 
          transform transition-transform duration-500
          hover:scale-[1.2] hover:duration-200
          active:scale-100 active:duration-100
          motion-reduce:transition-none motion-reduce:hover:transform-none
        "
        @click="$emit('deleteCard', card.id)"
      >
        <NIcon 
          icon="delete" 
          size="lg" 
          class="text-nandos-warm-red"
        />
      </NButton>
    </template>

    <!-- Card Details -->
    <template #card-number>{{ card.cardNumber }}</template>

    <template #card-expiry-title>
      <template v-if="!card.cardExpired">{{ $t('creditCard.valid') }}</template>
      <template v-else-if="card.tokenExpired">
        <div class="text-nandos-warm-red-200">
          {{ $t('creditCard.tokenExpired') }}
        </div>
      </template>
      <template v-else-if="card.cardExpired">
        <div class="text-nandos-warm-red-200">
          {{ $t('creditCard.expired') }}
        </div>
      </template>
    </template>

    <template #card-expiry>{{ card.expiryMonth }} / {{  card.expiryYear }}</template>
    
    <template #card-img>
      <img
        :src="`${BASE_URL}svg/credit-cards/${card.type}.svg`" 
        :alt="`${card.type} - credit card`"
      />
    </template>
  </CreditCardSkeleton>
</template>

<script setup lang="ts">
import { NButton, NIcon } from 'nandos-core-ui-v2';
import CreditCardSkeleton from './credit-card-skeleton.vue';
import type CustomerCreditCard from 'nandos-middleware-api/src/model/customer-credit-card';

defineEmits<{
  deleteCard: [id: string]
}>();

defineProps<{
  card: CustomerCreditCard
}>();

const BASE_URL = import.meta.env.BASE_URL;
</script>