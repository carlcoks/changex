<script setup lang="ts">
import { ref } from 'vue'
import Header from '../components/common/Header/Header.vue'
import DisputList from '../components/common/DisputList/DisputList.vue'

const onDataReload = ref(false)

function setReload(flag: boolean) {
    onDataReload.value = false
    setTimeout(() => {onDataReload.value = flag}, 500)
}
</script>

<template>
    <Header title="Диспуты" @reload="setReload" />
    <section class="tw-flex tw-flex-col">
        <DisputList :reload="onDataReload" />
    </section>
</template>
