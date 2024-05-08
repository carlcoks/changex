<script setup lang="ts">
const props = defineProps<{
  stroke: string
}>()
</script>

<template>
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M7.5 18.75L8.75 12.5L3.75 10.625L12.5 1.25L11.25 7.5L16.25 9.375L7.5 18.75Z"
            :stroke="props.stroke"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
</template>
