<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { RouterView, useRouter, type RouteLocationRaw } from 'vue-router'
import { getCookie, getNavItemStroke } from '@/utils'
import type { TMenuToggleOptions } from './types'
import { useUserStore } from './stores/user'
import { usePaymentsStore } from '@/stores/payments'
import { storeToRefs } from 'pinia'
import { logout } from '@/api'
import { useTheme } from 'vuetify'
import RenderOn from './components/utils/RenderOn.vue'
import ArrowLeft from './components/icons/ArrowLeft.vue'
import ArrowRight from './components/icons/ArrowRight.vue'
import Squares from './components/icons/Squares.vue'
import FinancesIcon from './components/icons/FinancesIcon.vue'
import CreditCard from './components/icons/CreditCard.vue'
import ArrowsLeftRight from './components/icons/ArrowsLeftRight.vue'
import Warning from './components/icons/Warning.vue'
import PayoffIcon from './components/icons/PayoffIcon.vue'
import Mobile from './components/icons/Mobile.vue'
import NotificationsIcon from './components/icons/NotificationsIcon.vue'
import Menu from './components/icons/Menu.vue'
import Close from './components/icons/Close.vue'
import Avatar from './components/user/Avatar/Avatar.vue'
import Rate from './components/info/Rate.vue'
import ThemeSwitcher from './components/user/ThemeSwitcher/ThemeSwitcher.vue'

const $router = useRouter()

const vTheme = useTheme()
const theme = ref(localStorage.getItem('theme'))

const navOptions = reactive({
    drawer: true,
    rail: true,
    minWidth: 74,
    maxWidth: 297
})

function toggleMenu(options?: TMenuToggleOptions) {
    if (options?.mobileItem) {
        navOptions.drawer = !navOptions.drawer
        $router.push(options?.routerLink as string)
    } else {
        navOptions.drawer = !navOptions.drawer
    }
}

const navItems = ref([
    {
        id: 0,
        title: 'Дашборд',
        path: '/dashboard',
        name: 'dashboard',
        badge: false,
        icon: Squares 
    },
    {
        id: 1,
        title: 'Финансы',
        path: '/finances',
        name: 'finances',
        badge: false,
        icon: FinancesIcon
    },
    {
        id: 2,
        title: 'Банковские карты',
        path: '/cards',
        name: 'cards',
        badge: false,
        icon: CreditCard
    },
    {
        id: 3,
        title: 'Платежи',
        path: '/payments',
        name: 'payments',
        badge: false,
        icon: ArrowsLeftRight
    },
    {
        id: 4,
        title: 'Диспуты',
        path: '/disputs',
        name: 'disputs',
        badge: true,
        icon: Warning
    },
    {
        id: 5,
        title: 'Откупы',
        path: '/bids',
        name: 'bids',
        badge: false,
        icon: PayoffIcon
    },
    {
        id: 6,
        title: 'Устройства',
        path: '/devices',
        name: 'devices',
        badge: false,
        icon: Mobile
    },
    {
        id: 7,
        title: 'Уведомления',
        path: '/notifications',
        name: 'notifications',
        badge: false,
        icon: NotificationsIcon
    }
])

function exit() {
    logout().then(() => {
        console.log('logout')
        navOptions.drawer = !navOptions.drawer
        navOptions.rail = !navOptions.rail
        $router.push('/')
    })
}

/** Used for long polling requests to update badges data **/
let interval: number | undefined

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const paymentsStore = usePaymentsStore()
const { awaitingItems } = storeToRefs(paymentsStore)

onMounted(() => {
    if (getCookie('changexlogin') && localStorage.getItem('accessToken')) {
        paymentsStore.fetchAwaitingDisputesCount() // first request before counter initialized
        interval = setInterval(() => paymentsStore.fetchAwaitingDisputesCount(), 60000)
    }

    if (!localStorage.getItem('theme')) {
        localStorage.setItem('theme', 'light')
    }

    const theme = localStorage.getItem('theme') || 'light'

    document.documentElement.classList.add(theme)
    vTheme.global.name.value = theme
})

onUnmounted(() => {
    clearInterval(interval)
})
</script>

