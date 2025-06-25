<template>
    <Transition
        mode="out-in"
        enter-active-class="transition ease-out duration-200 motion-reduce:transition-none"
        enter-from-class="opacity-0 transform translate-y-2"
        enter-to-class="opacity-100 transform translate-y-0"
        leave-active-class="transition ease-in duration-200 motion-reduce:transition-none"
        leave-from-class="opacity-100 transform translate-y-0"
        leave-to-class="opacity-0 transform translate-y-2"
    >
        <div :class="`w-${size} h-${size}`" v-if="loading">
            <NSpinner class="w-full h-full"/>
        </div>
        <slot v-else>Loading</slot>
    </Transition>
</template>

<script setup lang="ts">
import { NSpinner } from 'nandos-core-ui-v2';

withDefaults(defineProps<{
    loading: boolean,
    size?: number // tailwind number system, E.g 2 will be w-2 & h-2
}>(), {
    loading: false,
    size: 4
});
</script>