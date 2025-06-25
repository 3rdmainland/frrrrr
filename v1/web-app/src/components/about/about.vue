<template>
  <n-page pattern-bg>

    <portal to="app-header-portal">
      <n-app-header :title="$t('about.title')"></n-app-header>
    </portal>

    <n-container narrow class="text-xs-center">
      <section class="mb-5">
        <h2>{{$t('about.title')}}</h2>
        <p v-html="$t('about.body')"></p>
      </section>
      <section class="mb-5">
        <nav>
          <ul class="list">
            <li class="mb-1">
              <router-link :to="{name: 'menu'}" class="primary--text">{{$t('about.links.order')}}</router-link>
            </li>
            <li class="mb-1">
              <router-link to="/contact" class="primary--text">{{$t('about.links.contact')}}</router-link>
            </li>
            <li class="mb-1">
              <a :href="WEBSITE_URL" target="_blank" class="primary--text">{{$t('about.links.website')}}</a>
            </li>
          </ul>
        </nav>
      </section>

      <!-- Codebase version -->
      <p @click="appVersionTapCount++">
        {{$t('about.appVersion')}}: <strong class="grey--text">{{VERSION}}</strong>

        <!-- Hidden Debug info -->
        <n-list v-if="showDebugData" class="text-xs-left mt-5">
          <!-- App context -->
          <n-list-item v-for="item in displayData" :key="item.title">
            <n-list-tile v-if="item.value != null">
              <n-list-tile-content>
                <n-list-tile-title>{{item.title}}</n-list-tile-title>
                <n-list-tile-sub-title style="user-select: text;">{{item.value}}</n-list-tile-sub-title>
              </n-list-tile-content>
            </n-list-tile>
          </n-list-item>
        </n-list>
      </p>

    </n-container>
  </n-page>
</template>

<script src="about.js"></script>