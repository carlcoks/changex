<script setup lang="ts">
import { getCurrentInstance, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { logout } from '@/api'
import RenderOn from '@/components/utils/RenderOn.vue'
import Rate from '@/components/info/Rate.vue'
import Avatar from '../../user/Avatar/Avatar.vue'
import ReloadBtn from '../ReloadBtn/ReloadBtn.vue'

/** Used for long polling requests to update user data **/
let interval: number | undefined

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const $router = useRouter()

const props = defineProps<{
    title: string
}>()

function exit() {
    logout().then(() => {
        console.log('logout')
        $router.push('/')
    })
}

const emit = defineEmits<{
    (e: 'reload', reload: boolean): void
}>()

function reload() {
    emit('reload', true)
}

function hasReloadListener() {
    return !!getCurrentInstance()?.vnode.props?.onReload
}

onMounted(() => {
    userStore.fetchUserInfo() // First request
    interval = setInterval(() => userStore.fetchUserInfo(), 300000)
})

onUnmounted(() => {
    clearInterval(interval)
})
</script>

<template>
    <header class="tw-flex tw-justify-between tw-items-center tw-w-full tw-mb-6">
        <span class="dark:tw-text-light tw-text-2xl">{{ props.title }}</span>
        <RenderOn :px="1280">
            <section class="tw-flex tw-items-center">
                <div class="tw-flex tw-items-center tw-gap-x-4">
                    <Rate />
                    <div class="tw-flex tw-gap-x-2">
                        <div class="tw-flex tw-flex-col">
                            <span v-if="userInfo && userInfo?.maskedToken" class="tw-text-[15px] dark:tw-text-light">{{ userInfo?.maskedToken }}</span>
                            <span v-else class="dark:tw-text-light">*********</span>
                            <span
                                class="tw-self-end tw-text-[#04B6F5] tw-text-[10px] tw-cursor-pointer tw-select-none"
                                @click="exit"
                            >
                                Выйти
                            </span>
                        </div>
                        <div><Avatar /></div>
                    </div>
                </div>
            </section>
        </RenderOn>
        <RenderOn :px-min="320" :px-max="1279">
            <div v-if="hasReloadListener()" @click="reload">
                <ReloadBtn />
            </div>
        </RenderOn>
    </header>
</template>
