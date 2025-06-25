<template>
    <div class="flex max-[23.75rem]:flex-col sm:flex-row gap-4" :aria-hidden="loading">
        <div class="w-38 h-[95px] self-center rounded-md" :class="[loading && loadingClass]">
            <slot name="image"></slot>
        </div>

        <dl class="flex-1 text-xs md:text-sm grid grid-cols-[60px_1fr] justify-items-start gap-1">
            <!-- Balance -->
            <dt :class="[loading && loadingTiles]">
                <slot name="balance-title"></slot>
            </dt>
            <dd class="justify-self-end font-bold text-base" :class="[loading && loadingTiles]">
                <slot name="balance-value"></slot>
            </dd>
            
            <!-- Issued Amount -->
            <dt class="text-nandos-fresh-white-800" :class="[loading && loadingTiles]">
                <slot name="issued-amount-title"></slot>
            </dt>
            <dd class="justify-self-end" :class="[loading && loadingTiles]">
                <slot name="issued-amount-value"></slot>
            </dd>
            
            <!-- Expires -->
            <dt class="text-nandos-fresh-white-800" :class="[loading && loadingTiles]">
                <slot name="expires-title"></slot>
            </dt>
            <dd class="justify-self-end" :class="[loading && loadingTiles]">
                <slot name="expires-value"></slot>
            </dd>
            
            <!-- wiCode -->
            <dt class="text-nandos-fresh-white-800" :class="[loading && loadingTiles]">
                <slot name="wiCode-title"></slot>
            </dt>
            <dd class="justify-self-end" :class="[loading && loadingTiles]">
                <slot name="wiCode-value"></slot>
            </dd>
        </dl>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    loading?: boolean
}>();

const loadingClass = 'bg-[#111] rounded-sm motion-safe:animate-pulse';
const loadingTiles = `${loadingClass} w-full`;
</script>
