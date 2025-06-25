<template>
  <n-page pattern-bg :padding="false" class="contact">

    <portal to="app-header-portal">
      <n-app-header :title="$t('contact.titleShort')"></n-app-header>
    </portal>

    <n-page-hero>
      <img slot="background" class="new-layer img--center img--fill" src="@/assets/img/help-header.svg" >
      <h1>{{ $t('contact.titleShort') }}</h1>
    </n-page-hero>

    <n-container v-if="ready" narrow class="text-xs-center">
      <section class="mb-6">
        <template v-if="user.anonymous">
          <h2 class="mb-2">{{ $t('contact.order.loggedOut.title') }}</h2>
          <i18n tag="p" path="contact.order.loggedOut.description">
            <n-button slot="loginInCTA" text-link primary to="/me/history">{{ $t('contact.order.loggedOut.loginInCTA') }}</n-button>
          </i18n>
        </template>
        <template v-else>
          <h2 class="mb-2">{{ $t('contact.order.loggedIn.title') }}</h2>
          <p class="mb-2">{{ $t('contact.order.loggedIn.description') }}</p>
          <n-order-history-listing inline :max-items="3" order-link-suffix="/help" class="order-history-listing" />
          <i18n tag="p" path="contact.order.loggedIn.goToOrderHistory">
            <n-button slot="link" text-link primary to="/me/history">{{ $t('contact.order.loggedIn.orderHistoryLink') }}</n-button>
          </i18n>
        </template>
      </section>

      <section v-if="CALL_CENTER_PHONE" class="mb-6">
        <h2 class="mb-2">{{ $t('contact.phone.title') }}</h2>
        <p>{{ $t('contact.phone.description') }}</p>
        <n-button primary external :to="`tel:${CALL_CENTER_PHONE}`">{{CALL_CENTER_PHONE}}</n-button>
      </section>
      <section v-if="CUSTOMER_CARE_EMAIL" class="mb-6">
        <h2 class="mb-2">{{ $t('contact.email.title') }}</h2>
        <p>{{ $t('contact.email.description') }}</p>
        <n-button primary external :to="`mailto:${CUSTOMER_CARE_EMAIL}`">{{ $t('contact.email.buttonLabel') }}</n-button>
      </section>

      <section v-if="show_form">
        <h2 class="mb-2">{{ $t('contact.form.title') }}</h2>
        <p class="mb-5">{{ $t('contact.form.description') }}</p>
        <n-form @submit="onSubmit">
          <div class="form-group text-xs-left">
            <n-input v-model="form_data.name" name="fname" :label="$t('contact.form.name')" autocomplete="given-name" required></n-input>
            <n-input v-model="form_data.lastName" name="lname" :label="$t('contact.form.lastName')" autocomplete="family-name" required></n-input>
            <n-phone-input v-model="form_data.mobilePhoneNumber" name="phone" :label="$t('contact.form.mobilePhoneNumber')" required />
            <n-input v-model="form_data.email" type="email" inputmode="email" name="email" :label="$t('contact.form.email')" autocomplete="email" required></n-input>
            <n-text-area v-model="form_data.message" rows="5" name="message" :label="$t('contact.form.message')" maxlength="2000" required></n-text-area>
          </div>
          <n-button primary :loading="loading" type="submit" v-track="{'contact us form': 'submit'}">{{ $t('contact.form.confirm') }}</n-button>
        </n-form>
      </section>
      <section v-else>
        <h2 class="narrow tilted">{{ $t('contact.formWasSubmitted') }}</h2>
      </section>

    </n-container>


  </n-page>
</template>

<script src="contact.js"></script>