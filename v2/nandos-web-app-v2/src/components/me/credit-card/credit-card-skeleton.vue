<template>
  <article 
    class="w-full bg-nandos-black px-4 py-2 rounded-md flex flex-col gap-2 border-1 border-nandos-black-700"
    :aria-hidden="loading"
  >
    <slot></slot>

    <p :class="['col-span-2 tracking-wider h-6', (loading) ? loadingClass : '']">
      <slot name="card-number"></slot>
    </p>

    <div class="flex items-center justify-between">
      <p class="flex flex-col gap-1 flex-1 max-w-1/2">
        <span :class="['text-sm text-nandos-fresh-white-800 h-5', (loading) ? loadingClass : '']">
          <slot name="card-expiry-title"></slot>
        </span>
        <span :class="['h-6', (loading) ? loadingClass : '']">
          <slot name="card-expiry"></slot>
        </span>
      </p>

      <div :class="['size-12', (loading) ? loadingClass : '']">
        <slot name="card-img"></slot>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
defineEmits(['delete-card']);

defineProps<{
  loading?: boolean
}>();

const loadingClass = 'bg-[#111] rounded-sm motion-safe:animate-pulse';
</script>