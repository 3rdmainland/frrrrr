<template>
  <n-page>

    <portal to="app-header-portal">
      <n-app-header :title="$t('profile.creditCards.create.titleShort')" back-title="Cards"></n-app-header>
    </portal>

    <n-container>    
      <n-form @submit="onSubmit" ref="new_card_form">
        <n-new-credit-card v-model="new_credit_card"></n-new-credit-card>
        <div class="form-group flexbox">
          <n-spacer />
          <n-button primary with-triangle :loading="loading" type="submit">{{ $t('profile.creditCards.create.form.submit') }}</n-button>
        </div>
      </n-form>
    </n-container>
  </n-page>
</template>

<script src="./add-credit-card.js"></script>