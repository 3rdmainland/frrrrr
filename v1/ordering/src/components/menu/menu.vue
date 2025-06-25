<template>
  <n-page :show-footer="showFooter" :docked-footer="$breakpoints.xs" class="menu">

    <portal to="app-header-portal">
      <n-app-header back-title="Menu" :info="preview">
        <template v-if="isMobileLayout">
          <router-link v-if="ready && !preview" slot="title" :to="{name: 'order-setup-start', query: {redirect: $route.fullPath, jump: true}}" tag="span" v-track="{'order setup quick link': 'header'}">
            <span class="menu__mobile-order-setup-info px-2 truncate">{{page_title}}</span>
            <n-icon small>arrow_down</n-icon>
          </router-link>
          <span v-else-if="preview" slot="title">Menu preview</span>
          <n-ordering-menu-change-address-prompt v-if="warnIfCustomerLocationIsFarFromStore" :basket-service="basketService" :store-service="storeService" slot="title"/>
          <span class="grey--text text--lighten-1">|</span>
        </template>
      </n-app-header>
    </portal>

    <!-- Desktop layout order setup info -->
    <header slot="header" :class="isMobileLayout ? 'yellow' : 'grey lighten-4'">
      <n-container class="wide__container">
        <n-layout row wrap>
          
          <!-- Order seteup info -->
          <n-flex v-if="isDesktopLayout" xs12 md7 class="flexbox align-center justify-center" style="position: relative;">
            <router-link v-if="ready && !preview" :to="{name: 'order-setup-start', query: {redirect: $route.fullPath, jump: true}}" class="menu__order-setup-info flexbox align-center" v-track="{'order setup quick link': 'menu'}">
              <template>
                <div class="px-3 truncate">{{page_title}}</div>
                <n-icon small>arrow_down</n-icon>
              </template>
            </router-link>
            <n-ordering-menu-change-address-prompt v-if="warnIfCustomerLocationIsFarFromStore" :basket-service="basketService" :store-service="storeService" />
          </n-flex>

          <!-- Search input -->
          <n-flex xs12 md5>
            <n-form class="mb-0" autocomplete="off">
              <n-input v-model="searchQuery" collapse-empty-content @keydown.native="searchContext = 'text'" @focus="goToSearchPage" type="search" inputmode="search" name="search" :label="$t('menu.searchPlaceholder')" class="menu__search-input">
                <n-icon  slot="prepend" :class="isDesktopLayout ? 'pa-2' : 'pa-1'" >search</n-icon>

                <n-button v-if="searchQuery" @click.native="searchQuery = null;" slot="append" icon flat key="clear-search">
                  <n-icon>close</n-icon>
                </n-button>
                <n-speech-to-text v-show="!searchQuery" slot="append" v-model="voiceSearchResult" @input="goToSearchPage(); searchContext = 'voice'" :language="languageService.languageKey" @error="onSpeechToTextError" @is-available="voiceSearchAvailable = $event" icon dark flat :style="{'min-width': isDesktopLayout ?  '4em' : '2em'}" />
              </n-input>
            </n-form>
          </n-flex>
        </n-layout>
      </n-container>
    </header>

    <n-page :show-header="ready && quickLinks.length > 0">
      <header slot="header" class="black">
        <n-ordering-menu-quick-links v-if="ready" :quick-links="quickLinks" />
      </header>

      <!-- Router outlet -->
      <transition :name="pageTransition">
        <router-view :key="$route.path" :search-query.sync="searchQuery" :voice-search-available="voiceSearchAvailable" :recent-searches="recentSearches" :quick-links="quickLinks" @search-result-clicked="onSearchResultClicked" />
      </transition>
    </n-page>

    <n-page-footer slot="footer">
      <n-container v-if="ready" class="wide__container flexbox">
        <!-- <span class="hidden-xs display-1">{{ $tc('menu.checkoutPrompt', basket.totalItems) }}</span> -->
        <!-- <n-spacer v-if="!$breakpoints.xs" /> -->
        <n-button :to="{name: 'basket'}" primary class="hero-cta" :square="$breakpoints.xs" :block="$breakpoints.xs" v-track="{'Checkout': 'footer'}">
          <span>&nbsp;</span>
          <span class="nandos-hand px-3">{{$t('common.checkout')}}</span>
          <n-chip round class="my-0 lumo-pink money">{{basket.totalPrice | money}}</n-chip>
        </n-button>
      </n-container>
    </n-page-footer>

  </n-page>
</template>

<script src="menu.js"></script>