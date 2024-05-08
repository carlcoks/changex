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
    <path d="M15 5L5 15" stroke="#30DE61" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M13.125 15H5V6.875" stroke="#30DE61" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>
