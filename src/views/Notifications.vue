<script setup lang="ts">
import { ref } from 'vue'
import Header from '../components/common/Header/Header.vue'
import NotificationsList from '../components/common/NotificationsList/NotificationsList.vue'

const onDataReload = ref(false)

function setReload(flag: boolean) {
    onDataReload.value = false
    setTimeout(() => {onDataReload.value = flag}, 500)
}
</script>

<template>
    <Header title="Уведомления" @reload="setReload" />
    <section class="tw-flex tw-flex-col">
        <NotificationsList :reload="onDataReload" />
    </section>
</template>
