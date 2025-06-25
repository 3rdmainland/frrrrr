<template>
  <n-navigation-drawer
    full-width
    :right="dockToRight"
    temporary
    v-model="isActive"
    class="slide-out-navigation black pattern-bg pattern-bg--default white--text"
  >
    <n-button
      icon
      @click.native.stop="isActive = false"
      style="z-index: 9999"
      floating
      absolute
      right
      top
      class="slide-out-navigation__close-btn"
    >
      <n-icon light small>close</n-icon>
    </n-button>
    <div v-if="isSignedInUser" class="welcome-message tilted text-xs-left mb-5">
      <h2 class="welcome-message__hey squiggles squiggles--bottom">
        {{ $t("nav.welcome") }}
      </h2>
      <h1 class="welcome-message__username">{{ user.name }}</h1>
    </div>
    <n-list dense>
      <template v-for="(item, index) in nav_items">
        <!-- Group items -->
        <n-list-group v-if="item.children" :key="'item-' + index">
          <n-list-tile slot="item">
            <n-list-tile-content>
              <n-list-tile-title>{{ item.title }}</n-list-tile-title>
            </n-list-tile-content>
            <n-list-tile-action>
              <n-icon tiny>arrow_right</n-icon>
            </n-list-tile-action>
          </n-list-tile>
          <n-list-tile
            v-for="(subItem, subIndex) in item.children"
            :to="subItem.isExternal ? subItem.path : subItem.internalPath"
            :external="subItem.isExternal"
            :key="'sub-item-' + subIndex"
            v-track="{ 'slide out navigation': subItem.title }"
          >
            <n-list-tile-content>
              <n-list-tile-title>{{ subItem.title }}</n-list-tile-title>
            </n-list-tile-content>
          </n-list-tile>
        </n-list-group>
        <!-- Single items -->
        <n-list-item v-else :key="'item-' + index">
          <n-list-tile
            :to="item.isExternal ? item.path : item.internalPath"
            :external="item.isExternal"
            v-track="{ 'slide out navigation': item.title }"
          >
            <n-list-tile-title>{{ item.title }}</n-list-tile-title>
          </n-list-tile>
        </n-list-item>
      </template>
    </n-list>

    <n-list dense>
      <n-list-item v-if="PERI_PLAYGROUND_URL">
        <n-list-tile
          :to="PERI_PLAYGROUND_URL"
          :external="true"
          inAppBrowserTarget="_blank"
        >
          <n-list-tile-title> {{ $t("nav.periPlayground") }}</n-list-tile-title>
        </n-list-tile>
      </n-list-item>
    </n-list>

    <!-- Log in/out item  -->
    <section>
      <n-button
        v-if="isSignedInUser"
        @click.native="logout"
        primary
        v-track="{ 'slide out navigation': 'log out' }"
        >{{ $t("nav.logOut") }}</n-button
      >
      <n-button
        v-else
        :to="{ name: 'sign-in' }"
        primary
        v-track="{ 'slide out navigation': 'log in' }"
        >{{ $t("nav.logIn") }}</n-button
      >
    </section>
  </n-navigation-drawer>
</template>

<script src="./slide-out-navigation.js"></script>
