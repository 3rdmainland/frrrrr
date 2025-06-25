 <template>
  <div class="text-nandos-fresh-white flex flex-col items-center mt-14">
    <Transition mode="out-in" :duration="500">
      <h3 class="text-xl text-center" v-if="cards.length === 0 && !loading"> {{ $t('profile.creditCards.listing.empty') }} </h3>

      <!-- Credit card list -->
      <div class="w-full md:w-4/5 lg:w-3/5 flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4" v-else>
        <template v-if="loading">
          <CreditCardSkeleton v-for="x in 6" :key="x + 'skeleton'" :loading="true"/>
        </template>
        <template v-else>
          <CreditCard
            v-for="card in (cards as CustomerCreditCard[])"
            :card="card"
            :key="card.id"
            @delete-card="confirmDeleteCard"
          />
        </template>
      </div>
    </Transition>

    <!-- Delete Card Dialog -->
    <NDialog v-model="modalVisible" variant="confirm" @disagree="modalVisible = false" @agree="deleteCard" :loading="deletingCard">
      <template #header>{{ $t('profile.creditCards.listing.confirmDelete.title') }}</template>
      <template #description>{{ $t('profile.creditCards.listing.confirmDelete.subtitle') }}</template>
      <template #disagree-btn-content>{{ $t('profile.creditCards.listing.confirmDelete.cancel') }}</template>
      <template #agree-btn-content>{{ $t('profile.creditCards.listing.confirmDelete.confirm') }}</template>
    </NDialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { NDialog } from 'nandos-core-ui-v2';
import { useCustomer } from 'nandos-middleware-api/src/domain/customer'
import { useHideScrollWatcher } from '@/composables/useHideScroll';
import CreditCard from '@/components/me/credit-card/credit-card.vue';
import CreditCardSkeleton from '@/components/me/credit-card/credit-card-skeleton.vue';
import type CustomerCreditCard from 'nandos-middleware-api/src/model/customer-credit-card';

// Fetch Credit Cards
const { getCreditCards, deleteCreditCard } = useCustomer();
const loading = ref(true);
const cards = ref<CustomerCreditCard[]>([]);

async function fetchCreditCards() {
  loading.value = true;
  cards.value = await getCreditCards();
  loading.value = false;
}
fetchCreditCards(); // Fetch data when the component is created

// Delete Credit Cards
// Modal
const modalVisible = ref(false);
useHideScrollWatcher(modalVisible);
// Card deletion
const deletingCard = ref(false);
const cardIdToDelete = ref<string>('');

function confirmDeleteCard(id: string) {
  modalVisible.value = true;
  cardIdToDelete.value = id;
}

async function deleteCard() {
  deletingCard.value = true;
  await deleteCreditCard(cardIdToDelete.value);
  deletingCard.value = false;
  modalVisible.value = false;
  fetchCreditCards();
}
</script>
