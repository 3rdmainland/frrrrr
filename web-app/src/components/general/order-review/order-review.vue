<template>

  <n-dialog v-model="isActive" :persistent="canIgnore" class="order-review-dialog" >
    <div v-if="order" class="pa-5 block-skewed blue lighten-5 pattern-bg pattern-bg--default">

      <section class="scrollable scrollable-y" style="max-height: 80vh;">
        <div class="text-xs-center mb-4">
          <h3 class="mb-1">
            <slot name="title">{{ $t('orderReview.title') }}</slot>
          </h3>
          <p>
            <slot name="subtitle">{{ $t(`orderReview.subtitle.${orderTypeKey}`, {store: order.storeName}) }}</slot>
          </p>
        </div>

        <div class="text-xs-center">
          <n-form @submit="rateOrder">

            <!-- Service rating -->
            <div class="form-group">
              <label>{{ $t('orderReview.form.service.label') }}</label>
              <div class="rating-options">
                <n-icon v-for="idx in 5" @click="reviewDeliveryScore = idx" class="rating-option" :class="{'rating-option--selected': reviewDeliveryScore >= idx}" :key="`delivery-chilli-${idx}`">chilli</n-icon>
              </div>
            </div>

            <!-- Food rating -->
            <div class="form-group">
              <label>{{ $t('orderReview.form.food.label') }}</label>
              <div class="rating-options">
                <n-icon v-for="idx in 5" @click="reviewFoodScore = idx" class="rating-option" :class="{'rating-option--selected': reviewFoodScore >= idx}" :key="`food-chilli-${idx}`">chilli</n-icon>
              </div>
            </div>

            <!-- Additional comments -->
            <n-text-area v-model="reviewComment" maxlength="2000" :label="$t('orderReview.form.additionalComments.label')" class="text-xs-left" />

            <div class="flexbox">
              <n-button v-if="canIgnore" flat small @click.native="ignore">{{ $t('orderReview.form.cancel') }}</n-button>
              <n-spacer/>
              <n-button type="submit" small primary with-triangle :disabled="!canSubmit">{{ $t('orderReview.form.submit') }}</n-button>
            </div>
          </n-form>
        </div>


      </section>
    </div>
  </n-dialog>

    
</template>

<script src="./order-review.js"></script>

<style lang="scss">

.order-review-dialog {

  @for $i from 0 through 4 {
    .rating-options :nth-child(#{$i + 1}) {
      transition-delay: 0.075s * $i;
      animation-delay: 0.075s * $i;
    }
  }

  .rating-option {
    display: inline-flex;
    cursor: pointer;
    flex-wrap: wrap;
    font-size: 3em;
    padding-left: 0.1em;
    padding-right: 0.1em;
    text-align: center;
    justify-content: center;
    user-select: none;
    transition: all 0.5s;
    color: #bdbab0;
    animation: animation-deselected 0.35s ease-in;

    &--selected {
      color: #cc132b;
      animation: animation-selected 0.35s ease-out;
    }
  }

  @keyframes animation-deselected {
    50% {
      transform: scale(0.9);
    }
  }

  @keyframes animation-selected {
    50% {
      transform: scale(1.3);
    }
  }

  .rating-option .icon {
    margin-bottom: 0.25em;
    margin-left: -0.1em;
    transition: all 0.5s;
  }

  .rating-option--label {
    width: 100%;
  }
}
</style>