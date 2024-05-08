<script setup lang="ts">
import { ref } from 'vue'
import Header from '../components/common/Header/Header.vue'
import PaymentList from '../components/common/PaymentList/PaymentList.vue'

const onDataReload = ref(false)

function setReload(flag: boolean) {
    onDataReload.value = false
    setTimeout(() => {onDataReload.value = flag}, 500)
}
</script>

<template>
    <Header title="Платежи" @reload="setReload" />
    <section class="tw-flex tw-flex-col">
        <PaymentList :reload="onDataReload" />
    </section>
</template>
