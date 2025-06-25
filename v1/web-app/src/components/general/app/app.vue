<template>
  <div data-app>

    <portal-target name="app-navigation"></portal-target>

    <portal-target name="app-header-portal"></portal-target>

    <main>
      <transition :name="pageTransition">
        <router-view :key="routeKey"/>
      </transition>
    </main>

    <n-system-messaging :category="systemMessagesData"/>
    <n-order-review v-if="reviewOrderData" v-model="showOrderRatingForm" :order="reviewOrderData" can-ignore/>


    <template v-if="bannerNotification">
      <portal to="menu-banner-portal">
        <n-alert class="lumo-pink white--text" :value="true" style="margin-bottom: .5rem;margin-top: -.5rem;">
          {{ bannerNotification.description }}
        </n-alert>
      </portal>
    </template>


  </div>
</template>

<script src="app.js"></script>
<style src="@/scss/main.scss" lang="scss"></style>