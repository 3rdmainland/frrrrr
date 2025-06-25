<template>
  <div class="basket-summary flexbox align-center justify-center">
    <n-button :to="{name: 'basket'}" :active-class="'primary'" exact icon flat has-badge>
      <n-icon large v-badge="badgeConfig" :class="iconClasses">shopping_basket</n-icon>
    </n-button>
  </div>
</template>

<script src="basket-summary.js"></script>
<style lang="scss">
	.basket-summary .btn { color: inherit !important; }
</style>