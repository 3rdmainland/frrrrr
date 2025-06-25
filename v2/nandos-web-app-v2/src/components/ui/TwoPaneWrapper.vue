<template>
  <div class="flex gap-10 h-full w-full">
    <!-- only renders if you pass a #sidebar slot -->
    <aside v-if="$slots.sidebar" class="w-2/6 flex flex-col h-full">
      <PageHeaderComponent class="flex-shrink-0" />
      <div class="flex-1 overflow-y-auto  px-2">
        <slot name="sidebar" />
      </div>
      <div v-if="$slots.footer" class="flex-shrink-0">
        <slot name="footer" />
      </div>
    </aside>

    <!-- main always takes the rest of the space -->
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import PageHeaderComponent from '@/components/ui/PageHeaderComponent.vue'
</script>
