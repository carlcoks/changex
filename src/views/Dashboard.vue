<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Header from '../components/common/Header/Header.vue'
import Datepicker from '@vuepic/vue-datepicker'
import type { DatePickerInstance } from "@vuepic/vue-datepicker"
import '@vuepic/vue-datepicker/dist/main.css'
import ArrowsClockwise from '@/components/icons/ArrowsClockwise.vue'
import Lightning from '@/components/icons/Lightning.vue'
import DepositeBalance from '@/components/icons/DepositeBalance.vue'
import ConfirmedDeal from '@/components/icons/ConfirmedDeal.vue'
import ActiveDevices from '@/components/icons/ActiveDevices.vue'
import PeriodGrow from '@/components/icons/PeriodGrow.vue'
import Question from '@/components/icons/Question.vue'
import RenderOn from '@/components/utils/RenderOn.vue'
import ReloadBtn from '@/components/common/ReloadBtn/ReloadBtn.vue'
import { useDashboardStore } from '@/stores/dashboard'
import { storeToRefs } from 'pinia'
import { dateToDMYString } from '@/utils/index'

const datepicker = ref<DatePickerInstance>(null)

const dashboardStore = useDashboardStore()
const { loading, dashboard, chart, percentage } = storeToRefs(dashboardStore)

const date = ref<Array<Date | string>>(['', ''])
const lastUpdate = ref<Date>(new Date())

function clear() {
    date.value = ['', '']
    dashboardStore.fetchDashboard().then(() => {
        dashboardStore.hideLoading()
    })

    // dashboardStore.fetchChart().then(() => {
    //     dashboardStore.hideLoading()
    // })
}

function reload() {
    if (date.value[0] !== '' && date.value[1] !== '') {
        dashboardStore.fetchDashboardForDateRange(date.value[0], date.value[1]).then(() => {
            dashboardStore.hideLoading()
        })
    } else {
        dashboardStore.fetchDashboard().then(() => {
            dashboardStore.hideLoading()
        })
    }

    // dashboardStore.fetchChartForDate(date.value[0]).then(() => {
    //     dashboardStore.hideLoading()
    // })

    lastUpdate.value = new Date()
}

function setDate() {
    if (datepicker.value) {
        datepicker.value.selectDate()

        dashboardStore.fetchDashboardForDateRange(date.value[0], date.value[1]).then(() => {
            dashboardStore.hideLoading()
        })

        lastUpdate.value = new Date()

        // dashboardStore.fetchChartForDate(date.value[0]).then(() => {
        //     dashboardStore.hideLoading()
        // })
    }
}

function selectCurrentDate() {
    const newDate = new Date()
    date.value = [newDate]

    dashboardStore.fetchDashboardForDate(date.value[0]).then(() => {
        dashboardStore.hideLoading()
    })

    lastUpdate.value = new Date()

    // dashboardStore.fetchChartForDate(date.value[0]).then(() => {
    //     dashboardStore.hideLoading()
    // })

    if (datepicker.value) datepicker.value.closeMenu()
}

function selectCurrentWeek() {
    const curr = new Date()

    const first = curr.getDate() - curr.getDay() + 1
    const last = first + 6

    const firstday = new Date(curr.setDate(first))
    const lastday = new Date(curr.setDate(last))

    date.value = [firstday, lastday]

    dashboardStore.fetchDashboardForDateRange(date.value[0], date.value[1]).then(() => {
        dashboardStore.hideLoading()
    })

    lastUpdate.value = new Date()

    // dashboardStore.fetchChartForDate(date.value[0]).then(() => {
    //     dashboardStore.hideLoading()
    // })

    if (datepicker.value) datepicker.value.closeMenu()
}

function selectCurrentMonth() {
    const curr = new Date()
    
    const firstday = new Date(curr.getFullYear(), curr.getMonth(), 1)
    const lastday = new Date(curr.getFullYear(), curr.getMonth() + 1, 0)

    date.value = [firstday, lastday]

    dashboardStore.fetchDashboardForDateRange(date.value[0], date.value[1]).then(() => {
        dashboardStore.hideLoading()
    })

    lastUpdate.value = new Date()

    // dashboardStore.fetchChartForDate(date.value[0]).then(() => {
    //     dashboardStore.hideLoading()
    // })

    if (datepicker.value) datepicker.value.closeMenu()
}

