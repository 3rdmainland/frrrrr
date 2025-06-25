<template>
  <n-page pattern-bg class="gift-card-creator">

    <portal to="app-header-portal">
      <n-app-header :title="$t('giftCard.creation.titleShort')" />
    </portal>

    <n-container v-if="ready">

      <div class="text-xs-center my-4">
        <h2 class="tilted mb-2" v-html="stepTitle"></h2>
      </div>

      <n-layout row wrap class="text-xs-left">

        <n-flex xs12 md6 class="mb-4"> <!-- order-md1 -->
          <gift-card-renderer ref="giftCardRenderer" :card="card" :text-color="cardPreviewTextColor" />
          <n-stepper v-model="step" :steps="steps.length" :disabled-steps="disabledSteps" class="my-3" />
        </n-flex>

        <n-flex xs12 md6 class="mb-4" style="overflow-x: hidden; overflow-y: auto;">

            <transition :name="pageTransition" mode="out-in">
              <router-view
               :key="$route.path"
               :card="card"
               :presets="presets"
               :is-new-card="isNewCard"
               :min-price="basket.minimumItemValue"
               :max-price="basket.maximumItemValue"
               :loading="loading"
               @next-step="step++"
               @complete="onCardCreationComplete" />
            </transition>

            <n-auth-server-error-handler v-if="error" v-scoll-into-view-on-appear :error="error" context="gift-card" />
        </n-flex>
      </n-layout>
    </n-container>

    <n-confirm-dialog v-if="ready" slot="floating-content" v-model="showConfirmationDialog" :title="$t('giftCard.creation.confirmation.title')" :cancel="$t('giftCard.creation.confirmation.cancel')" :confirm="$t('giftCard.creation.confirmation.confirm')" @confirm="saveCard" @cancel="step--" :confirm-is-destructive="false">
      <section class="scrollable scrollable-y" style="max-height: 34vh;">
        <p v-for="card in card.cards" :key="card.id || card.cid">
          <strong>{{card.toName}}</strong><br>
          Mobile: {{card.toMobilePhoneNumber}}<br>
          <span v-if="card.toEmail">Email: </span>{{card.toEmail}}
        </p>
      </section>      
    </n-confirm-dialog>

  </n-page>
</template>

<script src="gift-card-creator.js"></script>