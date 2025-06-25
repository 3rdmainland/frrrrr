<template>
  <n-dialog v-model="showDialog" :persistent="persistent" class="system-messaging">
    <n-ordering-menu-tile v-if="category && !category.isEmpty" :data="category" class="fill-height" />
  </n-dialog>
</template>

<script src="./system-messaging.js"></script>

<style lang="scss">
  .dialog.system-messaging {
    width: 80vw;
    height: 60vh;
  }
</style>