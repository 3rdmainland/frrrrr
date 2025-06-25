<template>
  <component :is="componentType" :data="componetData" v-bind="$attrs" v-on="$listeners">
    <slot></slot>
  </component>
</template>

<script src="menu-tile.js"></script>