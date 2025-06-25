<template>
  <n-page pattern-bg :has-fab="is_menu_root" class="menu-item-listing" :class="{'is-root-menu': this.is_menu_root}">


    <template v-if="ready">

    <div class="menu-item-listing__accent-color" slot="floating-content" :style="`background-color: ${accentColor};`"></div>

      <!-- Menu Listing -->
      <n-container v-if="!isSearch" class="wide__container">
        <portal-target v-if="this.is_menu_root" name="menu-banner-portal"></portal-target>
        <section class="menu-grid" :class="{'menu-grid--masonry-pack': use_masonry_layout}" ref="menuGrid">
          <n-ordering-menu-tile v-for="(item, idx) in menuItemChildren" :data="item" ref="menuGridItems" :key="item.id" />
        </section>
      </n-container>      
      <!-- Search results -->
      <div v-else-if="isSearch" class="mb-3">
        <n-container class="wide__container">
          <section v-if="search_results && search_results.length" class="menu-grid" :class="{'menu-grid--masonry-pack': use_masonry_layout}" ref="menuGrid">
            <n-ordering-menu-tile v-for="(item, idx) in search_results" :data="item" ref="menuGridItems" :key="item.id" @click.native.capture="$emit('search-result-clicked', item)" />
          </section>
          <section v-else-if="searchQuery && searchQuery.length >= 3 && search_results && search_results.length == 0">
            <h2>{{$t('menu.noSearchResults')}}</h2>
          </section>
        </n-container>
      </div>

      <!-- Search instructions -->
      <section v-if="showSearchInstructions" class="search-instructions">
        <n-container>
          <n-list class="mb-4" dense>
            <!-- Recent search products -->
            <template v-if="recentSearches.length">
              <n-list-subheader class="black-10 black--text pa-2">Recent Product Searches</n-list-subheader> <!-- TODO: i18n -->
              <n-list-item v-for="item in recentSearches" :key="`recentSearches-${item.id}`">
                <n-list-tile :to="getProductUrl(item.id, $route, preview)" v-track="{'recent search clicked': item}">
                  <n-list-tile-content>
                    <n-list-tile-title v-html="item.name"></n-list-tile-title>
                  </n-list-tile-content>
                </n-list-tile>
                <n-list-divider/>
              </n-list-item>
            </template>
            <!-- Example searches -->
            <template v-if="exampleSearches.length">
              <n-list-subheader class="black-10 black--text pa-2">Example Searches</n-list-subheader> <!-- TODO: i18n -->
              <n-list-item v-for="instruction in exampleSearches" :key="`exampleSearches-${instruction}`">
                <n-list-tile @click="$emit('update:searchQuery', instruction)" v-track="{'example search': instruction}">
                  <n-list-tile-action narrow>
                    <n-icon>search</n-icon>
                  </n-list-tile-action>
                  <n-list-tile-content>
                    <n-list-tile-title>{{instruction}}</n-list-tile-title>
                  </n-list-tile-content>
                </n-list-tile>
                <n-list-divider/>
              </n-list-item>
            </template>
            <!-- Quick links (repeated) -->
            <template v-if="quickLinks && quickLinks.length">
              <n-list-subheader class="black-10 black--text pa-2">Categories</n-list-subheader> <!-- TODO: i18n -->
              <n-list-item v-for="quickLink in quickLinks" :key="quickLink.id">
                <n-list-tile :to="getCategoryUrl(quickLink.id, true, $route, preview)"  v-track="{'search category suggestions': quickLink.name}">
                  <n-list-tile-content>
                    <n-list-tile-title v-html="quickLink.name"/>
                  </n-list-tile-content> 
                </n-list-tile>
                <n-list-divider/>
              </n-list-item>
            </template>
          </n-list>          
        </n-container>
      </section>

      <!-- Menu Error -->
      <n-container v-else-if="error">
        <n-alert :value="true" error>
          <div v-if="error.code === 'NO_STORE_SELECTED'">
            <p>{{$t('menu.errors.noStoreSelected.message')}}</p>
            <n-button v-if="!preview" :to="{name: 'order-setup-start'}" small>{{$t('menu.errors.noStoreSelected.action')}}</n-button>
          </div>
          <div v-else-if="error.code === 'NOT_FOUND'">
            <p>{{$t('menu.errors.menuUnavailable.message')}}</p>
            <n-button v-if="!preview" :to="{name: 'order-setup-start'}" small>{{$t('menu.errors.menuUnavailable.action')}}</n-button>
          </div>
          <div v-else>
            <p>{{$t('menu.errors.unknown.message')}}</p>
          </div>
        </n-alert>
      </n-container>
    </template>

    <!-- Jump links button -->
    <n-button slot="floating-content" v-if="ready && is_menu_root" @click.native.stop="show_jump_links = true" secondary small fixed bottom right style="z-index: 1;" v-track="{'jump links FAB': ''}">
      Menu
    </n-button>

    <!-- Jump links full-screen dialog -->
    <n-dialog slot="floating-content" v-model="show_jump_links" fullscreen overlap-app-header>
      <n-page pattern-bg class="yellow" overlap-app-header>
        <n-container>
          <n-ordering-menu-jump-links :menuListItems="menuItemChildren" @selected="jumpToMenuItem($event)"></n-ordering-menu-jump-links>
        </n-container>
      </n-page>
    </n-dialog>

  </n-page>
</template>

<script src="./menu-item-listing.js"></script>