function selectCurrentYear() {
    const curr = new Date()

    const firstday = new Date(curr.getFullYear(), 0, 1)
    const lastday = new Date(curr.getFullYear(), 11, 31)

    date.value = [firstday, lastday]

    dashboardStore.fetchDashboardForDateRange(date.value[0], date.value[1]).then(() => {
        dashboardStore.hideLoading()
    })

    lastUpdate.value = new Date()

    // dashboardStore.fetchChartForDate(date.value[0]).then(() => {
    //     dashboardStore.hideLoading()
    // })

    if (datepicker.value) datepicker.value.closeMenu()
}

/** Select last two years **/
function selectAllTime() {
    const curr = new Date()

    const firstday = new Date(curr.getFullYear() - 1, 0, 1)
    const lastday = new Date(curr.getFullYear(), 11, 31)

    date.value = [firstday, lastday]

    dashboardStore.fetchDashboardForDateRange(date.value[0], date.value[1]).then(() => {
        dashboardStore.hideLoading()
    })

    lastUpdate.value = new Date()

    // dashboardStore.fetchChartForDate(date.value[0]).then(() => {
    //     dashboardStore.hideLoading()
    // })

    if (datepicker.value) datepicker.value.closeMenu()
}

onMounted(() => {
    dashboardStore.fetchDashboard().then(() => {
        dashboardStore.hideLoading()
    })

    // dashboardStore.fetchChart().then(() => {
    //     dashboardStore.hideLoading()
    // })
})
</script>

