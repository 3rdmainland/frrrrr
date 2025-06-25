<template>
  <n-page v-if="useSplitLayout || atRoot" pattern-bg :padding="useSplitLayout && !productIsFlavourSelection"
          :class="page_classes">

    <portal to="app-header-portal">
      <n-app-header :back-title="backTitle" :info="preview">
        <span slot="title" v-html="pageTitle"></span>
      </n-app-header>
    </portal>

    <!-- Product Image (small devices only) -->
    <!-- Accent color strip comes from the "block-clipped--with-border" wrapper element -->
    <div v-if="ready && !useSplitLayout && atRoot" :class="{'block-clipped--with-border': userProduct.getAccentColor()}"
         :style="`color: ${userProduct.getAccentColor()};`">
      <n-page-hero :image-collection="userProduct.getImageCollection()" :seed="seed">
        <div slot="floating" class="new-layer product-image__serving-suggestion-overlay white--text">
          {{ $t('product.servingSuggestionDisclaimer') }}
        </div>
      </n-page-hero>
    </div>

    <div v-if="ready" class="content-column" :class="{'fill-height': productIsFlavourSelection}">

      <n-container :narrow="useSplitLayout" :class="{'flexbox column fill-height': productIsFlavourSelection}">

        <!-- Product's name, description etc -->
        <div class="product-details ma-4 text-xs-center">
          <n-chip tag="span" v-if="userProduct.getBadge()" skew class="text--bold"
                  style="position: absolute; z-index: 1; left: 50%; transform: translate(-50%, -95%);"
                  :style="`background-color: ${userProduct.getBadge().backgroundColor}; color: ${userProduct.getBadge().textColor}; font-size: 1rem;`">
            {{ userProduct.getBadge().title }}
          </n-chip>
          <n-blocked-heading tag="h3"><span v-html="userProduct.getName()"></span></n-blocked-heading>
          <p v-if="userProduct.getDescription()">
            <span class="triangle-decorator lumo-pink mb-2 heartbeat-bounce"></span>
            <span v-html="userProduct.getDescription()"></span>
          </p>
          <n-edit-menu-entity-link v-if="preview" :item="userProduct" always-visible
                                   style="position: relative; top: auto; right: auto; font-size: 14px;"/>
        </div>

        <!-- Delivery pricing disclaimer -->
        <section v-if="atRoot && basket.forDelivery && WARN_ABOUT_DELIVERY_PRICING"
                 class="grey--text text--darken-1 my-4 text-xs-center" style="font-size: 0.85em;">
          <n-icon class="mr-1" style="font-size: 110%;">bell</n-icon>
          <i18n tag="span" path="productDetail.deliveryPriceNote.message">
            <strong slot="bold">{{ $t('productDetail.deliveryPriceNote.bold') }}</strong>
            <n-button slot="moreInfo" text-link jump to="/content/delivery-pricing-info"
                      class="grey--text text--darken-1 underline"
                      v-track="{'product detail': 'delivery pricing more info'}">
              {{ $t('productDetail.deliveryPriceNote.moreInfo') }}
            </n-button>
          </i18n>
        </section>

        <template v-if="userProduct.getRoot().isAvailable()">
          <!-- Peri-ometer Flavour Selector -->
          <n-ordering-product-configurator-flavour-selection v-if="productIsFlavourSelection"
                                                             :user-product="userProduct"
                                                             :use-split-layout="useSplitLayout"
                                                             @select="selectProduct($event, true)"
                                                             @done="exitFlavourSelection"/>
          <!-- Normal Product Config Listing -->
          <n-list v-else>
            <n-list-item v-for="relatedProduct in userProduct.getDisplayRelatedProducts()"
                         @click.stop="selectProduct(relatedProduct, (!relatedProduct.isAvailable() && !relatedProduct.isSelected()))"
                         :key="relatedProduct.getIdPath()">
              <n-list-tile :disabled="!relatedProduct.isAvailable() && !relatedProduct.isSelected()">
                <!-- List item state indicators -->
                <n-list-tile-action class="item-badges" narrow>
                  <n-icon key="error" v-if="showValidationErrors && !relatedProduct.isValidState()" error>error_circle
                  </n-icon>
                  <n-icon key="tick" v-else-if="relatedProduct.isSelected() && relatedProduct.isValidState()" success>
                    check_circle
                  </n-icon>
                  <n-icon key="warning" v-else-if="relatedProduct.computeSelectedExclusions().length > 0" error>
                    warning
                  </n-icon>
                  <!-- unselected state is shown for leaf nodes in multi select parents only v-else-if="userProduct.canMultiSelect() && relatedProduct.isLeaf()"-->
                  <n-icon key="semi" v-else-if="!relatedProduct.isMandatory()" disabled>check_circle</n-icon>
                  <n-icon key="unselected" v-else>
                    outline_circle
                  </n-icon>
                </n-list-tile-action>
                <n-list-tile-content class="item-content">
                  <n-list-tile-title :class="getListItemTitleClasses(relatedProduct)">
                    <n-chip tag="small" v-if="relatedProduct.getBadge()" skew class="text--bold mr-1"
                            :style="`background-color: ${relatedProduct.getBadge().backgroundColor}; color: ${relatedProduct.getBadge().textColor};`">
                      {{ relatedProduct.getBadge().title }}
                    </n-chip>
                    <span v-html="relatedProduct.getName()"></span>
                    <n-icon small>forward</n-icon>
                  </n-list-tile-title>
                  <n-list-tile-sub-title
                      v-if="relatedProduct.getConfigurationDescription() || relatedProduct.computeSelectedExclusions().length > 0">
                    <span v-html="relatedProduct.getConfigurationDescription()"></span>
                    <n-chip v-for="exclusion in relatedProduct.computeSelectedExclusions()" :key="exclusion" error>
                      {{ $t(`product.exclusions.${exclusion}`) }}
                    </n-chip>
                  </n-list-tile-sub-title>
                </n-list-tile-content>
                <n-list-tile-action class="item-chips" style="" no-stack>
                  <template v-if="relatedProduct.isAvailable()">
                    <span v-if="relatedProduct.computePrice()" class="money">{{
                        $t('product.configuration.hasAdditionalCost', {amount: $options.filters.money(relatedProduct.computePrice())})
                      }}</span>
                    <n-chip v-else-if="!relatedProduct.isValidState()"
                            :class="showValidationErrors ? 'error' : 'black'">{{ $t('product.configuration.required') }}
                    </n-chip>
                    <n-icon v-if="!relatedProduct.isLeaf() && !atRoot " flip-for-rtl tiny class="ml-2">arrow_right
                    </n-icon>
                  </template>
                  <template v-else>
                    <n-chip v-for="exclusion in relatedProduct.getExclusions()" :key="exclusion">
                      {{ $t(`product.exclusions.${exclusion}`) }}
                    </n-chip>
                  </template>
                  <span></span>
                </n-list-tile-action>
                <n-edit-menu-entity-link v-if="preview" :item="relatedProduct"/>

                <!-- Quick pick for sides -->
                <n-tile
                    v-if="relatedProduct.isAvailable() && atRoot && relatedProduct.isSideConatiner() && relatedProduct.getQuickPickChildren(1).length == 1 && useSplitLayout"
                    column style="width: 100%;" class="mx-4 my-3" @click.native.stop="() => {}">
                  <!-- prevent click event from bubbling up to parent list item -->
                  <n-tile-content class="pa-0 align-start">
                    <n-list dense>
                      <n-list-item v-for="quickPickProduct in relatedProduct.getQuickPickChildren(6)"
                                   @click.stop="selectProduct(quickPickProduct, true)"
                                   :key="quickPickProduct.getIdPath()">
                        <n-list-tile>
                          <n-list-tile-action narrow>
                            <n-icon key="tick" v-if="quickPickProduct.isSelected() && quickPickProduct.isValidState()"
                                    class="success--text">check_circle
                            </n-icon>
                            <n-icon key="unselected" v-else>outline_circle</n-icon>
                          </n-list-tile-action>
                          <n-list-tile-content style="font-size: 0.9em;">
                            <n-list-tile-title v-html="quickPickProduct.getShortName()"/>
                          </n-list-tile-content>
                        </n-list-tile>
                      </n-list-item>
                      <n-list-item @click.stop="selectProduct(relatedProduct)"> <!-- Quick pick more options btn -->
                        <n-list-tile>
                          <n-list-tile-action narrow>
                            <n-icon class="invisible"></n-icon> <!-- spacer -->
                          </n-list-tile-action>
                          <n-list-tile-content>
                            <n-button small round class="ma-0" style="align-self: flex-end;">More options</n-button>
                            <!-- TODO:: i18n -->
                          </n-list-tile-content>
                        </n-list-tile>
                      </n-list-item>
                    </n-list>
                  </n-tile-content>
                </n-tile>

              </n-list-tile>

              <n-list-divider v-if="atRoot"/>

            </n-list-item>
          </n-list>

          <section v-if="atRoot" class="text-xs-center my-4">
            <!-- Quantity selection -->
            <n-number-picker v-model="userProduct.orderQuantity" :min="1" class="mb-4"/>
            <!-- Show Product Nutritional Button -->
            <div>
              <n-button jump small :to="nutritionalOrAllergenInfoAvailable ? productNutritionalUrl : null"
                        @click.native="displayNutritionalInfoUnavableForSelectionPopup" flat
                        class="lumo-pink--text my-2" v-track="{'Nutritional FAB': ''}">
                <n-icon left>nutritional</n-icon>
                {{ $t('product.nutritionalInfo') }}
                <n-pop-up v-show="showNutritionalInfoUnavableForSelectionPopup" top>
                  {{ $t('product.nutritionalInfoNoSelection') }}
                </n-pop-up>
              </n-button>
            </div>
          </section>


        </template>
        <!-- Product is unavailable message -->
        <n-alert v-else error :value="true">
          <i18n path="product.unavailable">
            <template v-for="exclusion in userProduct.getRoot().getExclusions()">
              <n-chip v-if="exclusion != EXCLUSION_TYPES.HIDDEN" slot="reasons" :key="exclusion">
                {{ $t(`product.exclusions.${exclusion}`) }}
              </n-chip>
            </template>
          </i18n>
        </n-alert>

        <n-alert info :value="userProduct.getGeneralDisclaimer()">
          {{ userProduct.getGeneralDisclaimer() }}
        </n-alert>

        <n-alert info :value="basket.forDelivery && userProduct.getDeliveryDisclaimer()">
          {{ userProduct.getDeliveryDisclaimer() }}
        </n-alert>

        <div class="flexbox justify-end">
          <n-button
              v-if="!atRoot && userProduct.isSelected() && !userProduct.onlyHasLeaves() && !userProduct.isMandatory()"
              @click.native="onRemoveBtnClicked" error small class="remove-btn">
            {{ $t('product.configuration.clear') }}
          </n-button>
          <n-button v-if="!atRoot && userProduct.canMultiSelect()" @click.native="onDoneBtnClicked" small>
            {{ $t('product.configuration.done') }}
          </n-button>
        </div>

      </n-container>
    </div>

    <!-- Close button -->
    <transition v-if="ready" name="fade-transition" appear>
      <n-button v-if="!atRoot && !productIsFlavourSelection" @click.native="goToRoot" floating fixed top right flat
                class="close-btn" style="z-index:2;">
        <n-icon>close</n-icon>
      </n-button>
    </transition>

  </n-page>
  <n-dialog :value="ready && showSubItemConfigurator" force-open v-else bottom
            @close="goToClosestInvalidNode(userProduct, true)">
    <n-layout class="fill-height column white px-5 py-5" style="border-radius: 1em 1em 0 0;margin-left: 1px;margin-right: 1px;max-height: 70vh;overflow: auto;">
      <template v-if="ready && userProduct.isFlavourContainer()">
        <!-- Peri-ometer Flavour Selector -->
        <n-ordering-product-configurator-flavour-selection v-if="productIsFlavourSelection"
                                                           :user-product="userProduct"
                                                           hide-close-btn
                                                           :use-split-layout="useSplitLayout"
                                                           @select="selectProduct($event, true)"
                                                           @done="exitFlavourSelection"/>
      </template>
      <product-configurator-checklist v-else-if="ready" :show-validation-errors="showValidationErrors"
                                      style="margin-bottom: 1em"
                                      ref="checklist"
                                      :user-product="userProduct"
                                      :half-and-half-mode="halfAndHalfMode"
                                      @click="({selected,forceStayOnScreen})=>selectProduct(selected, (!selected.isAvailable() && !selected.isSelected() || forceStayOnScreen))"/>
      <div class="flexbox justify-end" style="position: sticky;bottom: 0;" v-if="ready">
        <n-button
            v-if="userProduct && userProduct.isSelected() && !userProduct.onlyHasLeaves() && !userProduct.isMandatory()"
            @click.native="onRemoveBtnClicked" error small class="remove-btn">
          {{ $t('product.configuration.clear') }}
        </n-button>
        <n-button v-if="userProduct.canMultiSelect()" @click.native.stop="onDoneBtnClicked"
                  small>
          {{ $t('product.configuration.done') }}
        </n-button>
      </div>
    </n-layout>
  </n-dialog>
</template>

<script>export {default} from './product-configurator.js';</script>