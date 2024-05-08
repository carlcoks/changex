<script setup lang="ts">
    import { ref } from 'vue'
    import { useDeviceWidth } from '../../utils'
    
    const cw = ref(useDeviceWidth().getWidth())

    window.addEventListener('resize', () => {
        cw.value = useDeviceWidth().getWidth()
    })

    const props = defineProps<{
        px?: number,
        pxMin?: number,
        pxMax?: number
    }>()
    
    const condition = (): boolean => {
        if (props.px) {
            return useDeviceWidth().moreThan(cw.value, props.px)
        }

        if (props.pxMin && props.pxMax) {
            return useDeviceWidth().between(cw.value, props.pxMin, props.pxMax)
        }

        return false
    }
</script>
    
<template>
    <slot v-if="condition()"></slot>
</template>
