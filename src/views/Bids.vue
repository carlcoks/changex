<script setup lang="ts">
import { ref } from 'vue'
import Header from '../components/common/Header/Header.vue'
import BidsList from '../components/common/BidsList/BidsList.vue'

const onDataReload = ref(false)

function setReload(flag: boolean) {
    onDataReload.value = false
    setTimeout(() => {onDataReload.value = flag}, 500)
}
</script>

<template>
    <Header title="Откупы" @reload="setReload" />
    <section class="tw-flex tw-flex-col">
        <BidsList :reload="onDataReload" />
    </section>
</template>
