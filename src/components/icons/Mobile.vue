<script setup lang="ts">
const props = defineProps<{
  stroke: string
}>()
</script>

<template>
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M15 16.875L15 3.125C15 2.43464 14.4404 1.875 13.75 1.875L6.25 1.875C5.55964 1.875 5 2.43464 5 3.125L5 16.875C5 17.5654 5.55964 18.125 6.25 18.125H13.75C14.4404 18.125 15 17.5654 15 16.875Z"
      :stroke="props.stroke"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path d="M7.5 4.375H12.5" :stroke="props.stroke" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>
