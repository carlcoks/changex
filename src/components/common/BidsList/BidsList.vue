<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { debounce } from 'vue-debounce'

import VueCountdown from '@chenfengyuan/vue-countdown'
import Datepicker, { type DatePickerInstance } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

import { storeToRefs } from 'pinia'
import { useBidsStore } from '@/stores/bids'

import { datetimeToTimestamp, formatter } from '@/utils'
import RenderOn from '@/components/utils/RenderOn.vue'
import Stars from '@/components/icons/Stars.vue'
import ReloadBtn from '../ReloadBtn/ReloadBtn.vue'
import Download from '@/components/icons/Download.vue'
import WarningCircle from '@/components/icons/WarningCircle.vue'

const props = defineProps<{
    reload: boolean
}>()

const route = useRoute()

const tab = ref(null)

const bidsStore = useBidsStore()
const { loading, bidsItemsAll, bidsItemsUser, lastPage } = storeToRefs(bidsStore)

const searchModel = ref('')
const searchQuery = ref('')

const date = ref(['', ''])
const page = ref(1)

const mobileFilter = ref(false)
const takeBidDialog = ref(false)
const cancelBidDialog = ref(false)
const confirmTakenBidDialog = ref(false)
const isLoadingBtn = ref(false)

const datepicker = ref<DatePickerInstance>(null)

const bidErrorSnackbar = reactive({
    show: false,
    text: '',
    timeout: 2000,
})


const headersAll = ref([
    {
        title: 'ID',
        sortable: true,
        sortParams: {
            value: 'uid',
            name: 'ID'
        },
        key: 'id'
    },
    {
        title: 'Метод платежа',
        sortable: true,
        sortParams: {
            value: 'method',
            name: 'Методу платежа'
        },
        key: 'method'
    },
    {
        title: 'Сумма платежа',
        sortable: true,
        sortParams: {
            value: 'amount',
            name: 'Сумме платежа'
        },
        key: 'paymentSum'
    },
    {
        title: 'Сумма USDT',
        sortable: true,
        sortParams: {
            value: 'amountUSD',
            name: 'Сумме USDT'
        },
        key: 'sumUSDT'
    },
    {
        title: '',
        sortable: false,
        key: 'bidTake'
    }
])

const headersUser = ref([
    {
        title: 'ID',
        sortable: true,
        sortParams: {
            value: 'uid',
            name: 'ID'
        },
        key: 'id'
    },
    {
        title: 'Метод платежа',
        sortable: true,
        sortParams: {
            value: 'method',
            name: 'Методу платежа'
        },
        key: 'method'
    },
    {
        title: 'Реквизитам',
        sortable: true,
        sortParams: {
            value: 'requisites',
            name: 'По реквизитам'
        },
        key: 'requisites'
    },
    {
        title: 'Сумма платежа',
        sortable: true,
        sortParams: {
            value: 'amount',
            name: 'Сумме платежа'
        },
        key: 'paymentSum'
    },
    {
        title: 'Сумма USDT',
        sortable: true,
        sortParams: {
            value: 'amountUSD',
            name: 'Сумме USDT'
        },
        key: 'sumUSDT'
    },
    {
        title: 'Дата',
        sortable: true,
        sortParams: {
            value: 'timestamp',
            name: 'По дате'
        },
        key: 'date'
    },
    {
        title: 'Статус',
        sortable: true,
        sortParams: {
            value: 'status',
            name: 'По статусу'
        },
        key: 'status'
    }
])

const methods = reactive({
    select: undefined,
    items: [
        {
            value: 'Карта',
            name: 'Карта'
        }
    ]
})

function clearMethods() {
    methods.select = undefined
}

function firstLoad() {
    bidsStore
        .fetchBids({
            search: searchQuery.value,
            page: page.value,
            countPerPage: 10,
             sort: sort.value,
            filter: {
                fromTimestamp: datetimeToTimestamp(date?.value[0]),
                toTimestamp: datetimeToTimestamp(date?.value[1]),
                method: methods.select || undefined,
            }
        })
        .then(() => {
            bidsStore.hideLoading()
            
            // Call get user bids from store after all bids loaded
            bidsStore
            .fetchUserBids({
                search: searchQuery.value,
                page: page.value,
                countPerPage: 10,
                sort: sort.value,
                filter: {
                    fromTimestamp: datetimeToTimestamp(date?.value[0]),
                    toTimestamp: datetimeToTimestamp(date?.value[1]),
                    method: methods.select || undefined,
                }
            })
            .then(() => {
                bidsStore.hideLoading()
            })
        })
}

function fetchData() {
    if (tab.value === 'one') {
        bidsStore
        .fetchBids({
            search: searchQuery.value,
            page: page.value,
            countPerPage: 10,
             sort: sort.value,
            filter: {
                fromTimestamp: datetimeToTimestamp(date?.value[0]),
                toTimestamp: datetimeToTimestamp(date?.value[1]),
                method: methods.select || undefined,
            }
        })
        .then(() => {
            bidsStore.hideLoading()
        })
    }

    if (tab.value === 'two') {
        bidsStore
        .fetchUserBids({
            search: searchQuery.value,
            page: page.value,
            countPerPage: 10,
            sort: sort.value,
            filter: {
                fromTimestamp: datetimeToTimestamp(date?.value[0]),
                toTimestamp: datetimeToTimestamp(date?.value[1]),
                method: methods.select || undefined,
            }
        })
        .then(() => {
            bidsStore.hideLoading()
        })
    }
}

const sort = reactive({
    value: 'timestamp',
    name: 'Времени'
})

const sortOptions = ref([
    {
        value: '',
        name: 'Не сортировать'
    },
    {
        value: 'uid',
        name: 'ID'
    },
    {
        value: 'amount',
        name: 'Сумме платежа'
    },
    {
        value: 'amountUSD',
        name: 'Сумме USDT'
    },
    {
        value: 'timestamp',
        name: 'Времени'
    }
])

function setSort(sortOption: Record<string, unknown>) {
    sort.value = sortOption.value
    sort.name = sortOption.name
    fetchData()
}

function searchValue(queryText: string) {
    searchQuery.value = queryText
    fetchData()
}

function reset() {
    searchModel.value = ''
    searchQuery.value = ''
    date.value = ['', '']
    methods.select = undefined

    fetchData()
}

function applyMobileFilter() {
    mobileFilter.value = !mobileFilter.value
}

/** Reset filter on close mobile filter window **/
function closeMobileFilter() {
    mobileFilter.value = !mobileFilter.value
}

