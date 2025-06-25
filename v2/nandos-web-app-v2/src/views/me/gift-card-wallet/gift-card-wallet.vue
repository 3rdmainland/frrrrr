<template>
  <div class="text-nandos-fresh-white flex flex-col gap-6 items-center space-y-4 mt-6">
    <header class="text-center space-y-2">
      <!-- Balance Title Text -->
      <p>
        <strong class="uppercase tracking-wide">{{ $t('profile.wallet.wallet.title') }}</strong>
      </p>
      <!-- Wallet Balance Value -->
      <h2 class="text-3xl min-h-14 md:text-5xl flex items-center justify-center">
        <TextLoader :loading="loadingWallet" :size="6"> {{ formatCurrency(wallet?.balance, defaultLocale) }}</TextLoader>
      </h2>
    </header>

    <section class="w-full md:w-4/5 flex flex-col lg:flex-row gap-8">
      <!-- QR Code Card -->
      <div
        class="
          bg-nandos-black-800 rounded-md basis-xs h-90 lg:order-2
          flex flex-col items-center gap-2 p-4 shrink-0
        "
      >
        <div 
          class="w-full flex-1 flex justify-center"
          :class="[loadingWallet && 'bg-[#111] rounded-sm motion-safe:animate-pulse']"
        >
          <img class="h-full rounded-xs" :src="wallet?.qrCodeUrl" :style="{imageRendering: 'pixelated'}"/>
        </div>
        <p>
          <strong>{{ $t('profile.wallet.wallet.code', {code: wallet?.token}) }}</strong>
        </p>
        <p class="text-sm text-center">{{ $t('profile.wallet.wallet.description') }}</p>
      </div>

      <!-- Gift cards list -->
      <div class="flex-1 space-y-4 shrink-1000">
        <!-- Header -->
        <div class="flex flex-col gap-4 xl:flex-row items-center lg:items-baseline justify-between">
          <h6 class="text-2xl font-semibold self-start w-[max-content]">{{ $t("profile.wallet.cardListing.title") }}</h6>

          <div class="flex flex-col gap-4 sm:flex-row items-center justify-between lg:justify-end lg:gap-6">            
            <NPagination v-model="filters.currentPage" :total-pages="filters.totalPages" :total-elements="filters.totalElements"/>

            <NToggle v-model="filters.status" :checked-value="GIFT_CARD_STATUS.REDEEMED" :un-checked-value="GIFT_CARD_STATUS.ACTIVE">
              <template #checked-label>{{ $t('profile.wallet.cardListing.filter.redeemed') }}</template>
              <template #unchecked-label>{{ $t('profile.wallet.cardListing.filter.active') }}</template>
            </NToggle>
          </div>
        </div>

        <!-- The Cards (Loading and actual) -->
        <ul class="space-y-4">
          <!-- Loading -->
          <template v-if="loadingGiftCards">
            <li v-for="x in 2" :key="`${x}-gift-card-loader`" class="p-4 md:-ml-4 bg-nandos-black rounded-md">
              <GiftCardSkeleton :loading="true"/>
            </li>
          </template>
          <!-- Actual -->
          <template v-else>
            <li v-if="cards.length === 0">
              {{ $t('profile.wallet.empty', {listingType: $t(`profile.wallet.cardListing.filter.${filters.status.toLowerCase()}`)}) }}
            </li>

            <li
              class="p-4 md:-ml-4 bg-nandos-black hover:bg-black/40 rounded-md" 
              v-for="(card, idx) of cards" 
              :key="card.wiId"
            >
              <button class="w-full cursor-pointer" @click="() => stageGiftCard(idx)">
                <GiftCard :card="card"></GiftCard>
              </button>
            </li>
          </template>
        </ul>
      </div>
    </section>

    <!-- Gift Card QR Code when clicked -->
    <NDialog v-model="modalVisible" :fullscreen="true" theme="black">
      <template #header>
        <div class="text-4xl md:text-5xl">{{ $t('profile.wallet.cardListing.card.qrCode.title') }}</div>
      </template>

      <template #content>
        <div class="flex flex-col gap-2 mt-4">
          <img
            class="rounded-sm"
            :src="`${API}/giftcard/qrcode/${authStore.user?.mobilePhoneNumber}/${cards[stageGiftCardIndex]?.wiId}`"
            :style="{imageRendering: 'pixelated'}"
          />
          <strong class="text-lg font-bold">{{ $t('profile.wallet.cardListing.card.qrCode.code', {code: cards[stageGiftCardIndex]?.wiId}) }}</strong>
          <p class="text-lg">{{ $t('profile.wallet.cardListing.card.qrCode.description') }}</p>
        </div>
      </template>
    </NDialog>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/useAuthStore';
import { formatCurrency } from 'nandos-i18n-v2';
import { GIFT_CARD_STATUS } from 'nandos-types';
import { reactive, ref, watch } from 'vue';
import { NToggle, NPagination, NDialog } from 'nandos-core-ui-v2';
import { CustomerGiftCard, CustomerWallet, useCustomer } from 'nandos-middleware-api/src/domain/customer';
import GiftCard from '@/components/me/gift-card/gift-card.vue';
import TextLoader from '@/components/ui/TextLoader.vue';
import GiftCardSkeleton from '@/components/me/gift-card/gift-card-skeleton.vue';

const API = import.meta.env.VITE_API;
const defaultLocale = import.meta.env.VITE_DEFAULT_LOCALE;

const authStore = useAuthStore();
const { getGiftCards, getWallet } = useCustomer();

// Gift Cards
// Filters
const filters = reactive({
  status: GIFT_CARD_STATUS.ACTIVE,
  totalPages: 0,
  currentPage: 0,
  pageSize: 10,
  totalElements: 0
});

watch([
    () => filters.status,
    () => filters.currentPage
  ], 
  fetchGiftCards
);

// Listing
const loadingGiftCards = ref(true);
const cards = ref<CustomerGiftCard[]>([]);

async function fetchGiftCards() {
  loadingGiftCards.value = true;
  const response = await getGiftCards({status: filters.status}, filters.currentPage, filters.pageSize);
  if (response) {
    cards.value = response.giftcards;
    filters.totalPages = response.totalPages;
    filters.totalElements = response.totalElements;
    filters.currentPage = response.pageNumber;
  }
  loadingGiftCards.value = false;
}
fetchGiftCards();

// Wallet
const loadingWallet = ref(true);
const wallet = ref<CustomerWallet | null>(null);

async function fetchWallet() {
  loadingWallet.value = true;
  wallet.value = await getWallet();
  loadingWallet.value = false;
}
fetchWallet();

// Gift Card Modal When gift card is selected to show QR code
const modalVisible = ref(false);
const stageGiftCardIndex = ref(0);

function stageGiftCard(index: number) {
  stageGiftCardIndex.value = index;
  modalVisible.value = true;
}
</script>
