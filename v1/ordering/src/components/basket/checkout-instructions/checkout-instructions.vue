<template>
  <n-page class="checkout-instructions" pattern-bg :padding="false" :docked-footer="$breakpoints.smDown" :show-footer="showFooter">

    <portal to="app-header-portal" >
      <n-app-header />
    </portal>

    <n-page-hero v-if="ready" :pull-content-above="ready && $breakpoints.smDown">
      <img slot="background" class="new-layer img--center img--fill" src="../../../assets/img/checkout-instructions-header.svg" >
      <h2>{{ $t('basket.checkoutInstructions.titleShort') }}</h2>  
    </n-page-hero>

    <n-container v-if="ready" :wide="$breakpoints.mdUp">
      <n-layout row wrap>
        <!-- Left column -->
        <n-flex xs12 md8>

          <!-- Instructions-->
          <n-tile v-for="instruction in instructions" :key="instruction.id" class="checkout-instructions__instruction mb-4">
            <n-tile-content @click.native="onInstructionClicked($event, instruction)" class="text-xs-left">
              <n-checkbox v-model="instruction.selected" :label="instruction.name" :key="instruction.id" class="mb-0" style="width: 100%;" >
                <span v-if="instruction.description" slot="help" class="grey--text text--darken-2">{{instruction.description}}</span>
              </n-checkbox>
            </n-tile-content>

            <!-- Card Image -->
            <n-tile-content v-if="!instruction.imageCollection.isEmpty" class="tile__header" style="max-width: 35%; min-height: 6em;">
              <n-computed-image :image-collection="instruction.imageCollection" />
            </n-tile-content>
          </n-tile>

          <!-- Upsells -->
          <n-tile v-if="quickPickableUpsellsProducts && quickPickableUpsellsProducts.length" column class="mb-4">
            <n-tile-content class="black white--text">
              <!-- TODO: I18n -->
              <h4 class="display-1">Forgotten anything?</h4>
            </n-tile-content>
            <n-tile-content class="px-0 pt-1">
              <n-list>
                <n-list-item v-for="product in quickPickableUpsellsProducts" :key="product.id">
                  <n-list-tile selectable>
                    <n-list-tile-content>
                      <n-checkbox v-model="selectedUpsells[product.id]" :label="product.name" :key="product.id" collapse-empty-content>
                        <div slot="label" slot-scope="{label}" class="flexbox justify-space-between" style="width: 100%;">
                          {{label}}
                          <span class="money">+{{ product.price | money }}</span>
                        </div>
                      </n-checkbox>
                    </n-list-tile-content>
                  </n-list-tile>
                </n-list-item>
              </n-list>
            </n-tile-content>
          </n-tile>

        </n-flex>
        <!-- Right column -->
        <n-flex xs12 md4 v-if="$breakpoints.mdUp">
          <n-ordering-order-summary-tile :basket="basket">
            <!-- Checkout / Choose store button -->
            <n-button  class="hero-cta" slot="footer" @click.native="next" large block primary with-triangle :loading="loading" v-track="{'checkout': 'basket'}">
              <span class="nandos-hand">{{ $t('basket.footer.confirm') }}</span>
            </n-button>
          </n-ordering-order-summary-tile>
        </n-flex>
      </n-layout>
    </n-container>

    <n-page-footer slot="footer">
      <n-container v-if="ready">
        <n-button square block @click.native="next" primary :loading="loading" class="mb-0 hero-cta" v-track="{'checkout': 'footer'}">
          <span class="nandos-hand">{{ $t('basket.footer.confirm') }}</span>
        </n-button>
      </n-container>
    </n-page-footer>

    <n-confirm-dialog slot="floating-content" v-model="showInstructionDisclaimer" :title="pendingInstructionSelection && pendingInstructionSelection.name" :confirm="$t('basket.checkoutInstructions.disclaimer.confirm')" @confirm="pendingInstructionSelection.selected = true" @cancel="pendingInstructionSelection = null" :confirm-is-destructive="false">
      <div v-html="pendingInstructionSelection && pendingInstructionSelection.disclaimer" class="mb-5"></div>
    </n-confirm-dialog>

  </n-page>
</template>

<script src="checkout-instructions.js"></script>