const bidOnTake = reactive({
    isEditable: false,
    id: '',
    method: '',
    paymentSum: 0
})

const bidOnCancel = reactive({
    isEditable: false,
    id: '',
    method: '',
    paymentSum: 0,
    requisites: ''
})

const bidOnConfirm = reactive({
    isEditable: false,
    id: '',
    method: '',
    paymentSum: 0,
    requisites: '',
    receipt: null as File | null,
    receiptDataURL: '' as string | ArrayBuffer | null
})

async function openOnCancelUser(userBid: Record<string, unknown>) {
    bidOnCancel.isEditable = false

    bidOnCancel.id = userBid.id as string
    bidOnCancel.method = userBid.method.methodValue as string
    bidOnCancel.paymentSum = userBid.paymentSum as number
    bidOnCancel.requisites = userBid.requisites as string

    
    cancelBidDialog.value = true
    bidOnCancel.isEditable = true
}

async function openOnTakeBid(bid: Record<string, unknown>) {
    bidOnTake.isEditable = false

    bidOnTake.id = bid.id as string
    bidOnTake.methodValue = bid.method.methodValue as string
    bidOnTake.methodBank = bid.method.methodBank as string
    bidOnTake.paymentSum = bid.paymentSum as number
    bidOnTake.sumUSDT = bid.sumUSDT as number

    takeBidDialog.value = true
    bidOnTake.isEditable = true
}

async function openOnConfirmBid(bid: Record<string, unknown>) {
    bidOnConfirm.isEditable = false

    bidOnConfirm.id = bid.id as string
    bidOnConfirm.methodValue = bid.method.methodValue as string
    bidOnConfirm.methodBank = bid.method.methodBank as string
    bidOnConfirm.paymentSum = bid.paymentSum as number
    bidOnConfirm.sumUSDT = bid.sumUSDT as number
    bidOnConfirm.requisites = bid.requisites as string

    confirmTakenBidDialog.value = true
    bidOnConfirm.isEditable = true
}

function loadReceipt(e: Event) {
    const target = e.target as HTMLInputElement

    if (target && target.files) {
        console.log(target.files[0])
        const fr = new FileReader()

        fr.onload = () => {
            bidOnConfirm.receiptDataURL = fr.result
        }

        fr.readAsDataURL(target.files[0])

        bidOnConfirm.receipt = target.files[0]
    }
}

function removeReceipt() {
    bidOnConfirm.receipt = null
    bidOnConfirm.receiptDataURL = ''
}

const confirmTakenBid = async (id: string) => {
    isLoadingBtn.value = true

    const res = await bidsStore.confirmUserBid(id, bidOnConfirm)
    
    isLoadingBtn.value = false

    if (res.response) {
        bidErrorSnackbar.text = res.response.data.msg
        bidErrorSnackbar.show = true

        return
    }

    closeConfirmBidDialog()
    fetchData()
}

const confirmBidTake = async (id: string) => {
    isLoadingBtn.value = true

    const res = await bidsStore.takeBidAction(id)
    
    isLoadingBtn.value = false
    
    if (res.response) {
        bidErrorSnackbar.text = res.response.data.msg
        bidErrorSnackbar.show = true

        return
    }

    takeBidDialog.value = false
}

const confirmBidCancel = async (id: string) => {
    isLoadingBtn.value = true

    await bidsStore.cancelUserBidByID(id)

    isLoadingBtn.value = false

    cancelBidDialog.value = false
}

function closeTakeBidDialog() {
    takeBidDialog.value = false
}

function closeCancelBidDialog() {
    cancelBidDialog.value = false
}

function closeConfirmBidDialog() {
    confirmTakenBidDialog.value = false
}

function setDate() {    
    if (datepicker.value) {
        datepicker.value.selectDate()

        fetchData()
    }
}

function changePage(newPage: string, isActive: boolean) {
    if (isActive) {
        return
    }

    page.value = Number(newPage.replace(',', ''))
    fetchData()
}

function decPage() {
    if (page.value !== 1) {
        page.value--
        fetchData()
    }
}

function incPage() {
    if (page.value !== lastPage.value) {
        page.value++
        fetchData()
    }
}

function loadMore() {
    if (page.value < lastPage.value) {
        page.value++
        
        if (tab.value === 'one') {
            bidsStore
            .loadMoreBids({
                search: searchQuery.value,
                page: page.value,
                countPerPage: 10,
                sort: '',
                filter: {}
            })
            .then(() => {
                bidsStore.hideLoading()
            })
        }

        if (tab.value === 'two') {
            bidsStore
            .loadMoreUserBids({
                search: searchQuery.value,
                page: page.value,
                countPerPage: 10,
                sort: sort.value,
                filter: {}
            })
            .then(() => {
                bidsStore.hideLoading()
            })
        }
    }
}

onMounted(() => {
    const params = route.query

    if (params && params.id) {
        searchModel.value = params.id
        searchQuery.value = params.id
    }

    firstLoad()
})

watch(props, (newValue: Record<string, boolean>, _prevValue: Record<string, boolean>) => {
    if (newValue.reload) {
        fetchData()
    }
})
</script>

