<template>
  <header :class="classes">

    <!-- ///////////////////////// -->

    <div class="nav-btns">
      <n-button v-if="$route.query.jump && $route.query.preserve && !forceHamburger" key="up" icon flat @click.native.stop="navigateBack" v-track="{'close': 'header'}">
        <n-icon flip-for-rtl>close</n-icon>
      </n-button>
      <n-button v-else-if="$route.query.jump && !forceHamburger" :to="$route.query.redirect" exact icon flat key="close" v-track="{'close': 'header'}">
        <n-icon>close</n-icon>
      </n-button>
      <template v-else-if="at_root || forceHamburger">
        <a v-if="desktopLayout && $isBrowserApp" href="/" v-track="{'nandos-logo': 'header'}">
          <img src="~nandos-core-ui/src/assets/img/nandos-logo.svg" class="logo">
        </a>
        <router-link v-else-if="desktopLayout && $isCordovaApp" to="/" v-track="{'nandos-logo': 'header'}">
          <img src="~nandos-core-ui/src/assets/img/nandos-logo.svg" class="logo">
        </router-link>
        <n-button v-else key="menu" icon flat @click.native.stop="nav_open = true" v-track="{'hamburger': 'header'}">
          <n-icon>menu</n-icon>
        </n-button>
      </template>
      <n-button v-else key="up" icon flat @click.native.stop="navigateUp" v-track="{'up': 'header'}">
        <n-icon flip-for-rtl>back</n-icon>
      </n-button>
    </div>

    <!-- ///////////////////////// -->

    <n-header-nav v-if="desktopLayout" />
    <div v-else class="page-title" :class="{'page-title--truncated': truncateTitle}">
      <slot name="title">{{title | title-case}}</slot>
    </div>

    <!-- ///////////////////////// -->

    <div class="toolbar--actions">
      <!-- Custom toolbar actions slot -->
      <slot></slot>

      <n-language-switcher />

      <template v-if="showBrochureToolbarActions">
        <!-- toolbar actions from middleware -->
        <n-button v-for="action in toolbarActions" icon flat :to="action.isExternal ? action.path : action.internalPath" :external="action.isExternal" active-class="primary" :key="action.path" :title="action.title" v-track="{[`toolbar-action-${action.title}`]: 'header'}">
          <n-icon large :class="`${action.color}--text`">{{action.icon}}</n-icon>
        </n-button>

        <!-- Profile Toolbar action -->
        <n-button to="/me" icon flat :active-class="'primary'" :title="$t('toolbarNav.profile')" v-track="{'toolbar-action-profile': 'header'}">
          <n-icon large :class="signedInUser ? 'green--text' : 'grey--text'">user</n-icon>
        </n-button>
      </template>

      <!-- Basket Toolbar action -->
      <n-ordering-basket-summary :basket-service="basketService" :muted="!signedInUser" :title="$t('toolbarNav.basket')" key="header-basket-summary" v-track="{'toolbar-action-basket': 'header'}" />
    </div>

    <!-- ///////////////////////// -->
    <n-progress-linear v-show="loadingData" height="3" indeterminate class="loading-indicator" :style="{top: transparent ? '0' : '', bottom: transparent ? '' : '0'}"></n-progress-linear>

    <portal to="app-navigation">
      <n-slide-out-navigation v-model="nav_open"></n-slide-out-navigation>
    </portal>
  </header>    
</template>

<script src="./app-header.js"></script>