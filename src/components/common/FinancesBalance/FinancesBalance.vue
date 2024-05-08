<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import FinancesBalanceIcon from '../../icons/FinancesBalanceIcon.vue'
import FinancesBalanceFreezeIcon from '../../icons/FinancesBalanceFreezeIcon.vue'
import Wallet from '../../icons/Wallet.vue'
import Freeze from '../../icons/Freeze.vue'
import FinancesDialog from '../FinancesDialog/FinancesDialog.vue'
import ReloadBtn from '@/components/common/ReloadBtn/ReloadBtn.vue'
import RenderOn from '@/components/utils/RenderOn.vue'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const dialogOpen = ref(false)

function closeDialog(close: boolean) {
    dialogOpen.value = close
}

const emit = defineEmits<{
    (e: 'reload', reload: boolean): void
}>()

function reload() {
    emit('reload', true)
}

onMounted(() => {
    userStore.getWallet()
})
</script>

<template>
    <RenderOn :px="1280">
        <v-card class="tw-w-full tw-h-[132px] !tw-rounded-2xl !tw-p-[24px] tw-mb-6 dark:tw-bg-dark-panel">
            <section class="tw-flex tw-justify-between tw-items-center">
                <section class="tw-flex tw-items-center tw-gap-x-8">
                    <section class="tw-flex tw-items-center tw-gap-x-4">
                        <FinancesBalanceIcon />
                        <div class="tw-flex tw-flex-col tw-leading-7">
                            <span class="tw-text-[13px] tw-text-[#AEB7C1]">Баланс</span>
                            <span>
                                <span v-if="userInfo && userInfo.balance !== undefined" class="tw-text-[30px] tw-text-[#2B3A4C] dark:tw-text-light tw-font-bold">{{ userInfo.balance.toFixed(2) }}</span>
                                <v-skeleton-loader v-else type="text" width="100"></v-skeleton-loader>
                                <span class="tw-text-[16px] tw-text-[#AEB7C1]"> USDT</span>
                            </span>
                            <span class="tw-text-[13px] tw-text-[#677483] dark:tw-text-light">~{{ userInfo.balanceRUR }} RUB</span>
                        </div>
                    </section>
                    <section class="tw-flex tw-items-center tw-gap-x-4">
                        <FinancesBalanceFreezeIcon />
                        <div class="tw-flex tw-flex-col tw-leading-7">
                            <span class="tw-text-[13px] tw-text-[#AEB7C1]">Замороженно средств</span>
                            <span>
                                <span v-if="userInfo && userInfo.openedOrderSumUSD !== undefined" class="tw-text-[30px] tw-text-[#2B3A4C] dark:tw-text-light tw-font-bold">{{ userInfo.openedOrderSumUSD.toFixed(2) }}</span>
                                <v-skeleton-loader v-else type="text" width="100"></v-skeleton-loader>
                                <span class="tw-text-[16px] tw-text-[#AEB7C1]"> USDT</span>
                            </span>
                            <span class="tw-text-[13px] tw-text-[#677483] dark:tw-text-light">~{{ userInfo.openedOrderSumRUR }} RUB</span>
                        </div>
                    </section>
                </section>
                <section class="tw-flex tw-items-center tw-gap-x-4">
                    <v-btn class="!tw-rounded-xl !tw-min-w-[52px] min-lg:!tw-w-[172px] min-lg:!tw-h-[52px]
                                sm:!tw-w-[52px] md:!tw-w-[52px] sm:!tw-h-[52px] md:!tw-h-[52px]
                                hover:!tw-shadow-[0px_10px_18px_2px_rgba(4,182,245,0.2)]"
                            color="#04B6F5"
                            variant="elevated"
                            @click="dialogOpen = !dialogOpen"
                    >
                        <template v-slot:prepend>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3.125 10H16.875" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M10 3.125V16.875" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </template>
                        <span class="sm:tw-hidden md:tw-hidden min-lg:tw-inline tw-text-white tw-text-[16px] tw-normal-case tw-tracking-normal tw-leading-4">Пополнить</span>
                    </v-btn>
                    <div class="sm:tw-hidden min-lg:tw-block" @click="reload"><ReloadBtn /></div>
                </section>
            </section>
        </v-card>
    </RenderOn>
    <RenderOn :px-min="320" :px-max="839">
        <v-card class="tw-flex tw-flex-col tw-w-full !tw-rounded-2xl !tw-p-[10px] tw-mb-6 dark:tw-bg-dark-panel">
            <section class="tw-flex tw-justify-between tw-items-center">
                <section class="tw-flex tw-items-center tw-gap-x-4">
                        <Wallet />
                        <div class="tw-flex tw-flex-col tw-leading-7">
                            <span class="tw-text-[13px] tw-text-[#AEB7C1]">Баланс</span>
                            <span>
                                <span v-if="userInfo && userInfo.balance !== undefined" class="tw-text-[30px] tw-text-[#2B3A4C] dark:tw-text-light tw-font-bold">{{ userInfo.balance.toFixed(2) }}</span>
                                <v-skeleton-loader v-else type="text" width="100"></v-skeleton-loader>
                                <span class="tw-text-[16px] tw-text-[#AEB7C1]"> USDT</span>
                            </span>
                            <span class="tw-text-[13px] tw-text-[#677483] dark:tw-text-light">~{{ userInfo.balanceRUR }} RUB</span>
                        </div>
                    </section>
                <v-btn class="!tw-rounded-xl !tw-min-w-[52px] min-lg:!tw-w-[172px] min-lg:!tw-h-[52px]
                                sm:!tw-w-[52px] md:!tw-w-[52px] sm:!tw-h-[52px] md:!tw-h-[52px]
                                hover:!tw-shadow-[0px_10px_18px_2px_rgba(4,182,245,0.2)]"
                            color="#04B6F5"
                            variant="elevated"
                            @click="dialogOpen = !dialogOpen"
                    >
                        <template v-slot:prepend>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3.125 10H16.875" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M10 3.125V16.875" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </template>
                        <span class="sm:tw-hidden md:tw-hidden min-lg:tw-inline tw-text-white tw-text-[16px] tw-normal-case tw-tracking-normal tw-leading-4">Пополнить</span>
                    </v-btn>
            </section>
            <section class="tw-flex tw-justify-between tw-items-center tw-border-t-2 tw-border-l-0 tw-border-r-0 tw-border-b-0 tw-border-[#E0E4E8] tw-border-dashed tw-pt-1 tw-mt-2">
                <section class="tw-flex tw-items-center tw-gap-x-4">
                        <Freeze />
                        <div class="tw-flex tw-flex-col tw-leading-7">
                            <span class="tw-text-[13px] tw-text-[#AEB7C1]">Замороженно средств</span>
                            <span>
                                <span v-if="userInfo && userInfo.openedOrderSumUSD !== undefined" class="tw-text-[30px] tw-text-[#2B3A4C] dark:tw-text-light tw-font-bold">{{ userInfo.openedOrderSumUSD.toFixed(2) }}</span>
                                <v-skeleton-loader v-else type="text" width="100"></v-skeleton-loader>
                                <span class="tw-text-[16px] tw-text-[#AEB7C1]"> USDT</span>
                            </span>
                            <span class="tw-text-[13px] tw-text-[#677483] dark:tw-text-light">~{{ userInfo.openedOrderSumRUR }} RUB</span>
                        </div>
                    </section>
            </section>
        </v-card>
    </RenderOn>
    <FinancesDialog :open="dialogOpen" @close="closeDialog"/>
</template>