<template>
    <RenderOn :px="840">
        <v-card
            class="tw-w-full tw-h-[94px] !tw-rounded-2xl !tw-py-[23px] !tw-px-[24px] tw-mb-6 dark:tw-bg-dark-panel"
        >
            <section class="tw-w-full tw-flex tw-items-center">
                <section class="tw-w-full tw-flex tw-items-center tw-gap-x-4">
                    <v-responsive class="mx-auto" min-width="92" max-width="612">
                        <v-text-field
                            v-model="searchModel"
                            variant="outlined"
                            label="Поиск по ID"
                            append-inner-icon="mdi mdi-magnify"
                            single-line
                            @update:model-value="
                                debounce(
                                    (val: any) => searchValue(val as string),
                                    1000
                                )(searchModel)
                            "
                        ></v-text-field>
                    </v-responsive>
                    <v-responsive class="mx-auto" min-width="92" max-width="612">
                        <v-select
                            v-model="methods.select"
                            :items="methods.items"
                            label="Методы"
                            variant="outlined"
                            item-title="name"
                            item-value="value"
                            clearable
                            @click:clear="clearMethods"
                            @update:model-value="fetchData"
                        ></v-select>
                    </v-responsive>
                    <v-responsive class="mx-auto -tw-mt-5" min-width="92" max-width="612">
                        <div class="tw-flex tw-items-center tw-gap-x-2">
                            <Datepicker
                                v-model="date"
                                ref="datepicker"
                                input-class-name="tw-h-[56px] !tw-rounded-xl !tw-border-gray-400 dark:tw-bg-dark-panel"
                                menu-class-name="sm:!tw-fixed sm:tw-top-0 sm:tw-left-0 sm:tw-w-full sm:tw-h-[100dvh]
                                        md:!tw-fixed md:tw-top-0 md:tw-left-0 md:tw-w-full md:tw-h-[100dvh] dark:tw-bg-dark-panel dark:tw-text-light"
                                :teleport="true"
                                :enable-time-picker="false"
                                @internal-model-change="fetchData"
                                @cleared="date = ['', '']"
                                range
                            >
                                <template #action-row="{ closePicker }">
                                    <div class="tw-h-[100px]"></div>
                                    <section
                                        class="sm:tw-absolute sm:tw-bottom-2 tw-flex sm:tw-flex-col md:tw-flex-col sm:tw-gap-y-2 md:tw-gap-y-2 min-lg:tw-justify-end tw-items-center min-lg:tw-gap-x-1 tw-w-full"
                                    >
                                        <v-btn
                                            class="!tw-rounded-xl sm:!tw-w-[90%] md:!tw-w-[90%]"
                                            variant="outlined"
                                            color="#04B6F5"
                                            size="large"
                                            @click="closePicker"
                                            >Отменить</v-btn
                                        >
                                        <v-btn
                                            class="!tw-rounded-xl sm:!tw-w-[90%] md:!tw-w-[90%]"
                                            variant="elevated"
                                            color="#04B6F5"
                                            size="large"
                                            @click="setDate"
                                        >
                                            <span class="tw-text-white">Применить</span>
                                        </v-btn>
                                    </section>
                                </template>
                            </Datepicker>
                            <ReloadBtn @click="fetchData" />
                        </div>
                    </v-responsive>
                </section>
            </section>
        </v-card>
        <v-card class="!tw-rounded-2xl tw-mb-6 dark:tw-bg-dark-panel">
            <v-tabs v-model="tab" align-tabs="center">
                <v-tab
                    value="one"
                    color="blue"
                    width="50%"
                    class="!tw-normal-case !tw-tracking-normal"
                    >Все откупы</v-tab
                >
                <v-tab
                    value="two"
                    color="blue"
                    width="50%"
                    class="!tw-normal-case !tw-tracking-normal"
                    >Мои откупы</v-tab
                >
            </v-tabs>

            <v-card-text>
                <v-window v-model="tab">
                    <v-window-item value="one" @group:selected="fetchData">
                        <v-data-table
                            :headers="headersAll"
                            :items="bidsItemsAll"
                            :footer="false"
                            :loading="loading"
                            hide-no-data
                        >
                            <template v-slot:headers="{ columns }">
                                <tr>
                                    <template v-for="column in columns" :key="column.key">
                                        <td>
                                            <span
                                                class="tw-text-[13px] tw-text-[#677483] tw-mr-2"
                                                >{{ column.title }}</span
                                            >
                                        </td>
                                    </template>
                                </tr>
                            </template>
                            <template v-slot:item.method="{ value }">
                                <div class="d-flex flex-column">
                                    <span class="tw-text-[15px]">{{ value.methodValue }}</span>
                                    <span class="tw-text-[15px] text-grey">{{ value.methodBank }}</span>
                                </div>
                            </template>
                            <template v-slot:item.bidSum="{ value }">
                                <span class="tw-text-[15px]">{{ value }}</span>
                            </template>
                            <template v-slot:item.paymentSum="{ value }">
                                <span
                                    ><span class="tw-text-[15px]">{{
                                        formatter.format(value)
                                    }}</span>
                                    <span class="tw-ml-2 tw-text-[13px] tw-text-gray-dark">RUB</span></span
                                >
                            </template>
                            <template v-slot:item.sumUSDT="{ value }">
                                <span
                                    ><span class="tw-text-[15px]">{{
                                        formatter.format(value)
                                    }}</span>
                                    <span class="tw-ml-2 tw-text-[13px] tw-text-gray-dark">USDT</span></span
                                >
                            </template>
                            <template v-slot:item.bidTake="{ value, index }">
                                <div class="tw-p-2 tw-cursor-pointer hover:tw-scale-110" @click="openOnTakeBid(bidsItemsAll[index])">
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M16.875 5.625L8.125 14.375L3.75 10"
                                            stroke="#04B6F5"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        />
                                    </svg>
                                </div>
                            </template>
                            <template v-slot:loading>
                                <v-skeleton-loader type="table-row@4"></v-skeleton-loader>
                            </template>
                            <template v-slot:bottom></template>
                        </v-data-table>
                    </v-window-item>

                    <v-window-item value="two" @group:selected="fetchData">
                        <v-data-table
                            :headers="headersUser"
                            :items="bidsItemsUser"
                            :footer="false"
                            :loading="loading"
                            hide-no-data
                        >
                            <template v-slot:headers="{ columns }">
                                <tr>
                                    <template v-for="column in columns" :key="column.key">
                                        <td>
                                            <span
                                                class="tw-text-[13px] tw-text-[#677483] tw-mr-2"
                                                >{{ column.title }}</span
                                            >
                                        </td>
                                    </template>
                                </tr>
                            </template>
                            <template v-slot:item.method="{ value }">
                                <span class="tw-text-[15px]">{{ value.methodValue }}</span><br>
                                <span class="tw-text-[15px] tw-text-gray-dark">{{ value.methodBank }}</span>
                            </template>
                            <template v-slot:item.requisites="{ value }">
                                <span class="tw-text-[15px]">{{ value }}</span>
                            </template>
                            <template v-slot:item.paymentSum="{ value }">
                                <span
                                    ><span class="tw-text-[15px]">{{
                                        formatter.format(value)
                                    }}</span>
                                    <span class="tw-ml-2 tw-text-[13px] tw-text-gray-dark">RUB</span></span
                                >
                            </template>
                            <template v-slot:item.sumUSDT="{ value }">
                                <span
                                    ><span class="tw-text-[15px]">{{
                                        formatter.format(value)
                                    }}</span>
                                    <span class="tw-ml-2 tw-text-[13px] tw-text-gray-dark">USDT</span></span
                                >
                            </template>
                            <template v-slot:item.date="{ value }">
                                <span class="tw-text-[15px]">{{ value.value }}</span
                                ><br />
                                <span class="tw-text-[10px]">{{ value.different }}</span>
                            </template>
                            <template v-slot:item.status="{ value, index }">
                                <div v-if="value.value === 'taken'" class="tw-flex tw-gap-x-10">
                                    <div
                                        class="tw-flex tw-flex-col tw-justify-center tw-items-center tw-rounded-xl tw-border-2 tw-border-solid tw-border-[#EF4B27] tw-w-[158px] tw-h-[38px] tw-mt-1"
                                    >
                                        <span class="tw-text-[#EF4B27] tw-text-xs">
                                            В работе
                                            <vue-countdown
                                                :time="value.timeout"
                                                v-slot="{ minutes, seconds }"
                                            >
                                                {{ minutes.toString().padStart(2, '0') }}:{{
                                                    seconds.toString().padStart(2, '0')
                                                }}</vue-countdown
                                            >
                                        </span>
                                    </div>
                                    <v-menu>
                                        <template v-slot:activator="{ props }">
                                            <v-btn
                                                class="!tw-border-none !tw-bg-none !tw-shadow-none dark:tw-bg-dark-panel"
                                                icon="mdi-dots-vertical"
                                                v-bind="props"
                                            ></v-btn>
                                        </template>

                                        <v-list>
                                            <v-list-item
                                                class="tw-cursor-pointer hover:tw-bg-gray-200"
                                                @click="openOnConfirmBid(bidsItemsUser[index])"
                                            >
                                                <v-list-item-title
                                                    ><span class="tw-select-none"
                                                        >Выполнить</span
                                                    ></v-list-item-title
                                                >
                                            </v-list-item>
                                            <v-list-item
                                                class="tw-cursor-pointer hover:tw-bg-gray-200"
                                                @click="openOnCancelUser(bidsItemsUser[index])"
                                            >
                                                <v-list-item-title
                                                    ><span class="tw-select-none tw-text-red"
                                                        >Отклонить</span
                                                    ></v-list-item-title
                                                >
                                            </v-list-item>
                                        </v-list>
                                    </v-menu>
                                </div>
                                <div
                                    v-if="value.value === 'cancelled'"
                                    class="tw-rounded-xl tw-border-2 tw-border-solid tw-border-gray tw-w-[104px] tw-px-2 tw-py-1 tw-text-center"
                                >
                                    <span class="tw-text-gray tw-text-xs">Отклонён</span>
                                </div>
                                <div
                                    v-if="value.value === 'done'"
                                    class="tw-rounded-xl tw-border-2 tw-border-solid tw-border-green tw-w-[104px] tw-px-2 tw-py-1 tw-text-center"
                                >
                                    <span class="tw-text-green tw-text-xs">Выполнен</span>
                                </div>
                            </template>
                            <template v-slot:loading>
                                <v-skeleton-loader type="table-row@4"></v-skeleton-loader>
                            </template>
                            <template v-slot:bottom></template>
                        </v-data-table>
                    </v-window-item>
                </v-window>
            </v-card-text>
        </v-card>
    </RenderOn>

    <v-dialog v-model="confirmTakenBidDialog" width="auto">
        <v-card class="tw-flex tw-flex-col tw-items-center !tw-rounded-2xl sm:!tw-p-[28px] md:!tw-p-[48px] min-lg:!tw-p-[48px]">
            <div class="tw-mb-5"><WarningCircle stroke="#EF4B27" /></div>
            <div class="tw-mb-5 tw-max-w-[380px] tw-text-center">
                <span class="tw-text-2xl">
                    Подтвердите перевод средств
                </span>
            </div>

            <section class="tw-w-full" v-if="bidOnConfirm.isEditable">
                <div class="tw-flex tw-flex-col tw-gap-y-4 light:tw-bg-[#F8FCFE] dark:tw-bg-dark
                        tw-border-solid tw-border-[1px] tw-border-[#E0E4E8]
                        tw-rounded-xl tw-p-4 tw-w-full tw-mb-5"
                >
                    <div class="tw-flex tw-justify-between tw-text-[15px]">
                        <span>ID</span>
                        <span>{{ bidOnConfirm.id }}</span>
                    </div>
                    <div class="tw-flex tw-justify-between tw-text-[15px]">
                        <span>Метод</span>
                        <span>{{ bidOnConfirm.methodValue }}</span>
                    </div>
                    <div class="tw-flex tw-justify-between tw-text-[15px]">
                        <span>Банк</span>
                        <span>{{ bidOnConfirm.methodBank }}</span>
                    </div>
                    <div class="tw-flex tw-justify-between tw-text-[15px]">
                        <span>Сумма оплаты</span>
                        <span>{{ bidOnConfirm.paymentSum }} <span class="tw-text-gray-dark">RUB</span></span>
                    </div>
                    <div class="tw-flex tw-justify-between tw-text-[15px]">
                        <span>Сумма USDT</span>
                        <span>{{ bidOnConfirm.sumUSDT }} <span class="tw-text-gray-dark">USDT</span></span>
                    </div>
                </div>
                <span>Реквизиты:</span>
                <div class="light:tw-bg-[#F8FCFE] dark:tw-bg-dark
                        tw-border-solid tw-border-[1px] tw-border-[#E0E4E8]
                        tw-rounded-xl tw-p-4 tw-w-full tw-mb-5 tw-mt-3">
                    <span>{{ bidOnConfirm.requisites }}</span>
                </div>
                <input
                    type="file"
                    name="file"
                    id="bidOnConfirm-receipt"
                    class="tw-hidden"
                    accept="image/jpeg, image/png"
                    @change="loadReceipt($event)"
                >
                <label
                    v-if="!bidOnConfirm.receipt"
                    for="bidOnConfirm-receipt"
                    class="tw-flex tw-flex-col tw-justify-center
                            tw-items-center tw-w-full tw-bg-gray-light
                            tw-border-[1px] tw-border-blue-primary tw-border-dashed tw-rounded-xl
                            tw-h-[80px] tw-cursor-pointer hover:tw-bg-gray-mid"
                >
                    <div class="tw-flex tw-items-center tw-gap-x-2">
                        <Download /> <span class="tw-text-blue-primary">Загрузите чек</span>
                    </div>
                </label>
                <div v-else>
                    <div class="tw-flex tw-items-start tw-gap-x-2">
                        <div class="tw-w-[76px] tw-h-[76px] tw-rounded-2xl tw-border">
                            <v-img :src="bidOnConfirm.receiptDataURL"></v-img>
                        </div>
                        <div class="tw-flex tw-flex-col tw-gap-y-4">
                            <span>Чек</span>
                            <div class="tw-flex tw-gap-x-3">
                                <span>{{ bidOnConfirm.receipt.name }}</span>
                                <div class="tw-p-1 tw-cursor-pointer" @click="removeReceipt">
                                    <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M15.625 4.875L4.375 16.125" stroke="#EF4B27" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M15.625 16.125L4.375 4.875" stroke="#EF4B27" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <div v-else class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-y-4 tw-bg-[#F8FCFE]
                    tw-border-solid tw-border-[1px] tw-border-[#E0E4E8]
                    tw-rounded-xl tw-w-full tw-h-[300px] tw-mb-5"
            >
                <v-progress-circular
                    indeterminate
                    color="#04B6F5"
                ></v-progress-circular>
            </div>
            <v-btn
                :loading="isLoadingBtn"
                class="!tw-rounded-xl !tw-h-[50px] tw-w-full tw-mt-5"
                variant="elevated"
                color="#04B6F5"
                :disabled="!bidOnConfirm.receipt"
                @click="confirmTakenBid(bidOnConfirm.id)"
            >
                <span class="tw-tracking-normal tw-normal-case tw-text-white">Подтвердить</span>
            </v-btn>
            <v-btn class="!tw-rounded-xl !tw-h-[50px] tw-w-full tw-mt-5" variant="outlined" color="#04B6F5" @click="closeConfirmBidDialog">
                <span class="tw-tracking-normal tw-normal-case">Отмена</span>
            </v-btn>
        </v-card>
    </v-dialog>

    <v-dialog v-model="takeBidDialog" width="auto">
        <v-card class="tw-flex tw-flex-col tw-items-center !tw-rounded-2xl sm:!tw-p-[28px] md:!tw-p-[48px] min-lg:!tw-p-[48px]">
            <div class="tw-mb-5"><WarningCircle stroke="#EF4B27" /></div>
            <div class="tw-mb-5 tw-max-w-[380px] tw-text-center">
                <span class="tw-text-2xl">
                    Подтвердите принятие откупа
                </span>
            </div>
            <div
                v-if="bidOnTake.isEditable"
                class="tw-flex tw-flex-col tw-gap-y-4 light:tw-bg-[#F8FCFE] dark:tw-bg-dark
                        tw-border-solid tw-border-[1px] tw-border-[#E0E4E8]
                        tw-rounded-xl tw-p-4 tw-w-full tw-mb-5"
            >
                <div class="tw-flex tw-justify-between tw-text-[15px]">
                    <span>ID</span>
                    <span>{{ bidOnTake.id }}</span>
                </div>
                <div class="tw-flex tw-justify-between tw-text-[15px]">
                    <span>Метод</span>
                    <span>{{ bidOnTake.methodValue }}</span>
                </div>
                <div class="tw-flex tw-justify-between tw-text-[15px]">
                    <span>Банк</span>
                    <span>{{ bidOnTake.methodBank }}</span>
                </div>
                <div class="tw-flex tw-justify-between tw-text-[15px]">
                    <span>Сумма оплаты</span>
                    <span>{{ bidOnTake.paymentSum }} <span class="tw-text-gray-dark">RUB</span></span>
                </div>
                <div class="tw-flex tw-justify-between tw-text-[15px]">
                    <span>Сумма USDT</span>
                    <span>{{ bidOnTake.sumUSDT }} <span class="tw-text-gray-dark">USDT</span></span>
                </div>
            </div>
            <div v-else class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-y-4 tw-bg-[#F8FCFE] dark:tw-bg-dark
                    tw-border-solid tw-border-[1px] tw-border-[#E0E4E8]
                    tw-rounded-xl tw-w-full tw-h-[300px] tw-mb-5"
            >
                <v-progress-circular
                    indeterminate
                    color="#04B6F5"
                ></v-progress-circular>
            </div>
            <v-btn
                :loading="isLoadingBtn"
                class="!tw-rounded-xl !tw-h-[50px] tw-w-full tw-mt-5"
                variant="elevated"
                color="#04B6F5"
                @click="confirmBidTake(bidOnTake.id)"
            >
                <span class="tw-tracking-normal tw-normal-case tw-text-white">Подтвердить</span>
            </v-btn>
            <v-btn class="!tw-rounded-xl !tw-h-[50px] tw-w-full tw-mt-5" variant="outlined" color="#04B6F5" @click="closeTakeBidDialog">
                <span class="tw-tracking-normal tw-normal-case">Отмена</span>
            </v-btn>
        </v-card>
    </v-dialog>

    <v-dialog v-model="cancelBidDialog" width="auto">
        <v-card class="tw-flex tw-flex-col tw-items-center !tw-rounded-2xl sm:!tw-p-[28px] md:!tw-p-[48px] min-lg:!tw-p-[48px]">
            <div class="tw-mb-5"><WarningCircle stroke="#EF4B27" /></div>
            <div class="tw-mb-5 tw-max-w-[380px] tw-text-center">
                <span class="tw-text-2xl">
                    Подтвердите отклонение данного откупа
                </span>
            </div>
            <section class="tw-w-full" v-if="bidOnCancel.isEditable">
                <div class="tw-flex tw-flex-col tw-gap-y-4 light:tw-bg-[#F8FCFE] dark:tw-bg-dark
                        tw-border-solid tw-border-[1px] tw-border-[#E0E4E8]
                        tw-rounded-xl tw-p-4 tw-w-full tw-mb-5">
                    <div class="tw-flex tw-justify-between tw-text-[15px]">
                        <span>Метод</span>
                        <span>{{ bidOnCancel.method }}</span>
                    </div>
                    <div class="tw-flex tw-justify-between tw-text-[15px]">
                        <span>Сумма</span>
                        <span>{{ bidOnCancel.paymentSum }} <span class="tw-text-gray-dark">RUB</span></span>
                    </div>
                </div>
                <span>Реквизиты:</span>
                <div class="light:tw-bg-[#F8FCFE] dark:tw-bg-dark
                        tw-border-solid tw-border-[1px] tw-border-[#E0E4E8]
                        tw-rounded-xl tw-p-4 tw-w-full tw-mb-5 tw-mt-3">
                    <span>{{ bidOnCancel.requisites }}</span>
                </div>
            </section>
            <div v-else class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-y-4 tw-bg-[#F8FCFE]
                    tw-border-solid tw-border-[1px] tw-border-[#E0E4E8]
                    tw-rounded-xl tw-w-full tw-h-[300px] tw-mb-5"
            >
                <v-progress-circular
                    indeterminate
                    color="#04B6F5"
                ></v-progress-circular>
            </div>
            <v-btn
                :loading="isLoadingBtn"
                class="!tw-rounded-xl !tw-h-[50px] tw-w-full tw-mt-5"
                variant="elevated"
                color="#EF4B27"
                @click="confirmBidCancel(bidOnCancel.id)"
            >
                <span class="tw-tracking-normal tw-normal-case tw-text-white">Подтвердить</span>
            </v-btn>
            <v-btn class="!tw-rounded-xl !tw-h-[50px] tw-w-full tw-mt-5" variant="outlined" color="#04B6F5" @click="closeCancelBidDialog">
                <span class="tw-tracking-normal tw-normal-case">Отмена</span>
            </v-btn>
        </v-card>
    </v-dialog>

    <RenderOn :px-min="320" :px-max="839">
        <v-tabs v-model="tab" align-tabs="center">
            <v-tab
                value="one"
                color="blue"
                width="50%"
                class="!tw-normal-case !tw-tracking-normal"
                >Все откупы</v-tab
            >
            <v-tab
                value="two"
                color="blue"
                width="50%"
                class="!tw-normal-case !tw-tracking-normal"
                >Мои откупы</v-tab
            >
        </v-tabs>

        <v-window v-if="!loading" v-model="tab">
            <v-window-item value="one" @group:selected="fetchData">
                <section
                    class="tw-flex tw-justify-between tw-items-center tw-w-full tw-mb-2 tw-mt-2"
                >
                    <!-- <div>
                        <span class="tw-text-[13px] tw-select-none">
                            Сортировать по
                            <v-menu>
                                <template v-slot:activator="{ props }">
                                    <span class="tw-text-[#04B6F5]" v-bind="props">{{
                                        sort.name
                                    }}</span>
                                </template>

                                <v-list>
                                    <template v-for="option in sortOptions" :key="option">
                                        <v-list-item
                                            class="tw-cursor-pointer hover:tw-bg-gray-200"
                                            @click="setSort(option)"
                                        >
                                            <v-list-item-title
                                                ><span class="tw-select-none">{{
                                                    option.name
                                                }}</span></v-list-item-title
                                            >
                                        </v-list-item>
                                    </template>
                                </v-list>
                            </v-menu>
                        </span>
                    </div> -->
                    <div class="tw-flex tw-items-center tw-cursor-pointer" @click="mobileFilter = !mobileFilter">
                        <span class="tw-text-[13px] tw-text-[#04B6F5] tw-select-none">Фильтр</span>
                        <Filter />
                    </div>
                </section>
                <section
                    class="tw-flex tw-flex-col tw-gap-y-2 tw-overflow-y-scroll tw-p-2 tw-h-[420px]"
                >
                    <template v-for="(item, index) in bidsItemsAll" :key="item">
                        <div
                            class="tw-flex tw-flex-col tw-w-full tw-bg-white tw-p-4 tw-rounded-2xl dark:tw-bg-dark-panel"
                        >
                            <div class="tw-flex tw-justify-between tw-mb-2">
                                <div class="tw-flex tw-items-center tw-gap-x-2 tw-w-full">
                                    <div class="tw-flex tw-flex-col tw-gap-y-2 tw-w-full tw-leading-4">
                                        <div class="tw-flex tw-justify-between tw-items-center tw-w-full">
                                            <span class="tw-text-[10px] tw-text-[#AEB7C1]">{{
                                                item.id
                                            }}</span>
                                            <div class="tw-p-2 tw-cursor-pointer hover:tw-scale-110" @click="openOnTakeBid(bidsItemsAll[index])">
                                                <svg
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 20 20"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M16.875 5.625L8.125 14.375L3.75 10"
                                                        stroke="#04B6F5"
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                        <div class="tw-flex tw-gap-x-2">
                                            <span
                                                ><span class="tw-text-[17px]">{{
                                                    formatter.format(item.paymentSum)
                                                }}</span>
                                                <span class="tw-ml-2 tw-text-[13px] tw-text-gray-dark"
                                                    >RUB</span
                                                ></span
                                            >
                                            <span>/</span>
                                            <span
                                                ><span class="tw-text-[17px]">{{
                                                    formatter.format(item.sumUSDT)
                                                }}</span>
                                                <span class="tw-ml-2 tw-text-[13px] tw-text-gray-dark"
                                                    >USDT</span
                                                ></span
                                            >
                                        </div>
                                        <span>{{ item.method.methodValue }}</span><br>
                                        <span class="tw-text-[15px] tw-text-gray-dark">{{ item.method.methodBank }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </section>
                <v-btn
                    v-if="bidsItemsAll.length > 0"
                    class="!tw-rounded-xl !tw-h-[50px] tw-w-full tw-mt-5"
                    variant="outlined"
                    color="#04B6F5"
                    @click="loadMore"
                >
                    <span class="tw-tracking-normal tw-normal-case">Показать ещё</span>
                </v-btn>
            </v-window-item>

            <v-window-item value="two" @group:selected="fetchData">
                <!-- <section
                    class="tw-flex tw-justify-between tw-items-center tw-w-full tw-mb-2 tw-mt-2"
                >
                    <div>
                        <span class="tw-text-[13px] tw-select-none">
                            Сортировать по
                            <v-menu>
                                <template v-slot:activator="{ props }">
                                    <span class="tw-text-[#04B6F5]" v-bind="props">{{
                                        sort.name
                                    }}</span>
                                </template>

                                <v-list>
                                    <template v-for="option in sortOptions" :key="option">
                                        <v-list-item
                                            class="tw-cursor-pointer hover:tw-bg-gray-200"
                                            @click="setSort(option)"
                                        >
                                            <v-list-item-title
                                                ><span class="tw-select-none">{{
                                                    option.name
                                                }}</span></v-list-item-title
                                            >
                                        </v-list-item>
                                    </template>
                                </v-list>
                            </v-menu>
                        </span>
                    </div>
                </section> -->
                <section
                    class="tw-flex tw-flex-col tw-gap-y-2 tw-overflow-y-scroll tw-h-[420px]"
                >
                    <template v-for="(item, index) in bidsItemsUser" :key="item">
                        <div
                            class="tw-flex tw-flex-col tw-w-full tw-bg-white tw-p-4 tw-rounded-2xl dark:tw-bg-dark-panel"
                        >
                            <div class="tw-flex tw-justify-between tw-mb-2 tw-w-full">
                                <div class="tw-flex tw-items-center tw-gap-x-2 tw-w-full">
                                    <div class="tw-flex tw-flex-col tw-gap-y-2 tw-w-full tw-leading-4">
                                        <div class="tw-flex tw-justify-between tw-items-center tw-w-full">
                                            <span class="tw-text-[10px] tw-text-[#AEB7C1]">{{
                                                item.id
                                            }}</span>
                                            <div v-if="item.status.value === 'taken'" class="tw-flex tw-items-center">
                                                <div
                                                    class="tw-flex tw-flex-col tw-justify-center tw-items-center tw-rounded-xl tw-border-2 tw-border-solid tw-border-[#EF4B27] tw-w-[108px] tw-h-[28px] tw-mt-1"
                                                >
                                                    <span class="tw-text-[#EF4B27] tw-text-xs">
                                                        В работе
                                                        <vue-countdown
                                                            :time="item.status.timeout"
                                                            v-slot="{ minutes, seconds }"
                                                        >
                                                            {{ minutes.toString().padStart(2, '0') }}:{{ seconds.toString().padStart(2, '0') }}
                                                        </vue-countdown>
                                                    </span>
                                                </div>
                                                <v-menu>
                                                    <template v-slot:activator="{ props }">
                                                        <v-btn
                                                            class="!tw-border-none !tw-bg-none !tw-shadow-none dark:tw-bg-dark-panel"
                                                            icon="mdi-dots-vertical"
                                                            v-bind="props"
                                                        ></v-btn>
                                                    </template>

                                                    <v-list>
                                                        <v-list-item
                                                            class="tw-cursor-pointer hover:tw-bg-gray-200"
                                                            @click="openOnConfirmBid(bidsItemsUser[index])"
                                                        >
                                                            <v-list-item-title
                                                                ><span class="tw-select-none"
                                                                    >Выполнить</span
                                                                ></v-list-item-title
                                                            >
                                                        </v-list-item>
                                                        <v-list-item
                                                            class="tw-cursor-pointer hover:tw-bg-gray-200"
                                                            @click="openOnCancelUser(bidsItemsUser[index])"
                                                        >
                                                            <v-list-item-title
                                                                ><span class="tw-select-none tw-text-red"
                                                                    >Отклонить</span
                                                                ></v-list-item-title
                                                            >
                                                        </v-list-item>
                                                    </v-list>
                                                </v-menu>
                                            </div>
                                            <div
                                                v-if="item.status.value === 'cancelled'"
                                                class="tw-rounded-xl tw-border-2 tw-border-solid tw-border-gray tw-w-[104px] tw-px-2 tw-py-1 tw-text-center"
                                            >
                                                <span class="tw-text-gray tw-text-xs">Отклонён</span>
                                            </div>
                                            <div
                                                v-if="item.status.value === 'done'"
                                                class="tw-rounded-xl tw-border-2 tw-border-solid tw-border-green tw-w-[104px] tw-px-2 tw-py-1 tw-text-center"
                                            >
                                                <span class="tw-text-green tw-text-xs">Выполнен</span>
                                            </div>
                                        </div>
                                        <div class="tw-flex tw-gap-x-2">
                                            <span
                                                ><span class="tw-text-[17px]">{{
                                                    formatter.format(item.paymentSum)
                                                }}</span>
                                                <span class="tw-ml-2 tw-text-[13px] tw-text-gray-dark"
                                                    >RUB</span
                                                ></span
                                            >
                                            <span>/</span>
                                            <span
                                                ><span class="tw-text-[17px]">{{
                                                    formatter.format(item.sumUSDT)
                                                }}</span>
                                                <span class="tw-ml-2 tw-text-[13px] tw-text-gray-dark"
                                                    >USDT</span
                                                ></span
                                            >
                                        </div>
                                        <span>{{ item.method.methodValue }}</span><br>
                                        <span class="tw-text-[15px] tw-text-gray-dark">{{ item.method.methodBank }}</span>
                                        <div class="tw-flex tw-flex-col tw-gap-y-3 tw-py-2 tw-border-t-2 tw-border-l-0 tw-border-r-0 tw-border-b-0 tw-border-[#E0E4E8] tw-border-dashed">
                                            <span class="tw-text-[15px]">{{ item.requisites }}</span>
                                            <span>
                                                <span class="tw-text-[15px]">{{ item.date.value }}</span><br />
                                                <span class="tw-text-[10px]">{{ item.date.different }}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </section>
                <v-btn
                    v-if="bidsItemsUser.length > 0"
                    class="!tw-rounded-xl !tw-h-[50px] tw-w-full tw-mt-5"
                    variant="outlined"
                    color="#04B6F5"
                    @click="loadMore"
                >
                    <span class="tw-tracking-normal tw-normal-case">Показать ещё</span>
                </v-btn>
            </v-window-item>
        </v-window>
        <div
            v-if="loading"
            class="tw-flex tw-justify-center tw-items-center tw-w-full tw-h-[326px]"
        >
            <v-progress-circular indeterminate color="#04B6F5"></v-progress-circular>
        </div>

        <v-card v-if="mobileFilter" class="!tw-fixed !tw-top-0 !tw-left-0 !tw-z-[2000] !tw-h-[100dvh] !tw-w-screen !tw-flex !tw-flex-col !tw-justify-between !tw-items-center !tw-rounded-2xl lg:!tw-p-[48px] xl:!tw-p-[48px] md:!tw-p-[26px] sm:!tw-p-[20px]">
                <section class="tw-w-full">
                    <div class="tw-flex tw-justify-between tw-items-center tw-w-full tw-mb-4">
                        <span class="tw-text-2xl">Фильтр</span>
                        <span class="tw-text-[13px] tw-text-[#677483] tw-select-none tw-cursor-pointer" @click="reset">Очистить фильтр</span>
                    </div>
                    <div class="tw-flex tw-flex-col tw-items-start tw-w-full">
                        <v-text-field
                            v-model="searchModel"
                            class="tw-w-full"
                            variant="outlined"
                            label="Поиск по ID"
                            append-inner-icon="mdi mdi-magnify"
                            single-line
                            @update:model-value="debounce((val: any) => searchValue(val as string), 1000)(searchModel)"
                        ></v-text-field>
                    </div>
                    <div class="tw-flex tw-flex-col tw-items-start tw-w-full">
                        <v-select
                            v-model="methods.select"
                            :items="methods.items"
                            label="Методы"
                            class="tw-w-full"
                            variant="outlined"
                            item-title="name"
                            item-value="value"
                            clearable
                            @click:clear="clearMethods"
                            @update:model-value="fetchData"
                        ></v-select>
                    </div>
                    <div class="tw-flex tw-flex-col tw-items-start tw-w-full">
                        <Datepicker
                                v-model="date"
                                input-class-name="tw-h-[56px] !tw-rounded-xl !tw-border-gray-400 dark:tw-bg-dark-panel"
                                menu-class-name="sm:!tw-fixed sm:tw-top-0 sm:tw-left-0 sm:tw-w-full sm:tw-h-[100dvh]
                                        md:!tw-fixed md:tw-top-0 md:tw-left-0 md:tw-w-full md:tw-h-[100dvh] dark:tw-bg-dark-panel dark:tw-text-light"
                                :teleport="true"
                                @internal-model-change="fetchData"
                                @cleared="date = ['', '']"
                                range
                            >
                                <template #action-row="{ closePicker }">
                                    <div class="tw-h-[100px]"></div>
                                    <section
                                        class="sm:tw-absolute sm:tw-bottom-2 tw-flex sm:tw-flex-col md:tw-flex-col sm:tw-gap-y-2 md:tw-gap-y-2 min-lg:tw-justify-end tw-items-center min-lg:tw-gap-x-1 tw-w-full"
                                    >
                                        <v-btn
                                            class="!tw-rounded-xl sm:!tw-w-[90%] md:!tw-w-[90%]"
                                            variant="outlined"
                                            color="#04B6F5"
                                            size="large"
                                            @click="closePicker"
                                            >Отменить</v-btn
                                        >
                                        <v-btn
                                            class="!tw-rounded-xl sm:!tw-w-[90%] md:!tw-w-[90%]"
                                            variant="elevated"
                                            color="#04B6F5"
                                            size="large"
                                            @click="setDate"
                                        >
                                            <span class="tw-text-white">Применить</span>
                                        </v-btn>
                                    </section>
                                </template>
                            </Datepicker>
                    </div>
                </section>
                <v-card-actions class="tw-absolute tw-bottom-0">
                    <section class="tw-flex tw-flex-col tw-gap-y-4">
                        <v-btn class="tw-w-[326px] !tw-h-[50px] !tw-rounded-xl !tw-normal-case" color="#04B6F5" variant="elevated" block @click="applyMobileFilter">
                            <span class="tw-text-white tw-text-[15px] !tw-normal-case">Применить</span>
                        </v-btn>
                        <v-btn class="tw-w-[326px] !tw-h-[50px] !tw-rounded-xl !tw-normal-case !tw-m-auto" color="#04B6F5" variant="outlined" @click="closeMobileFilter">
                            Отмена
                        </v-btn>
                    </section>
                </v-card-actions>
            </v-card>
    </RenderOn>

    <section
        v-if="!loading && bidsItemsUser.length === 0 && bidsItemsAll.length === 0"
        class="tw-flex tw-flex-col tw-justify-center tw-items-center tw-w-full tw-h-[calc(100vh-400px)]"
    >
        <div class="tw-text-center">
            <Stars /><br />
            <span class="tw-text-lg tw-text-[#677483] tw-font-semibold">Откупы отстутствуют</span>
        </div>
    </section>

    <v-snackbar
        v-model="bidErrorSnackbar.show"
        :timeout="bidErrorSnackbar.timeout"
        color="red"
    >
        {{ bidErrorSnackbar.text }}

        <template v-slot:actions>
            <v-btn
                color="white"
                variant="text"
                @click="bidErrorSnackbar.show = false"
            >
                Скрыть
            </v-btn>
        </template>
    </v-snackbar>

    <RenderOn :px="840">
        <v-pagination
            v-if="bidsItemsUser.length !== 0 || bidsItemsAll.length !== 0"
            class="tw-self-start"
            v-model="page"
            :length="lastPage"
            :total-visible="7"
        >
            <template v-slot:prev>
                <div
                    class="tw-bg-white dark:tw-bg-dark-panel tw-border-[1px] tw-border-solid tw-text-[17px] tw-rounded-xl tw-w-[40px] tw-h-[40px] tw-text-center tw-select-none tw-cursor-pointer tw-border-[#04B6F5] tw-text-[#04B6F5] hover:tw-bg-blue-200"
                    @click="decPage"
                >
                    <div class="tw-mt-[6px]">
                        <svg
                            width="10"
                            height="16"
                            viewBox="0 0 8 14"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M7.5 13.25L1.25 7L7.5 0.75"
                                stroke="#04B6F5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                    </div>
                </div>
            </template>
            <template v-slot:item="{ isActive, page }">
                <div
                    v-if="page !== '...'"
                    class="tw-bg-white dark:tw-bg-dark-panel tw-border-[1px] tw-border-solid tw-text-[17px] tw-rounded-xl tw-w-[40px] tw-h-[40px] tw-text-center tw-select-none tw-cursor-pointer"
                    :class="{
                        'tw-border-[#04B6F5] tw-text-[#04B6F5] hover:tw-bg-blue-200': !isActive,
                        'tw-border-[#AEB7C1] tw-text-[#AEB7C1]': isActive
                    }"
                    @click="changePage(page, isActive)"
                >
                    <div class="tw-text-[15px] tw-font-semibold tw-mt-[6px]">{{ page }}</div>
                </div>
                <div v-if="page === '...'" class="tw-mt-2">
                    <span class="tw-text-[15px] tw-text-[#AEB7C1] tw-font-semibold">{{
                        page
                    }}</span>
                </div>
            </template>
            <template v-slot:next>
                <div
                    class="tw-bg-white dark:tw-bg-dark-panel tw-border-[1px] tw-border-solid tw-text-[17px] tw-rounded-xl tw-w-[40px] tw-h-[40px] tw-text-center tw-select-none tw-cursor-pointer tw-border-[#04B6F5] tw-text-[#04B6F5] hover:tw-bg-blue-200"
                    @click="incPage"
                >
                    <div class="tw-mt-[6px]">
                        <svg
                            width="10"
                            height="16"
                            viewBox="0 0 8 14"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M0.500001 0.749999L6.75 7L0.5 13.25"
                                stroke="#04B6F5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                    </div>
                </div>
            </template>
        </v-pagination>
    </RenderOn>
</template>
