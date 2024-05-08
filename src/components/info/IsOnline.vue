<script setup lang="ts">
const props = defineProps<{
    online: boolean
}>()

const onlineStyle = {
    backgroundColor: '#30DE61',
    border: '3px',
    borderColor: '#30DE614D',
    borderStyle: 'solid'
}

const onlineStyleIn = {
    backgroundColor: '#30DE61'
}

const onlineStyleBg = {
    backgroundColor: 'rgba(48, 222, 97, 0.3)'
}

const offlineStyleIn = {
    backgroundColor: '#EF4B27'
}

const offlineStyleBg = {
    backgroundColor: 'rgba(239, 75, 39, 0.3)'
}
</script>

<template>
    <div class="tw-flex tw-flex-col tw-justify-center tw-items-center tw-w-[12px] tw-h-[12px] tw-rounded-full" :style="props.online ? onlineStyleBg : offlineStyleBg">
        <div class="tw-w-[6px] tw-h-[6px] tw-rounded-full" :style="props.online ? onlineStyleIn : offlineStyleIn"></div>
    </div>
</template>
