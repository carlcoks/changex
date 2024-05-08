<script setup lang="ts">
const props = defineProps<{
    text: string,
    class?: string
}>()
</script>

<template>
  <div class="tw-flex tw-gap-x-2 tw-bg-[#FA3E3E0D] tw-min-w-[300px] tw-max-w-[440px] tw-p-3 tw-rounded-xl" :class="props.class">
    <span>
        <svg width="25" height="25" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z"
            stroke="#EF4B27"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
        <path d="M10 6.25V10.625" stroke="#EF4B27" stroke-linecap="round" stroke-linejoin="round" />
        <path
            d="M10 14.0625C10.3452 14.0625 10.625 13.7827 10.625 13.4375C10.625 13.0923 10.3452 12.8125 10 12.8125C9.65482 12.8125 9.375 13.0923 9.375 13.4375C9.375 13.7827 9.65482 14.0625 10 14.0625Z"
            fill="#EF4B27"
        />
        </svg>
    </span>

    <span class="tw-text-[#EF4B27] tw-text-[13px]">
        {{ props.text }}
    </span>
  </div>
</template>
