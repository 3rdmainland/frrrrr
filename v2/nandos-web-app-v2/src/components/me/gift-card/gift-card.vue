<template>
    <GiftCardSkeleton>
        <template #image>
            <img :src="card.renderedImageUrl" alt="gift card cover image" class="rounded-md">
        </template>

        <template #balance-title>
            {{ $t('profile.wallet.cardListing.card.title') }}
        </template>
        
        <template #balance-value>
            {{ formatCurrency(card.wiBalance, defaultLocale) }}
        </template>
        
        <template #issued-amount-title>
            {{ $t('profile.wallet.cardListing.card.value') }}
        </template>
        
        <template #issued-amount-value>
            {{ formatCurrency(card.issuedAmount, defaultLocale) }}
        </template>
        
        <template #expires-title>
            {{ $t('profile.wallet.cardListing.card.expiration') }}
        </template>
        
        <template #expires-value>
            {{ $d(card.expiryDate, 'long', defaultLocale) }}
        </template>
        
        <template #wiCode-title>
            {{ $t('profile.wallet.cardListing.card.code') }}
        </template>

        <template #wiCode-value>
            {{ card.wiCode }}
        </template>
    </GiftCardSkeleton>
</template>

<script setup lang="ts">
import GiftCardSkeleton from './gift-card-skeleton.vue';
import { formatCurrency } from 'nandos-i18n-v2';
import type { CustomerGiftCard } from 'nandos-middleware-api/src/domain/customer';

defineProps<{
    card: CustomerGiftCard
}>();

const defaultLocale = import.meta.env.VITE_DEFAULT_LOCALE;
</script>
