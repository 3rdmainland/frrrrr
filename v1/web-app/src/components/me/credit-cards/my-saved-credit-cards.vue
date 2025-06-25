<template>
  <n-page class="my-saved-credit-cards">

    <portal to="app-header-portal">
      <n-app-header :title="$t('profile.creditCards.listing.titleShort')" back-title="Profile"></n-app-header>
    </portal>

    <n-container v-if="ready">    
      <h3 v-if="cards.length === 0" class="headline">{{ $t('profile.creditCards.listing.empty') }}</h3>

      <n-credit-card-list :cards="cards" :selectable="false" @delete="startCardDelete"/>

      <n-button v-if="can_create_card" to="/me/credit-cards/add" primary>{{ $t('profile.creditCards.listing.createNew') }}</n-button>

    </n-container>

    <n-dialog slot="floating-content" v-model="show_confirm_delete_dialog">
      <div class="pa-5 block-skewed white text-xs-center">
        <h2>{{ $t('profile.creditCards.listing.confirmDelete.title') }}</h2>
        <p>{{ $t('profile.creditCards.listing.confirmDelete.subtitle') }}</p>
        <n-button primary @click.native="abortCardDelete">{{ $t('profile.creditCards.listing.confirmDelete.cancel') }}</n-button>
        <n-button outline @click.native="deleteCard">{{ $t('profile.creditCards.listing.confirmDelete.confirm') }}</n-button>
      </div>
    </n-dialog>
  </n-page>
</template>

<script src="my-saved-credit-cards.js"></script>

<style lang="scss">
  .my-saved-credit-cards {
    // Hide radio from card listing, and make non-interactive
    .form-control__label { pointer-events: none; }
    .form-control__indicator { display: none !important; }
  }
</style>