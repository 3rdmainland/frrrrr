<template>
  <div
    @click="$emit('select', type)"
    class="w-full max-w-sm rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:ring-2 hover:ring-red-500 shadow-lg hover:shadow-xl bg-white"
  >
    <!-- Card Header with dynamic background -->
    <div
      class="h-32 flex items-center justify-center relative overflow-hidden"
      :style="{ backgroundColor: theme.bgColor }"
    >
      <div class="-rotate-4 flex flex-col items-center justify-center animate-pulse-subtle">
        <h2 class="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">
          {{ title }}
        </h2>
        <p
          class="rounded-md py-0.5 px-2 text-sm text-white font-medium"
          :style="{ backgroundColor: theme.accentColor }"
        >
          {{ subtitle }}
        </p>
      </div>
    </div>

    <!-- Card Footer with note -->
    <div
      v-if="note"
      class="bg-white py-4 px-6 md:px-12 min-h-[3rem] flex items-center justify-center"
    >
      <p class="text-sm text-black text-center leading-relaxed">
        {{ note }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type: 'DELIVERY' | 'COLLECTION' | 'EAT_IN'
  title: string
  subtitle: string
  theme: {
    bgColor: string
    accentColor: string
  }
  note?: string
}

defineProps<Props>()
defineEmits<{
  select: [type: Props['type']]
}>()
</script>

<style>
/* Only need this for the subtle animation */
@keyframes pulse-subtle {
  0%,
  100% {
    transform: rotate(-4deg) translateY(0);
  }
  50% {
    transform: rotate(-4deg) translateY(-3px);
  }
}

.animate-pulse-subtle {
  animation: pulse-subtle 3s ease-in-out infinite;
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .animate-pulse-subtle {
    animation: none;
  }
}
</style>