<template>
    <Header title="Дашборд" />
    <section class="tw-flex tw-flex-col">
        <section class="tw-flex tw-justify-between tw-items-center tw-w-full tw-mb-6">
            <div class="tw-flex tw-items-center tw-gap-x-4">
                <RenderOn :px="1280">
                    <ArrowsClockwise stroke="#677483" />
                </RenderOn>
                <div class="tw-flex tw-flex-col sm:tw-text-[10px] md:tw-text-[10px] sm:tw-gap-x-1 md:tw-gap-x-1 tw-leading-4">
                    <span class="tw-text-[15px] tw-text-[#677483]">Последнее обновление</span>
                    <span class="tw-text-[15px] tw-text-[#677483]">{{ dateToDMYString(lastUpdate) }}</span>
                </div>
            </div>
            <div class="tw-flex tw-items-center tw-gap-x-2 min-lg:tw-w-[300px] sm:tw-w-[100px] md:tw-w-[100px]">
                <Datepicker
                    v-model="date"
                    ref="datepicker"
                    input-class-name="tw-h-[56px] !tw-rounded-xl !tw-border-gray-400
                                    sm:!tw-bg-transparent md:!tw-bg-transparent
                                    sm:!tw-border-none md:!tw-border-none
                                    sm:!tw-w-[30px] md:!tw-w-[30px] min-lg:dark:tw-bg-dark-panel"
                    menu-class-name="sm:!tw-fixed sm:tw-top-0 sm:tw-left-0 sm:tw-w-full sm:tw-h-[100dvh]
                                    md:!tw-fixed md:tw-top-0 md:tw-left-0 md:tw-w-full md:tw-h-[100dvh] dark:tw-bg-dark-panel dark:tw-text-light"
                    :teleport="true"
                    :enable-time-picker="false"
                    format="dd/MM/yyyy"
                    multi-calendars
                    range
                    @cleared="clear"
                >
                    <template v-slot:right-sidebar>
                        <RenderOn :px-min="320" :px-max="839">
                            <div class="tw-flex tw-justify-between tw-items-center tw-w-full tw-p-2">
                                <span class="dark:tw-text-light tw-text-[15px] tw-cursor-pointer hover:tw-text-[#677483]" @click="selectCurrentDate">Сегодня</span>
                                <span class="dark:tw-text-light tw-text-[15px] tw-cursor-pointer hover:tw-text-[#677483]" @click="selectCurrentWeek">Эта неделя</span>
                                <span class="dark:tw-text-light tw-text-[15px] tw-cursor-pointer hover:tw-text-[#677483]" @click="selectCurrentMonth">Этот месяц</span>
                                <span class="dark:tw-text-light tw-text-[15px] tw-cursor-pointer hover:tw-text-[#677483]" @click="selectCurrentYear">Этот год</span>
                                <span class="dark:tw-text-light tw-text-[15px] tw-cursor-pointer hover:tw-text-[#677483]" @click="selectAllTime">Всё время</span>
                            </div>
                        </RenderOn>
                    </template>

                    <template #left-sidebar="props">
                        <RenderOn :px="1280">
                            <aside class="tw-flex tw-flex-col tw-gap-y-6 tw-w-[120px] tw-py-5 tw-px-3">
                                <span class="dark:tw-text-light tw-text-[15px] tw-cursor-pointer hover:tw-text-[#677483]" @click="selectCurrentDate">Сегодня</span>
                                <span class="dark:tw-text-light tw-text-[15px] tw-cursor-pointer hover:tw-text-[#677483]" @click="selectCurrentWeek">Эта неделя</span>
                                <span class="dark:tw-text-light tw-text-[15px] tw-cursor-pointer hover:tw-text-[#677483]" @click="selectCurrentMonth">Этот месяц</span>
                                <span class="dark:tw-text-light tw-text-[15px] tw-cursor-pointer hover:tw-text-[#677483]" @click="selectCurrentYear">Этот год</span>
                                <span class="dark:tw-text-light tw-text-[15px] tw-cursor-pointer hover:tw-text-[#677483]" @click="selectAllTime">Всё время</span>
                            </aside>
                        </RenderOn>
                    </template>

                    <template #action-row="{ closePicker }">
                        <div class="tw-h-[100px]"></div>
                        <section class="sm:tw-absolute sm:tw-bottom-2 tw-flex sm:tw-flex-col md:tw-flex-col sm:tw-gap-y-2 md:tw-gap-y-2 min-lg:tw-justify-end tw-items-center min-lg:tw-gap-x-1 tw-w-full">
                            <v-btn class="!tw-rounded-xl sm:!tw-w-[90%] md:!tw-w-[90%]" variant="outlined" color="#04B6F5" size="large" @click="closePicker">Отменить</v-btn>
                            <v-btn class="!tw-rounded-xl sm:!tw-w-[90%] md:!tw-w-[90%]" variant="elevated" color="#04B6F5" size="large" @click="setDate">
                                <span class="tw-text-white">Применить</span>
                            </v-btn>
                        </section>
                    </template>
                </Datepicker>
                <div @click="reload"><ReloadBtn /></div>
            </div>
        </section>
        <section class="sm:tw-flex sm:tw-flex-col md:tw-flex md:tw-flex-col
                        min-lg:tw-grid min-lg:tw-grid-cols-3 min-lg:tw-grid-rows-2 tw-gap-4">
            <div class="tw-flex tw-flex-col tw-items-center min-lg:tw-row-span-2 min-lg:tw-min-w-[320px]
                        sm:tw-w-full md:tw-w-full tw-min-h-[226px] tw-max-h-[467px] tw-bg-white dark:tw-bg-dark-panel tw-rounded-2xl
                        tw-py-8 tw-px-4"
            >
                <div class="tw-mb-8">
                    <v-progress-circular
                        :model-value="percentage"
                        :rotate="360"
                        :size="269"
                        :width="23"
                        bg-color="#EFC327"
                        color="#30DE61"
                    >
                        <div class="tw-flex tw-flex-col tw-items-center tw-gap-y-2">
                            <Lightning />
                            <span class="tw-text-[#677483] dark:tw-text-light">Всего сделок</span>
                            <span v-if="!loading" class="tw-text-black dark:tw-text-light tw-text-[40px] tw-font-extrabold">{{ dashboard.paymentsCount }}</span>
                            <v-skeleton-loader v-else type="text" width="100"></v-skeleton-loader>
                        </div>
                    </v-progress-circular>
                </div>
                <div class="tw-flex tw-justify-between tw-items-center tw-w-full tw-mb-3">
                    <span class="tw-text-[#677483] dark:tw-text-gray-mid lg:tw-text-[15px] md:tw-text-[13px] sm:tw-text-[13px]">Завершённых сделок</span>
                    <span v-if="!loading" class="tw-font-semibold dark:tw-text-light lg:tw-text-[15px] md:tw-text-[13px] sm:tw-text-[13px]">{{ dashboard.completePaymentsCount }}</span>
                    <v-skeleton-loader v-else type="text" width="100"></v-skeleton-loader>
                </div>
                <div class="tw-flex tw-justify-between tw-items-center tw-w-full tw-mb-3">
                    <span class="tw-text-[#677483] dark:tw-text-gray-mid lg:tw-text-[15px] md:tw-text-[13px] sm:tw-text-[13px]">Сделок в процессе</span>
                    <span v-if="!loading"  class="tw-font-semibold dark:tw-text-light lg:tw-text-[15px] md:tw-text-[13px] sm:tw-text-[13px]">{{ dashboard.activePaymentsCount }}</span>
                    <v-skeleton-loader v-else type="text" width="100"></v-skeleton-loader>
                </div>
                <div class="tw-flex tw-justify-between tw-items-center tw-w-full tw-mb-3">
                    <span class="tw-text-[#677483] dark:tw-text-gray-mid lg:tw-text-[15px] md:tw-text-[13px] sm:tw-text-[13px]">Сумма завершённых сделок, RUB</span>
                    <span v-if="!loading"  class="tw-font-semibold dark:tw-text-light lg:tw-text-[15px] md:tw-text-[13px] sm:tw-text-[13px]">{{ dashboard.completePaymentsRUR }}</span>
                    <v-skeleton-loader v-else type="text" width="100"></v-skeleton-loader>
                </div>
            </div>

            <div class="sm:tw-w-full md:tw-w-full sm:tw-h-[75px] md:tw-h-[75px]
                        min-lg:tw-min-w-[320px] min-lg:tw-min-h-[226px] min-lg:tw-max-h-[467px] tw-bg-white dark:tw-bg-dark-panel tw-rounded-2xl sm:tw-p-4 md:tw-p-4 min-lg:tw-p-8"
            >
                <div class="tw-flex tw-flex-col tw-justify-between tw-w-full tw-h-full">
                    <RenderOn :px="1280">
                        <div class="tw-flex tw-justify-between tw-w-full">
                            <DepositeBalance />
                            <div class="tw-cursor-help">
                                <Question />
                                <v-tooltip
                                    activator="parent"
                                    location="top"
                                >Баланс на текущий момент</v-tooltip>
                            </div>
                        </div>
                    </RenderOn>
                    <div>
                        <span class="tw-text-[#677483] dark:tw-text-light sm:tw-text-[10px] md:tw-text-[10px]">Баланс депозита</span><br>
                        <span v-if="!loading" class="dark:tw-text-light sm:tw-text-2xl md:tw-text-2xl min-lg:tw-text-[32px] tw-font-semibold">{{ dashboard.balance }}</span>
                        <v-skeleton-loader v-else type="text" width="30"></v-skeleton-loader>
                        <span class="sm:tw-text-[15px] md:tw-text-[15px] min-lg:tw-text-2xl tw-font-semibold tw-text-[#AEB7C1] dark:tw-text-gray"> USD</span>
                    </div>
                </div>
            </div>

            <div class="sm:tw-w-full md:tw-w-full sm:tw-h-[75px] md:tw-h-[75px]
                        min-lg:tw-min-w-[320px] min-lg:tw-min-h-[226px] min-lg:tw-max-h-[467px] tw-bg-white dark:tw-bg-dark-panel tw-rounded-2xl sm:tw-p-4 md:tw-p-4 min-lg:tw-p-8"
            >
                <div class="tw-flex tw-flex-col tw-justify-between tw-w-full tw-h-full">
                    <RenderOn :px="1280">
                        <div class="tw-flex tw-justify-between tw-w-full">
                            <ConfirmedDeal />
                            <div class="tw-cursor-help">
                                <Question />
                                <v-tooltip
                                    activator="parent"
                                    location="top"
                                >Сумма подтвержденных сделок за выбранный период в USDT</v-tooltip>
                            </div>
                        </div>
                    </RenderOn>
                    <div>
                        <span class="tw-text-[#677483] dark:tw-text-light sm:tw-text-[10px] md:tw-text-[10px]">Подтверждённые сделки</span><br>
                        <span v-if="!loading" class="dark:tw-text-light sm:tw-text-2xl md:tw-text-2xl min-lg:tw-text-[32px] tw-font-semibold">{{ dashboard.completePaymentsUSD }}</span>
                        <v-skeleton-loader v-else type="text" width="30"></v-skeleton-loader>
                        <span class="sm:tw-text-[15px] md:tw-text-[15px] min-lg:tw-text-2xl tw-font-semibold tw-text-[#AEB7C1] dark:tw-text-gray"> USD</span>
                    </div>
                </div>
            </div>

            <div class="sm:tw-w-full md:tw-w-full sm:tw-h-[75px] md:tw-h-[75px]
                        min-lg:tw-min-w-[320px] min-lg:tw-min-h-[226px] min-lg:tw-max-h-[467px] tw-bg-white dark:tw-bg-dark-panel tw-rounded-2xl sm:tw-p-4 md:tw-p-4 min-lg:tw-p-8"
            >
                <div class="tw-flex tw-flex-col tw-justify-between tw-w-full tw-h-full">
                    <RenderOn :px="1280">
                        <div class="tw-flex tw-justify-between tw-w-full">
                            <ActiveDevices />
                            <div class="tw-cursor-help">
                                <Question />
                                <v-tooltip
                                    activator="parent"
                                    location="top"
                                >Подключенные устройства в сети</v-tooltip>
                            </div>
                        </div>
                    </RenderOn>
                    <div>
                        <span class="tw-text-[#677483] dark:tw-text-light sm:tw-text-[10px] md:tw-text-[10px]">Устройства онлайн</span><br>
                        <span v-if="!loading" class="dark:tw-text-light sm:tw-text-2xl md:tw-text-2xl min-lg:tw-text-[32px] tw-font-semibold">{{ dashboard.onlineDevicesCount }}</span>
                        <v-skeleton-loader v-else type="text" width="30"></v-skeleton-loader>
                        <span class="sm:tw-text-[15px] md:tw-text-[15px] min-lg:tw-text-2xl tw-font-semibold tw-text-[#AEB7C1] dark:tw-text-gray"> / {{ dashboard.devicesCount }}</span>
                    </div>
                </div>
            </div>

            <div class="sm:tw-w-full md:tw-w-full sm:tw-h-[75px] md:tw-h-[75px]
                        min-lg:tw-min-w-[320px] min-lg:tw-min-h-[226px] min-lg:tw-max-h-[467px] tw-bg-white dark:tw-bg-dark-panel tw-rounded-2xl sm:tw-p-4 md:tw-p-4 min-lg:tw-p-8"
            >
                <div class="tw-flex tw-flex-col tw-justify-between tw-w-full tw-h-full">
                    <RenderOn :px="1280">
                        <div class="tw-flex tw-justify-between tw-w-full">
                            <PeriodGrow />
                            <div class="tw-cursor-help">
                                <Question />
                                <v-tooltip
                                    activator="parent"
                                    location="top"
                                >Сумма прибыли за выбранный период. Сумма прибыли - это Ваш процент от оборота в USDT</v-tooltip>
                            </div>
                        </div>
                    </RenderOn>
                    <div>
                        <span class="tw-text-[#677483] dark:tw-text-light sm:tw-text-[10px] md:tw-text-[10px]">Прибыль за период</span><br>
                        <span v-if="!loading" class="dark:tw-text-light sm:tw-text-2xl md:tw-text-2xl min-lg:tw-text-[32px] tw-font-semibold">{{ dashboard.profitUSD }}</span>
                        <v-skeleton-loader v-else type="text" width="30"></v-skeleton-loader>
                        <span class="sm:tw-text-[15px] md:tw-text-[15px] min-lg:tw-text-2xl tw-font-semibold tw-text-[#AEB7C1] dark:tw-text-gray"> USD</span>
                    </div>
                </div>
            </div>
        </section>
    </section>
</template>
