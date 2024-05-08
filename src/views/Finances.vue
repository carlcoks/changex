<script setup lang="ts">
import { ref } from 'vue'
import Header from '../components/common/Header/Header.vue'
import FinancesTable from '../components/common/FinancesTable/FinancesTable.vue'

const onDataReload = ref(false)

function setReload(flag: boolean) {
    onDataReload.value = false
    setTimeout(() => {onDataReload.value = flag}, 500)
}
</script>

<template>
    <Header title="Финансы" @reload="setReload" />
    <section class="tw-flex tw-flex-col">
        <FinancesTable :reload="onDataReload" />
    </section>
</template>