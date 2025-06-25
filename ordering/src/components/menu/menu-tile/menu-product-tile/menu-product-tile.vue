<template>
  <!-- Use `<router-link>` and scoped slot to get the "pre-navigation" onProductClicked hook -->
  <router-link :to="productUrl" v-slot="{ href, route, navigate, isActive, isExactActive }" :style="`background-color: ${expansiveLayout && data.accentColor};`">
    <a :href="href" @click="onProductClicked(); navigate($event);" :class="classes" data-track-product-impression>
      
      <!-- Product Image -->
      <n-tile-content :xs5="row == true" class="menu-tile__item-image pa-0" :class="placeholder">
        <small v-if="data.badge" class="product__badge" style="width: 100%;" :style="`background-color: ${data.badge.backgroundColor}; color: ${data.badge.textColor};`">
          {{data.badge.title}}
        </small>
        <div class="product-image-container">
          <n-computed-image :image-collection="data.imageCollection" />
        </div>
      </n-tile-content>

      <!-- Product Details -->
      <n-tile-content class="menu-tile__item-details" :xs7="row == true">

        <div class="flexbox fill-height column justify-space-between" style="width: 100%;">
          <div class="mb-3">
            <slot name="product-details" />
            <n-blocked-heading v-if="expansiveLayout" tag="h3"><span v-html="data.name"></span></n-blocked-heading>
            <h4 v-else v-html="data.name" class="display-1"></h4>
            <p v-if="!hideDescription && !data.isAutoconfigured" class="mt-2 product-description">
              <span v-if="expansiveLayout" class="triangle-decorator lumo-pink mb-2"></span>
              <span v-html="data.description"></span>
            </p>
            <p v-if="isAutoConfigOnly" class="pa-3 yellow product-details__configured-description">
              <span v-html="productDescription"></span>
            </p>
          </div>

          <div class="flexbox row wrap justify-space-between">
            <div v-if="Object.keys(displayFeatures).length" class="mr-2">
              <n-image v-for="feature in displayFeatures" :src="feature.icon && feature.icon.path" :title="feature.name" :key="feature.id" class="product__feature mr-1" />
            </div>
            <div v-else></div> <!-- spacer -->

            <div v-if="data.available" class="text-xs-right">
              <div class="money money--large" style="width: 100%;">{{ productPrice | money }}</div>
              <!-- Quick add to basket button-->
              <div v-if="canSingleClickAddToBasket" class="mt-2">
                <n-button @click.native.stop.prevent="addToBasket" :loading="addToBasketLoading" small round outline class="ma-0" v-track="{'product': 'bag one'}">Bag One</n-button>
              </div>
            </div>
            <template v-else>
              <n-chip v-for="exclusion in data.exclusions" :key="exclusion">{{ $t(`product.exclusions.${exclusion}`) }}</n-chip>
            </template>
          </div>
          
        </div>
      </n-tile-content>

      <!-- Auto-config details strip -->
      <n-tile-content v-if="data.isAutoconfigured && !displayAutoconfiguredOnly" xs12 @click.stop="onProductClicked(true); navigate($event);" class="pattern-bg pattern-bg--triangles-black-5 yellow pa-3">
        <small>{{ $t('product.configuredDescription') }}</small>
        <div v-html="data.autoconfigDescription"></div>
        <div class="money text-xs-right" v-if="data.price != data.autoconfigPrice">
         {{ data.autoconfigPrice | money }}
       </div>
     </n-tile-content>

     <n-edit-menu-entity-link v-if="preview" :item="data"/>
   </a>
 </router-link>
</template>

<script src="./menu-product-tile.js"></script>