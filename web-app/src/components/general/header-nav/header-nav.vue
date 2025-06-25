<template>
  <nav class="header-nav">
    <span v-for="(item, idx) in links" :key="idx + item.title" @mouseover="highlighted = item" @mouseout="highlighted = null" >
      <n-router-link :to="item.isExternal ? item.path : item.internalPath" :external="item.isExternal" class="header-nav__nav-item" v-track="{'header navigation': item.title}">
        {{item.title}}
      </n-router-link>
      <nav v-if="item.children" v-show="highlighted == item" class="header-nav__sub-nav">
        <n-router-link v-for="child in item.children" :to="child.isExternal ? child.path : child.internalPath" :external="child.isExternal" :key="child.title" class="sub-nav__item" v-track="{'header sub-navigation': child.title}">{{child.title}}</n-router-link>
      </nav>
    </span>
  </nav>
</template>

<script src="./header-nav.js"></script>