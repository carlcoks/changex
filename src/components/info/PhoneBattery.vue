<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = defineProps<{
    percentValue: number
}>()

const currentBatteryColor = ref('')
const currentBatteryIndicates = ref(['']) // SVG sticks battery level to render
const currentBatteryIndicateCount = ref(0)

const batteryColors = {
    green: '#30DE61',
    yellow: '#EFC327',
    red: '#EF4B27'
}

function setCurrent(percent: number) {
    switch (true) {
        case (percent >= 75):
            currentBatteryColor.value = batteryColors.green
            currentBatteryIndicates.value = [
                'M10.5 9.84375V5.15625',
                'M8.34375 9.84375V5.15625',
                'M6.1875 9.84375V5.15625',
                'M4.03125 9.84375V5.15625'
            ]
            currentBatteryIndicateCount.value = 4
            break
        case (percent >= 60 && percent <= 74):
            currentBatteryColor.value = batteryColors.green
            currentBatteryIndicates.value = [
                'M8.34375 9.84375V5.15625',
                'M6.1875 9.84375V5.15625',
                'M4.03125 9.84375V5.15625'
            ]
            currentBatteryIndicateCount.value = 3
            break
        case (percent >= 40 && percent <= 59):
            currentBatteryColor.value = batteryColors.yellow
            currentBatteryIndicates.value = [
                'M6.1875 9.84375V5.15625',
                'M4.03125 9.84375V5.15625'
            ]
            currentBatteryIndicateCount.value = 2
            break
        case (percent >= 20 && percent <= 39):
            currentBatteryColor.value = batteryColors.yellow
            currentBatteryIndicates.value = [
                'M6.1875 9.84375V5.15625',
                'M4.03125 9.84375V5.15625'
            ]
            currentBatteryIndicateCount.value = 2
            break
        case (percent >= 10 && percent <= 19):
            currentBatteryColor.value = batteryColors.red
            currentBatteryIndicates.value = [
                'M4.03125 9.84375V5.15625'
            ]
            currentBatteryIndicateCount.value = 1
            break
        case (percent <= 9):
            currentBatteryColor.value = batteryColors.red
            currentBatteryIndicates.value = []
            currentBatteryIndicateCount.value = 0
            break
        default:
            break;
    }
}

onMounted(() => {
    setCurrent(props.percentValue)
})
</script>

<template>
    <div class="tw-flex tw-items-center tw-gap-x-1">
        <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.5312 5.625V9.375" :stroke="currentBatteryColor" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12.6562 10.7812V4.21875C12.6562 3.70098 12.2365 3.28125 11.7188 3.28125L2.8125 3.28125C2.29473 3.28125 1.875 3.70098 1.875 4.21875V10.7812C1.875 11.299 2.29473 11.7188 2.8125 11.7188H11.7188C12.2365 11.7188 12.6562 11.299 12.6562 10.7812Z" :stroke="currentBatteryColor" stroke-linecap="round" stroke-linejoin="round"/>
            <path
                v-for="barItem in currentBatteryIndicates"
                :key="barItem"
                :d="barItem"
                :stroke="currentBatteryColor"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
        <span>{{ props.percentValue }}%</span>
    </div>
</template>
