<template>
  <section>

    <n-form @submit="selectionIsValid ? $emit('next-step') : null">

      <!-- Card Message -->
      <n-select v-model="selected_preset" :label="$t('giftCard.creation.steps.message.form.messages.placeholder')">
        <option disabled :value="null">{{ $t('giftCard.creation.steps.message.form.messages.placeholder') }}</option>
        <option v-for="message in presets.messages" :value="message" :key="message">{{message}}</option>
      </n-select>
        
      <div class="text-xs-center my-3 grey--text text--darken-2">{{ $t('common.orSeparator') }}</div>

      <!-- Custom Message -->
      <n-input v-model="input_message" :label="$t('giftCard.creation.steps.message.form.customMessage.label')" maxlength="70" :required="card.message == null || card.message == ''" autocomplete="off"></n-input>
      <n-alert :value="messageHasBannedWord" error>
        {{ $t('giftCard.creation.steps.message.form.errors.bannedWord') }}
      </n-alert>
      
      <div class="form-group">
        <n-button type="submit" primary block with-triangle :disabled="!selectionIsValid" v-track="{'gift-card-creator': 'message: next'}">{{ $t('giftCard.creation.steps.message.form.confirm') }}</n-button>
      </div>
    </n-form>

  </section>
</template>

<script src="./card-message.js"></script>