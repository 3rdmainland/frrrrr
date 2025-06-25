<template>
  <section>

    <n-form v-if="showRecipientForm" @submit="saveRecipient">
      <n-input v-model="formModel.toName" name="fname" maxlength="20" :label="$t('giftCard.creation.steps.recipients.form.recipientName.label')" autocomplete="given-name" required />

      <!-- Recipient's Mobile -->
      <n-phone-input v-model="formModel.toMobilePhoneNumber" name="recipient-phone" :label="$t('giftCard.creation.steps.recipients.form.recipientMobileNumber.label')" autocomplete="recipient-tel" required>
        <span slot="help">{{ $t('giftCard.creation.steps.recipients.form.recipientMobileNumber.help') }}</span>
      </n-phone-input>

      <!-- Recipient's Email address -->
      <n-input v-model="formModel.toEmail" type="email" inputmode="email" name="recipient-email" :label="$t('giftCard.creation.steps.recipients.form.recipientEmail.label')" autocomplete="recipient-email" optional>
        <span slot="help">{{ $t('giftCard.creation.steps.recipients.form.recipientEmail.help') }}</span>
      </n-input>


      <div class="form-group flexbox" :class="{'row wrap': $breakpoints.xs}">
        <n-button v-if="card.cards.length > 0" @click.native="showRecipientForm = false" block flat class="mr-1">{{ $t('giftCard.creation.steps.recipients.form.cancel') }}</n-button>
        <n-button type="submit" primary block with-triangle v-track="{'gift-card-creator': 'recipients: add'}">{{ $t(`giftCard.creation.steps.recipients.form.confirm.${isEditingExistingRecipient ? 'update' : 'add'}`) }}</n-button>
      </div>
    </n-form>

    <!-- Recipients -->
    <section v-else>
      <n-list class="mb-4">
        <n-list-item v-for="giftCard in card.cards" :key="giftCard.id || giftCard.cid">
            <n-list-tile @click.native="editRecipient(giftCard)">
              <n-list-tile-content>
                <n-list-tile-title>{{giftCard.toName}}</n-list-tile-title>
              </n-list-tile-content>
              <n-list-tile-action no-stack>
                <n-button icon flat small>
                  <n-icon>edit</n-icon>
                </n-button>
                <n-button icon flat small @click.native.stop="removeRecipient(giftCard)">
                  <n-icon>delete</n-icon>
                </n-button>
              </n-list-tile-action>
            </n-list-tile>
          <n-list-divider/>
        </n-list-item>
      <n-list-divider class="mb-3"/>
      </n-list>


      <n-button text-link @click.native="addRecipient" class="mb-5">
        <n-icon left>add</n-icon>
        {{ $t('giftCard.creation.steps.recipients.form.addAnotherRecipient') }}
      </n-button>

      <n-button @click.native="$emit('next-step')" primary block with-triangle v-track="{'gift-card-creator': 'recipients: next'}">{{ $t(`giftCard.creation.steps.recipients.form.confirm.next`) }}</n-button>
    </section>

  </section>
</template>

<script src="./card-recipients.js"></script>