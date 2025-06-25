<template>
  <n-list-item class="menu-category-list-item" :data-track-product-impression="data.isProduct">
    <!-- Use `<router-link>` and scoped slot to get the "pre-navigation" onProductClicked hook -->
    <router-link :to="itemUrl" v-slot="{ href, route, navigate, isActive, isExactActive }">
      <a :href="href" class="list__tile" @click="data.isProduct && onProductClicked(); navigate($event);" v-track="{'menu product': data.name}">
        <n-list-tile-content>
          <n-list-tile-title>
            <n-chip v-if="data.badge" class="text--bold" skew :style="`background-color: ${data.badge.backgroundColor}; color: ${data.badge.textColor};`">{{data.badge.title}}</n-chip>
            <span v-html="data.name"></span>
          </n-list-tile-title>

          <n-list-tile-sub-title v-if="!hideDescription">
            <n-marked-text v-if="isAutoConfigOnly" simple v-html="itemDescription"></n-marked-text>
            <span v-else v-html="itemDescription"></span>
            <div v-if="Object.keys(displayFeatures).length" class="mt-3">
              <n-image v-for="feature in displayFeatures" :src="feature.icon && feature.icon.path" :title="feature.name" :key="feature.id" class="product__feature mr-1" />
            </div>
          </n-list-tile-sub-title>
          
        </n-list-tile-content>

        <n-list-tile-action class="menu-category-list-item__price">
          <template v-if="data.available && itemPrice">
            <small v-if="data.isCategory" class="grey--text">{{ $t('product.priceFrom') }}</small>
            <span class="money">{{ itemPrice | money }}</span>
            <!-- Quick add to basket button-->
            <n-button v-if="data.isProduct && canSingleClickAddToBasket" @click.native.stop.prevent="addToBasket" :loading="addToBasketLoading" small round outline class="mr-0 mt-2" v-track="{'product': 'bag one'}">Bag One</n-button>
          </template>
          <template v-else>
            <n-chip v-for="exclusion in data.exclusions" :key="exclusion">{{ $t(`product.exclusions.${exclusion}`) }}</n-chip>
          </template>
        </n-list-tile-action>
      </a>
    </router-link>

    <!-- Optionally display configured product as a separate item -->
    <div v-if="data.isProduct && data.isAutoconfigured && !displayAutoconfiguredOnly" @click.stop="onProductClicked(true); navigate($event);" class="list__tile menu-category-list-item__auto-config-tile" v-track="{'menu auto-config product': data.name}">
      <n-list-tile-content>
        <n-list-tile-sub-title class="black--text">
          <i18n path="product.listItem.configuredDescription" tag="span">
            <span slot="description" class="grey--text text--darken-2">{{data.autoconfigDescription}}</span>
          </i18n>
        </n-list-tile-sub-title>
      </n-list-tile-content>
      <n-list-tile-action class="money" v-if="data.price != data.autoconfigPrice">
        {{ data.autoconfigPrice | money }}
      </n-list-tile-action>
    </div>

    <n-list-divider/>

    <n-edit-menu-entity-link v-if="preview" :item="data"/>

  </n-list-item>
</template>

<script src="category-list-item.js"></script>

<style lang="scss">
  .menu-category-list-item {
    &__price {
      min-width: 4.6em;
    }

    &__auto-config-tile {
      cursor: pointer;
      background-color: color("yellow", "base");
    }
  }
</style>