<template>
  <n-page :padding="false">

    <portal to="app-header-portal" >
      <n-app-header :title="$t('profile.history.detail.giftCard.titleShort')" back-title="Orders"></n-app-header>
    </portal>

    <n-page-hero :image-collection="headerImageCollection">
      <template v-if="ready">
        <h2 class="mb-1">{{ $tc('order.giftCard.title', order.totalItems) }}</h2>
        <p>{{order.orderPlacedTime | date('full')}}</p>
      </template>
    </n-page-hero>

    <n-container v-if="ready">
      <n-list class="mb-4">
        <n-list-item v-for="card in order.items" :key="card.id" class="gift-card-list-item">
          <n-list-tile :interactive="false">
            <n-list-tile-action class="gift-card-list-item__quantity">
              <n-chip round class="orange white--text pa-2">
                {{card.quantity}}x
              </n-chip>
            </n-list-tile-action>
            <n-list-tile-action>
              <span>
                <img class="gift-card-list-item__preview-img" :src="card.renderedImageUrl">                
              </span>
            </n-list-tile-action>
            <n-list-tile-content>
              <n-list-tile-title>{{ $tc('profile.history.detail.giftCard.card.title', card.quantity, {name: card.cards[0].toName, price: $options.filters.money(card.price)}) }}</n-list-tile-title>
              <n-list-tile-sub-title>{{ $tc('profile.history.detail.giftCard.card.subtitle', card.quantity, {phone:card.cards[0].toMobilePhoneNumber}) }}</n-list-tile-sub-title>
            </n-list-tile-content>
            <n-list-tile-action class="money">
              {{card.price * card.quantity | money}}
            </n-list-tile-action>
          </n-list-tile>
          <n-list-divider/>
        </n-list-item>

        <n-list-item>
          <n-list-tile :interactive="false">
            <n-list-tile-content>
              <n-list-tile-title>{{ $t('profile.history.detail.giftCard.orderTotal') }}</n-list-tile-title>
            </n-list-tile-content>
            <n-list-tile-action class="money money--large">{{order.totalPrice | money}}</n-list-tile-action>
          </n-list-tile>
        </n-list-item>
      </n-list>

      <div class="flexbox row wrap justify-space-between">        
        <n-button append to="help" :style="$breakpoints.xs ? 'width: 100%' : null" flat small class="my-0" v-track="{'gift-card-detail': 'get-help'}">
          <span class="mr-1">{{ $t('profile.history.detail.giftCard.help') }}</span>
          <span class="primary--text underline">{{ $t('profile.history.detail.giftCard.helpCta') }}</span>
        </n-button>

        <n-button @click.native.stop="show_invoice_form = true" secondary with-triangle :style="$breakpoints.xs ? 'width: 100%' : null" v-track="{'gift-card-detail': 'get invoice'}">
          {{ $t('profile.history.detail.giftCard.requestInvoice') }}
        </n-button>
      </div>

    </n-container>

    <n-dialog slot="floating-content" v-model="show_invoice_form" fullscreen overlap-app-header>
      <n-page pattern-bg overlap-app-header>
        <n-container narrow class="mt-6">
          <h2 class="text-xs-center">{{ $t('profile.history.invoice.title') }}</h2>
          <n-form v-if="show_invoice_form" @submit="getInvoice">
            <n-input v-model="form_data.email" type="email" inputmode="email" name="email" :label="$t('profile.history.invoice.form.email')" autocomplete="email" required></n-input>
            <n-button type="submit" primary :loading="send_invoice_loading" style="box-shadow: none;">{{ $t('profile.history.invoice.form.submit') }}</n-button>
          </n-form>
        </n-container>
      </n-page>
    </n-dialog>

  </n-page>
</template>

<script src="gift-card-order-detail.js"></script>