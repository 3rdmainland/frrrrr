<template>
  <nav class="py-4">
    <h3>Jump to</h3>
    <n-list dense>
      <n-list-item v-for="(item, index) in menuListItems" :key="item.id">
        <n-list-tile @click.native="$emit('selected', item)" v-track="{'jump-link': item.name}">
          <n-list-tile-content>
            <n-list-tile-title v-html="item.name"/>
          </n-list-tile-content> 
        </n-list-tile>
      </n-list-item>

      <!-- PDF Menu Downloads -->
      <template v-if="downloadableMenus && downloadableMenus.length">
        <hr style="margin: 0.5em 0;">
        <n-list-item v-for="(menu, idx) in downloadableMenus" :key="`${menu.path}-${idx}`">
          <n-list-tile download :to="menu.path" target="_blank">
            <n-list-tile-action narrow>
              <n-icon>download</n-icon>
            </n-list-tile-action>
            <n-list-tile-content>
              <n-list-tile-title>{{menu.title}}</n-list-tile-title>
            </n-list-tile-content>
          </n-list-tile>
        </n-list-item>
      </template>
    </n-list>
  </nav>
</template>

<script src="menu-jump-links.js"></script>