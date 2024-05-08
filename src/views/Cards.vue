<script setup lang="ts">
import { ref } from 'vue'
import Header from '../components/common/Header/Header.vue'
import CardList from '../components/common/CardList/CardList.vue'

const onDataReload = ref(false)

function setReload(flag: boolean) {
    onDataReload.value = false
    setTimeout(() => {onDataReload.value = flag}, 500)
}
</script>

<template>
    <Header title="Банковские карты" @reload="setReload" />
    <section class="tw-flex tw-flex-col">
        <CardList :reload="onDataReload" />
    </section>
</template>
