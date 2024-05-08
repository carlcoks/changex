<script setup lang="ts">
import { ref } from 'vue'
import Header from '../components/common/Header/Header.vue'
import DeviceList from '../components/common/DeviceList/DeviceList.vue'

const onDataReload = ref(false)

function setReload(flag: boolean) {
    onDataReload.value = false
    setTimeout(() => {onDataReload.value = flag}, 500)
}
</script>

<template>
    <Header title="Устройства" @reload="setReload" />
    <section class="tw-flex tw-flex-col">
        <DeviceList :reload="onDataReload" />
    </section>
</template>
