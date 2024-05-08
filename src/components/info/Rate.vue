<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
</script>

<template>
    <div class="tw-flex tw-w-fit tw-h-fit tw-bg-[#04B6F50D] dark:tw-bg-dark-panel tw-rounded-lg">
        <div class="tw-flex tw-flex-col tw-px-3 sm:tw-gap-y-1 md:tw-gap-y-0 min-lg::tw-gap-y-0 min-lg:tw-py-1 sm:tw-py-[2px] md:tw-py-[2px]
                    sm:tw-leading-[10px] md:tw-leading-[10px] lg:tw-items-start sm:tw-items-center md:tw-items-center"
        >
            <span class="tw-text-[10px] tw-text-gray-500 dark:tw-text-light">Курс Garantex</span>
            <span v-if="userInfo && userInfo.exchangeRateGarantex" class="tw-text-[13px] dark:tw-text-light">USDT/RUB: {{ userInfo.exchangeRateGarantex }} RUB</span>
            <span v-else class="tw-text-[13px] dark:tw-text-light">USDT/RUB: --- RUB</span>
        </div>
        <div
            class="tw-self-center tw-h-[29px] tw-border-0 tw-border-r-2 tw-border-solid tw-border-r-gray"
        ></div>
        <div class="tw-flex tw-flex-col tw-px-3 sm:tw-gap-y-1 min-lg:tw-py-1 sm:tw-py-[2px] md:tw-py-[2px]
                    sm:tw-leading-[10px] md:tw-leading-[10px] lg:tw-items-start sm:tw-items-center md:tw-items-center"
        >
            <span class="tw-text-[10px] tw-text-gray-500 dark:tw-text-light">Курс Обмена</span>
            <span v-if="userInfo && userInfo.exchangeRate" class="tw-text-[13px] dark:tw-text-light">USDT/RUB: {{ userInfo.exchangeRate }} RUB</span>
            <span v-else class="tw-text-[13px] dark:tw-text-light">USDT/RUB: --- RUB</span>
        </div>
    </div>
</template>
