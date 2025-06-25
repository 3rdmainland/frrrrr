<template>
  <n-page pattern-bg :show-header="ready && tabs.length > 0">
    
    <portal to="app-header-portal">
      <n-app-header :title="$t('productNutritionalInfo.titleShort')" :info="preview" />
    </portal>

    <header slot="header" class="flex-center grey lighten-4">
      <template v-if="ready">
        <n-button v-for="tab in tabs" :key="tab" :primary="activeTab == tab" :active="activeTab == tab" @click.native="activeTab = tab">{{ $t(`productNutritionalInfo.${tab.toLowerCase()}.title`) }}</n-button>
      </template>
    </header>

    <n-container v-if="ready">
      <n-edit-menu-entity-link v-if="preview" :item="userProduct" always-visible />
      <section v-if="tabs.length == 0">
        <h4>{{ $t('productNutritionalInfo.empty') }}</h4>
      </section>
      <section v-if="activeTab == NUTRITION" v-once>
        <template v-for="product in productsWithNutritionalInfo">
          <h3 v-html="product.getName()"></h3>
          <table class="mb-4">
            <thead>
              <tr>
                <th></th>
                <th>{{ $t('productNutritionalInfo.nutrition.per100g') }}</th>
                <th>{{ $t('productNutritionalInfo.nutrition.servingSize', {size: product.getServingSize()}) }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="component in nutritionalComponents" :key="component.id" :set="productNutritionComponent = product.getNutritionalInfo().find(pCom => pCom.id == component.id)">
                <td :class="{'pl-3 grey--text text--darken-1': component.subComponent}">
                  {{ component.name }}
                  <span v-if="component.unit">({{ $t(`productNutritionalInfo.nutrition.units.${component.unit}`) }})</span>
                  <div class="grey--text">{{ component.description }}</div>
                </td>
                <template v-if="productNutritionComponent">
                  <td>{{$n(productNutritionComponent.per100g, 'simple')}}</td>
                  <td>{{$n(productNutritionComponent.perServing, 'simple')}}</td>
                </template>
                <template v-else>
                  <td>{{$n(0, 'simple')}}</td>
                  <td>{{$n(0, 'simple')}}</td>
                </template>
              </tr>
            </tbody>
          </table>
        </template>
        <p v-html="$t('productNutritionalInfo.nutrition.disclaimer')" class="mt-4"></p>
      </section>
      <section v-else-if="activeTab == ALLERGENS" v-once>
        <template v-for="product in productsWithAllergenInfo">
          <h3 v-html="product.getName()"></h3>
          <n-list>
            <n-list-item v-for="allergen in product.getAllergens()" :key="allergen.id">
              <n-list-tile :interactive="false">
                <n-list-tile-title>
                  {{ allergen.name }}
                </n-list-tile-title>
              </n-list-tile>
            </n-list-item>
          </n-list>
        </template>
        <p v-html="$t('productNutritionalInfo.allergens.disclaimer')" class="mt-4"></p>
        <i18n tag="p" path="productNutritionalInfo.allergens.moreInfo">
          <n-button slot="tos" to="https://www.nandos.co.za/terms-service#clause-6" text-link class="lumo-pink--text">{{ $t('productNutritionalInfo.allergens.tos') }}</n-button>
          <strong slot="call-center-tel">
            <a :href="`tel:${CALL_CENTER_PHONE}`" class="lumo-pink--text">{{CALL_CENTER_PHONE}}</a>
          </strong>
        </i18n>
      </section>
    </n-container>
  </n-page>
</template>

<script>export {default} from './product-nutritional-info.js';</script>