<template>
  <section>

    <n-form @submit="$emit('complete')">

      <!-- Your / Sender's Name -->
      <n-input v-model="card.fromName" name="fname" :label="$t('giftCard.creation.steps.details.form.yourName.label')" autocomplete="given-name" required>
        <span slot="help">{{ $t('giftCard.creation.steps.details.form.yourName.help') }}</span>
      </n-input>

      <!-- Schedule delivery for a future date -->
      <n-checkbox v-model="showDateScheduler" name="Future Date" :label="$t('giftCard.creation.steps.details.form.scheduleSend.label')" />
      <n-select v-if="showDateScheduler" v-model="selectedDate" :label="$t('giftCard.creation.steps.details.form.scheduleSend.placeholder')" required>
        <option disabled :value="null">{{ $t('giftCard.creation.steps.details.form.scheduleSend.placeholder') }}</option>
        <option v-for="date in avilable_send_dates" :value="date.getTime()">{{date | date}}</option>
      </n-select>

      <div class="form-group">
        <n-button type="submit" primary block with-triangle :loading="loading" v-track="{'gift-card-creator': `card details: ${isNewCard ? 'add to basket' : 'update'}`}">{{isNewCard ? $t('giftCard.creation.steps.details.form.submit.new') : $t('giftCard.creation.steps.details.form.submit.update')}}</n-button>
      </div>
    </n-form>

  </section>
</template>

<script src="./card-delivery-details.js"></script>