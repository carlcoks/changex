<script setup lang="ts">
const props = withDefaults(defineProps<{
  width?: number,
  height?: number
}>(), {
  width: 20,
  height: 20
})
</script>

<template>
  <svg :width="props.width" :height="props.height" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 15L15 5" stroke="#EF4B27" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M6.875 5H15V13.125" stroke="#EF4B27" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>
