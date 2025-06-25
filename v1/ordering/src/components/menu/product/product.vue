<template>
  <n-page class="product" :class="{'split-layout':useSplitLayout, 'product--do-header-animation': doHeaderAnimation}"
          :show-footer="ready && !useSplitLayout" :docked-footer="$breakpoints.smDown">


    <transition-group :name="pageTransition" @before-leave="beforePageLeave" @after-enter="afterPageEnter" @before-enter="beforePageEnter" @after-leave="afterPageLeave">
      <product-configurator
          ref="rootProductConfigPage"
          key="root"
          :product-definition-id="productDefinitionId"
          :basket="basket"
          :product-nutritional-url="nutritionalUrl"
          :root-url="rootUrl" :at-root="true"
          :use-split-layout="useSplitLayout"
          @force-parent-update="() => $forceUpdate()"
          :show-validation-errors="show_validation_errors"/>

      <router-view
          ref="productConfigPage"
          v-if="!atRoot && ready"
          :key="$route.path"
          :basket="basket"
          :product-nutritional-url="nutritionalUrl"
          :root-url="rootUrl"
          :at-root="false"
          :use-split-layout="useSplitLayout"
          @force-parent-update="triggerUpdates"
          :show-validation-errors="show_validation_errors">
      </router-view>
    </transition-group>

    <!-- Use on large devices only -->
    <template v-if="ready && useSplitLayout" slot="floating-content">

      <!-- Accent color strip -->
      <div v-if="userProduct.getAccentColor()" class="product__accent-color"
           :style="`background-color: ${userProduct.getAccentColor()};`"></div>

      <!-- Product Image -->
      <section v-if="useSplitLayout" class="product-image-wrapper"
               :class="{'product-image-wrapper--with-accent-color': userProduct.getAccentColor(), [placeholder]: true}">
        <n-computed-image :image-collection="userProduct.getImageCollection()" zoom-intro/>
        <div class="new-layer product-image__serving-suggestion-overlay white--text">
          {{ $t('product.servingSuggestionDisclaimer') }}
        </div>
      </section>

      <!-- Fixed Add to cart button -->
      <div class="content-column add-to-cart-btn__wrapper">
        <n-container :narrow="useSplitLayout" class="flexbox justify-center">
          <n-button @click.native.stop="addToBasket" :loading="add_in_progress" :disabled="!userProduct.isAvailable()"
                    :primary="userProduct.isConfigured()" skew with-triangle class="add-to-cart-btn"
                    :class="{'product-is-configured': userProduct.isConfigured()}"
                    v-track="{[edit ? 'Update button' : 'Add to basket button']: 'configuration was valid - ' + userProduct.isConfigured()}">
            <span class="nandos-hand pr-2">{{
                $t(`productDetail.addToBasket.${this.edit ? 'update' : 'new'}.label`)
              }}</span>
            <span class="nandos-hand pl-2">{{ userProduct.orderQuantity * userProduct.computePrice() | money }}</span>
          </n-button>
        </n-container>
      </div>

    </template>

    <!-- Use on small devices only -->
    <!-- Docked footer Add to cart button -->
    <n-page-footer v-if="!useSplitLayout" slot="footer">
      <n-container v-if="ready">
        <n-button @click.native.stop="addToBasket" :loading="add_in_progress" :disabled="!userProduct.isAvailable()"
                  :primary="userProduct.isConfigured()" :square="$breakpoints.smDown" :block="$breakpoints.smDown"
                  class="add-to-cart-btn hero-cta" :class="{'product-is-configured': userProduct.isConfigured()}"
                  v-track="{[edit ? 'Update button' : 'Add to basket button']: 'configuration was valid - ' + userProduct.isConfigured()}">
          <span>&nbsp;</span>
          <span
              class="nandos-hand px-3">{{ $t(`productDetail.addToBasket.${this.edit ? 'update' : 'new'}.label`) }}</span>
          <n-chip round class="my-0 lumo-pink money">{{
              userProduct.orderQuantity * userProduct.computePrice() | money
            }}
          </n-chip>
        </n-button>
      </n-container>
    </n-page-footer>

  </n-page>
</template>

<script src="product.js"></script>