<template>
    <div class="tw-flex">
        <v-layout class="tw-absolute tw-w-full" :class="{ 'tw-p-[24px]': $route.name !== 'login' }">
            <RenderOn :px="1280">
                <v-navigation-drawer
                    v-if="$route.name !== 'login'"
                    class="tw-rounded-2xl !tw-left-[20px] !tw-top-[24px] !tw-max-h-[95%] !tw-translate-x-0 light:!tw-bg-light-panel dark:!tw-bg-dark-panel"
                    :width="navOptions.maxWidth"
                    :rail-width="navOptions.minWidth"
                    v-model="navOptions.drawer"
                    :rail="navOptions.rail"
                >
                    <div class="tw-flex tw-flex-col tw-justify-between tw-p-3 tw-h-full">
                        <div>
                            <div class="tw-flex tw-items-center">
                                <div class="tw-w-[56px] tw-h-[61px]">
                                    <v-img :width="44" :height="47" src="/logo.png"></v-img>
                                </div>
                                <span
                                    v-show="!navOptions.rail"
                                    class="tw-font-bold dark:tw-text-[#ABB2BF] tw-text-2xl tw-ml-3"
                                    >Changeex</span
                                >
                            </div>

                            <v-list density="compact" nav>
                                <template v-for="navItem in navItems" :key="navItem.id">
                                    <v-list-item
                                        :value="navItem.name"
                                        active-color="#F8FCFE"
                                        @click="$router.push(navItem.path)"
                                    >
                                        <template v-slot:prepend>
                                            <v-badge
                                                v-if="
                                                    navItem.badge &&
                                                    navItem.name === 'disputs' &&
                                                    awaitingItems > 0 &&
                                                    navOptions.rail
                                                "
                                                :style="awaitingItems === 0 ? 'visibility: hidden;' : 'visibility: visible;'"
                                                color="#EF4B27"
                                                offset-y="20"
                                                :content="
                                                    awaitingItems >= 10 ? '9+' : awaitingItems
                                                "
                                            >
                                                <component
                                                    :is="navItem.icon"
                                                    v-bind="{
                                                        stroke: getNavItemStroke(
                                                            navItem.name,
                                                            $route.name as string,
                                                            {
                                                                active: '#04B6F5',
                                                                default: '#2B3A4C'
                                                            }
                                                        )
                                                    }"
                                                ></component>
                                            </v-badge>
                                            <component
                                                v-else
                                                :is="navItem.icon"
                                                v-bind="{
                                                    stroke: getNavItemStroke(
                                                        navItem.name,
                                                        $route.name as string,
                                                        { active: '#04B6F5', default: '#2B3A4C' }
                                                    )
                                                }"
                                            ></component>
                                        </template>
                                        <template v-slot:title>
                                            <span
                                                class="tw-ml-2 tw-text-[15px] tw-text-[#2B3A4C] dark:tw-text-[#ABB2BF]"
                                                v-show="!navOptions.rail"
                                                >{{ navItem.title }}</span
                                            >
                                        </template>
                                        <template v-slot:append>
                                            <v-badge
                                                v-if="
                                                    navItem.badge &&
                                                    navItem.name === 'disputs' &&
                                                    awaitingItems > 0 &&
                                                    !navOptions.rail
                                                "
                                                :style="awaitingItems === 0 ? 'visibility: hidden;' : 'visibility: visible;'"
                                                color="#EF4B27"
                                                :content="
                                                    awaitingItems >= 10 ? '9+' : awaitingItems
                                                "
                                                inline
                                            ></v-badge>
                                        </template>
                                    </v-list-item>
                                </template>
                            </v-list>
                        </div>
                        <div class="tw-flex tw-flex-col tw-gap-y-8">
                            <div class="tw-flex tw-items-center tw-gap-x-4 tw-w-full tw-cursor-pointer">
                                <ThemeSwitcher />
                                <p v-if="theme === 'dark'" class="tw-select-none light:tw-text-black dark:tw-text-[#ABB2BF] tw-text-[15px]">Тёмная тема</p>
                                <p v-else class="tw-select-none light:!tw-text-black dark:tw-text-[#ABB2BF] tw-text-[15px]">Светлая тема</p>
                            </div>
                            <div
                                class="tw-flex tw-items-center tw-gap-x-4 tw-w-full tw-cursor-pointer"
                                v-show="!navOptions.rail"
                                @click="navOptions.rail = !navOptions.rail"
                            >
                                <ArrowLeft :stroke="theme === 'dark' ? '#ABB2BF' : '#2B3A4C'" />
                                <p class="tw-select-none dark:tw-text-[#ABB2BF] tw-text-[15px]">Скрыть меню</p>
                            </div>
                            <div
                                class="tw-flex tw-items-center tw-justify-center tw-self-end tw-w-full tw-cursor-pointer"
                                v-show="navOptions.rail"
                                @click="navOptions.rail = !navOptions.rail"
                            >
                                <span><ArrowRight :stroke="theme === 'dark' ? '#ABB2BF' : '#2B3A4C'" /></span>
                            </div>
                        </div>
                    </div>
                </v-navigation-drawer>
            </RenderOn>

            <RenderOn :px-min="320" :px-max="1279">
                <v-app-bar v-if="$route.name !== 'login'" class="dark:!tw-bg-dark-panel" prominent :height="101">
                    <div class="tw-flex tw-flex-col tw-items-center tw-w-[calc(100%-0px)] tw-p-4">
                        <div class="tw-flex tw-justify-between tw-items-center tw-w-full">
                            <div class="tw-flex tw-items-center">
                                <div class="tw-w-[36px] tw-h-[41px]">
                                    <v-img :width="36" :height="41" src="/logo.png"></v-img>
                                </div>
                                <span class="tw-font-bold tw-text-xl tw-ml-3">Changeex</span>
                            </div>
                            <div class="tw-cursor-pointer" @click.stop="toggleMenu()">
                                <Menu v-if="navOptions.drawer" :stroke="theme === 'dark' ? '#ABB2BF' : '#2B3A4C'" />
                                <Close v-else :stroke="theme === 'dark' ? '#ABB2BF' : '#2B3A4C'" />
                            </div>
                        </div>
                        <div class="tw-mt-1">
                            <Rate />
                        </div>
                    </div>
                </v-app-bar>
                <div
                    class="tw-fixed tw-flex tw-flex-col tw-justify-between tw-w-full tw-h-[calc(100vh-101px)] tw-bg-white dark:tw-bg-[#282C34] tw-z-10 tw-left-0 tw-top-[101px] tw-px-8 tw-py-5"
                    v-show="!navOptions.drawer"
                >
                    <v-list class="dark:!tw-bg-dark-panel" density="compact" nav>
                        <template v-for="navItem in navItems" :key="navItem.id">
                            <v-list-item
                                class="tw-h-[68px]"
                                :value="navItem.name"
                                active-color="#F8FCFE"
                                @click.stop="
                                    toggleMenu({ mobileItem: true, routerLink: navItem.path })
                                "
                            >
                                <template v-slot:prepend>
                                    <v-badge
                                        v-if="
                                            navItem.badge &&
                                            navItem.name === 'disputs' &&
                                            awaitingItems > 0 &&
                                            !navOptions.rail
                                        "
                                        :style="awaitingItems === 0 ? 'visibility: hidden;' : 'visibility: visible;'"
                                        color="#EF4B27"
                                        offset-y="20"
                                        :content="awaitingItems >= 10 ? '9+' : awaitingItems"
                                    >
                                        <component
                                            :is="navItem.icon"
                                            v-bind="{
                                                stroke: getNavItemStroke(
                                                    navItem.name,
                                                    $route.name as string,
                                                    { active: '#04B6F5', default: '#2B3A4C' }
                                                )
                                            }"
                                        ></component>
                                    </v-badge>
                                    <component
                                        v-else
                                        :is="navItem.icon"
                                        v-bind="{
                                            stroke: getNavItemStroke(
                                                navItem.name,
                                                $route.name as string,
                                                { active: '#04B6F5', default: '#2B3A4C' }
                                            )
                                        }"
                                    ></component>
                                </template>
                                <template v-slot:title>
                                    <span class="tw-ml-2 tw-text-[15px] tw-text-[#2B3A4C] dark:tw-text-light">{{
                                        navItem.title
                                    }}</span>
                                </template>
                                <template v-slot:append>
                                    <v-badge
                                        v-if="
                                            navItem.badge &&
                                            navItem.name === 'disputs' &&
                                            awaitingItems > 0 &&
                                            !navOptions.drawer
                                        "
                                        :style="awaitingItems === 0 ? 'visibility: hidden;' : 'visibility: visible;'"
                                        color="#EF4B27"
                                        :content="awaitingItems >= 10 ? '9+' : awaitingItems"
                                        inline
                                    ></v-badge>
                                </template>
                            </v-list-item>
                        </template>
                    </v-list>
                    <div class="tw-flex tw-items-center tw-gap-x-4 tw-w-full tw-cursor-pointer">
                                <ThemeSwitcher />
                                <p v-if="theme === 'dark'" class="tw-select-none light:tw-text-black dark:tw-text-[#ABB2BF] tw-text-[15px]">Тёмная тема</p>
                                <p v-else class="tw-select-none light:!tw-text-black dark:tw-text-[#ABB2BF] tw-text-[15px]">Светлая тема</p>
                            </div>
                    <div class="tw-flex tw-w-full tw-justify-between tw-items-center">
                        <div class="tw-flex tw-items-center tw-gap-x-2">
                            <Avatar />
                            <span v-if="userInfo && userInfo?.maskedToken" class="tw-text-[15px]">{{ userInfo?.maskedToken }}</span>
                        </div>
                        <span
                            class="tw-text-[#04B6F5] tw-text-[15px] tw-cursor-pointer tw-select-none"
                            @click="exit"
                            >Выйти</span
                        >
                    </div>
                </div>
            </RenderOn>

            <v-main class="tw-w-full">
                <section :class="{ 'tw-px-4': $route.name !== 'login' }">
                    <RouterView />
                </section>
            </v-main>
        </v-layout>
    </div>
</template>
