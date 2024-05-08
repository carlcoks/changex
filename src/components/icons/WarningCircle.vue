<script setup lang="ts">
const props = defineProps<{
  stroke: string
}>()
</script>

<template>
    <svg width="48" height="49" viewBox="0 0 48 49" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M24 42.5C33.9411 42.5 42 34.4411 42 24.5C42 14.5589 33.9411 6.5 24 6.5C14.0589 6.5 6 14.5589 6 24.5C6 34.4411 14.0589 42.5 24 42.5Z"
            :stroke="props.stroke"
            stroke-width="2"
            stroke-miterlimit="10"
        />
        <path
            d="M24 15.5V26"
            :stroke="props.stroke"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
        <path
            d="M24 35C25.2426 35 26.25 33.9926 26.25 32.75C26.25 31.5074 25.2426 30.5 24 30.5C22.7574 30.5 21.75 31.5074 21.75 32.75C21.75 33.9926 22.7574 35 24 35Z"
            fill="#EF4B27"
        />
    </svg>
</template>
