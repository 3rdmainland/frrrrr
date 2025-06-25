<template>
  <section class="text-xs-center scrollable scrollable-x hidden-scrollbar-xs hidden-scrollbar-sm" ref="scrollContainer" style="width: 100%;padding-right: 3em">
    <n-button slot="floating-content"  @click="scrollDirection($event,false)" v-if="hasItemsLeft" floating absolute small style="left:0;background-color: black !important;margin-left: -1px;border-radius: 0;z-index: 1">
      <n-icon>arrow_left</n-icon>
    </n-button>
    <n-button v-for="quickLink in quickLinks" :to="getCategoryUrl(quickLink.id, true, $route, preview)"
              :key="quickLink.id" small flat active-class="is-active" class="quick-link"
              v-track="{'quick link clicked': quickLink.name}">
      {{ quickLink.name }}
      <n-edit-menu-entity-link slot="rootLevel" v-if="preview" :item="quickLink"/>
    </n-button>
    <n-button slot="floating-content" @click="scrollDirection($event)" v-if="hasItemsRight"  floating absolute small style="right:0;background-color: black !important;margin-right: -1px;;border-radius: 0;z-index: 1">
      <n-icon>arrow_right</n-icon>
    </n-button>
  </section>
</template>

<script src="./menu-quick-links.js"></script>