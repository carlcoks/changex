<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { debounce } from 'vue-debounce'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { usePaymentsStore } from '@/stores/payments'
import { useCardsStore } from '@/stores/cards'
import { storeToRefs } from 'pinia'
import RenderOn from '@/components/utils/RenderOn.vue'
import Stars from '@/components/icons/Stars.vue'
import CaretRight from '@/components/icons/CaretRight.vue'
import ReloadBtn from '@/components/common/ReloadBtn/ReloadBtn.vue'
import { datetimeToTimestamp } from '@/utils'
import { watchEffect } from 'vue'

const props = defineProps<{
    reload: boolean
}>()

const paymentsStore = usePaymentsStore()
const { loading, paymentsItemsAll, lastPage } = storeToRefs(paymentsStore)

const cardsStore = useCardsStore()
const { itemsAll } = storeToRefs(cardsStore)

const searchModel = ref('')
const searchQuery = ref('')

const cardSearchModel = ref('')
const cardSearchQuery = ref('')

const date = ref(['', ''])
const page = ref(1)

const mobileFilter = ref(false)

const headers = ref([
    {
        title: 'ID',
        sortable: true,
        sortParams: {
            value: 'paymentId',
            name: 'ID'
        },
        key: 'id'
    },
    {
        title: 'Время',
        sortable: true,
        sortParams: {
            value: 'timestamp_desc',
            name: 'Времени'
        },
        key: 'date'
    },
    {
        title: 'Сумма',
        sortable: true,
        sortParams: {
            value: 'amount',
            name: 'Сумме'
        },
        key: 'sum'
    },
    {
        title: 'Списано',
        sortable: true,
        sortParams: {
            value: 'withdrawalAmount',
            name: 'Списано'
        },
        key: 'debit'
    },
    {
        title: 'Карта',
        sortable: true,
        sortParams: {
            value: 'card',
            name: 'Карте'
        },
        key: 'card'
    },
    {
        title: 'Статус',
        sortable: true,
        sortParams: {
            value: 'status',
            name: 'Статусу'
        },
        key: 'status'
    }
])

const statuses = reactive({
    select: undefined,
    items: [
        {
            value: 'awaiting',
            name: 'В ожидании'
        },
        {
            value: 'cancelled',
            name: 'Отменённые'
        },
        {
            value: 'dispute',
            name: 'Диспуты'
        },
        {
            value: 'done',
            name: 'Завершённые'
        },
        {
            value: 'dispute_closed',
            name: 'Завершённые диспуты'
        }
    ]
})

function fetchData() {    
    paymentsStore.fetchPayments({
        search: searchQuery.value,
        page: page.value,
        countPerPage: 10,
        sort: sort.value,
        filter: {
            fromTimestamp: datetimeToTimestamp(date?.value[0]),
            toTimestamp: datetimeToTimestamp(date?.value[1]),
            cardUID: cards.selected?.uid || undefined,
            status: statuses.select || undefined
        }
    }).then(() => {
        paymentsStore.hideLoading()
    })
}

function clearStatuses() {
    statuses.select = undefined
}

const cards = reactive({
    selected: undefined,
    items: []
})

function searchCardValue(queryText: string) {
    cardSearchQuery.value = queryText
        cardsStore.fetchCards({ search: cardSearchQuery.value }).then(() => {
            cards.items = itemsAll.value.map((cardItem) => {
                return {
                    uid: cardItem.id,
                    type: cardItem.card.type,
                    num: cardItem.card.num
                }
            })
        })
}

// function setSelectedCard(value) {
//     cards.selected = value
//     fetchData()
// }

function clearAutocomplete() {
    cards.selected = undefined
    fetchData()
}

const sort = reactive({
    value: 'timestamp_desc',
    name: 'Времени'
})

const sortOptions = ref([
    {
        value: '',
        name: 'Не сортировать'
    },
    {
        value: 'paymentId',
        name: 'ID'
    },
    {
        value: 'timestamp_desc',
        name: 'Времени'
    },
    {
        value: 'amount',
        name: 'Сумме'
    },
    {
        value: 'withdrawalAmount',
        name: 'Списано'
    },
    {
        value: 'card',
        name: 'Карте'
    },
    {
        value: 'status',
        name: 'Статусу'
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
    cardSearchQuery.value = ''
    date.value = ['', '']
    cards.selected = undefined
    statuses.select = undefined

    fetchData()
}

function applyMobileFilter() {
    mobileFilter.value = !mobileFilter.value
}

/** Reset filter on close mobile filter window **/
function closeMobileFilter() {
    mobileFilter.value = !mobileFilter.value
}

function changePage(newPage: string, isActive: boolean) {
    if (isActive) {
        return
    }

    page.value = Number(newPage.replace(",", ""))
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
        paymentsStore.loadMorePayments({
            search: searchQuery.value,
            page: page.value,
            countPerPage: 10,
            sort: sort.value,
            filter: {
                cardUID: cards.selected?.uid,
                status: statuses.select
            }
        }).then(() => {
            paymentsStore.hideLoading()
        })
    }
}

onMounted(() => {
    cardsStore.fetchCards({page: 1}).then(() => {
        cards.items = itemsAll.value.map((cardItem) => {
                return {
                    uid: cardItem.id,
                    type: cardItem.card.type,
                    num: cardItem.card.num
                }
            })
    })
    fetchData()
})

watch(props, (newValue: Record<string, boolean>, _prevValue: Record<string, boolean>) => {
    if (newValue.reload) {
        fetchData()
    }
})
</script>

<template>
    <RenderOn :px="840">
        <v-card class="tw-w-full tw-h-[94px] !tw-rounded-2xl !tw-py-[23px] !tw-px-[24px] tw-mb-6 dark:tw-bg-dark-panel">
            <section class="tw-w-full tw-flex tw-items-center">
                <section class="tw-w-full tw-flex tw-items-center tw-gap-x-4">
                    <v-responsive class="mx-auto" min-width="92" max-width="462">
                        <v-text-field
                            v-model="searchModel"
                            variant="outlined"
                            label="Поиск по ID"
                            append-inner-icon="mdi mdi-magnify"
                            single-line
                            @update:model-value="debounce((val: any) => searchValue(val as string), 1000)(searchModel)"
                        ></v-text-field>
                    </v-responsive>
                    <v-responsive class="mx-auto -tw-mt-5" min-width="92" max-width="462">
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
                                <section class="sm:tw-absolute sm:tw-bottom-2 tw-flex sm:tw-flex-col md:tw-flex-col sm:tw-gap-y-2 md:tw-gap-y-2 min-lg:tw-justify-end tw-items-center min-lg:tw-gap-x-1 tw-w-full">
                                    <v-btn class="!tw-rounded-xl sm:!tw-w-[90%] md:!tw-w-[90%]" variant="outlined" color="#04B6F5" size="large" @click="closePicker">Отменить</v-btn>
                                    <v-btn class="!tw-rounded-xl sm:!tw-w-[90%] md:!tw-w-[90%]" variant="elevated" color="#04B6F5" size="large" @click="setDate">
                                        <span class="tw-text-white">Применить</span>
                                    </v-btn>
                                </section>
                            </template>
                        </Datepicker>
                    </v-responsive>
                    <v-responsive class="mx-auto" min-width="92" max-width="462">
                        <v-autocomplete
                            v-model="cards.selected"
                            label="Все карты"
                            variant="outlined"
                            item-title="num"
                            no-filter
                            return-object
                            clearable
                            :items="cards.items"
                            @update:search="(value) => debounce((val: any) => searchCardValue(val as string), 1000)(value)"
                            @update:model-value="fetchData"
                            @click:clear="clearAutocomplete"
                        >
                            <!-- <template v-slot:item="{ item, props }">
                                <v-list-item v-bind="props">
                                    <div class="tw-flex tw-items-center">
                                        <img :src="`/payment/${item.value.type}.png`" :alt="item.value.type"/>
                                        <span class="tw-ml-2">**** **** **** {{ item.value.num }}</span>
                                    </div>
                                </v-list-item>
                            </template> -->
                        </v-autocomplete>
                    </v-responsive>
                    <v-responsive class="mx-auto" min-width="92" max-width="462">
                        <v-select
                            v-model="statuses.select"
                            :items="statuses.items"
                            label="Все статусы"
                            variant="outlined"
                            item-title="name"
                            item-value="value"
                            clearable
                            @click:clear="clearStatuses"
                            @update:model-value="fetchData"
                        ></v-select>
                    </v-responsive>
                    <v-responsive class="mx-auto -tw-mt-5" min-width="92" max-width="462">
                        <div class="tw-flex tw-items-center tw-gap-x-2">
                            <v-btn
                                class="!tw-rounded-2xl !tw-normal-case !tw-w-[80%]"
                                variant="outlined"
                                color="#04B6F5"
                                size="x-large"
                                @click="reset"
                            >
                                <span class="tw-text-[#04B6F5] tw-text-[15px] tw-tracking-normal"
                                    >Сбросить фильтр</span
                                >
                            </v-btn>
                            <ReloadBtn @click="fetchData" />
                        </div>
                    </v-responsive>
                </section>
            </section>
        </v-card>
        <v-card class="!tw-rounded-2xl tw-mb-6">
            <v-data-table :headers="headers" :items="paymentsItemsAll" :footer="false" :loading="loading" hide-no-data>
                <template v-slot:headers="{ columns }">
                    <tr>
                        <template v-for="column in columns" :key="column.key">
                            <td class="tw-cursor-pointer" @click="() => setSort(column.sortParams)">
                                <span class="tw-text-[13px] tw-text-[#677483] tw-mr-2">{{ column.title }}</span>
                                {{  column.sort  }}
                                <template v-if="column.sortable">
                                    <template v-if="column.sortParams.value === sort.value">
                                        <svg style="transform: rotate(180deg);" width="11" height="7" viewBox="0 0 11 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M10.621 0.943362C10.5852 0.858049 10.5249 0.785259 10.4477 0.734166C10.3706 0.683073 10.28 0.655963 10.1875 0.656252H0.812455C0.719912 0.655963 0.629354 0.683073 0.552193 0.734166C0.475032 0.785259 0.414721 0.858049 0.378861 0.943362C0.345089 1.02994 0.336522 1.12432 0.35415 1.21557C0.371777 1.30682 0.41488 1.39121 0.47847 1.45899L5.16597 6.14649C5.25557 6.23312 5.37532 6.28155 5.49995 6.28155C5.62459 6.28155 5.74434 6.23312 5.83394 6.14649L10.5214 1.45899C10.585 1.39121 10.6281 1.30682 10.6458 1.21557C10.6634 1.12432 10.6548 1.02994 10.621 0.943362Z" fill="#677483"/>
                                        </svg>
                                    </template>
                                    <template v-else>
                                        <svg width="11" height="7" viewBox="0 0 11 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M10.621 0.943362C10.5852 0.858049 10.5249 0.785259 10.4477 0.734166C10.3706 0.683073 10.28 0.655963 10.1875 0.656252H0.812455C0.719912 0.655963 0.629354 0.683073 0.552193 0.734166C0.475032 0.785259 0.414721 0.858049 0.378861 0.943362C0.345089 1.02994 0.336522 1.12432 0.35415 1.21557C0.371777 1.30682 0.41488 1.39121 0.47847 1.45899L5.16597 6.14649C5.25557 6.23312 5.37532 6.28155 5.49995 6.28155C5.62459 6.28155 5.74434 6.23312 5.83394 6.14649L10.5214 1.45899C10.585 1.39121 10.6281 1.30682 10.6458 1.21557C10.6634 1.12432 10.6548 1.02994 10.621 0.943362Z" fill="#677483"/>
                                        </svg>
                                    </template>
                                </template>
                            </td>
                        </template>
                    </tr>
                </template>
                <template v-slot:item.id="{ value }">
                    <span class="tw-text-[15px] tw-text-gray-500">{{ value }}</span>
                </template>
                <template v-slot:item.date="{ value }">
                    <span class="tw-text-[15px]">{{ value.value }}</span><br>
                    <span class="tw-text-[10px]">{{ value.different }}</span>
                </template>
                <template v-slot:item.card="{ value }">
                    <div class="tw-flex tw-items-center tw-gap-x-4">
                        <img :src="`/payment/${value.type}.svg`" :alt="value.type" />
                        <span class="tw-text-[15px]">**** {{ value.num }}</span>
                    </div>
                </template>
                <template v-slot:item.sum="{ value }">
                    <span
                        ><span class="tw-text-[15px]">{{ value.value }}</span>
                        <span class="tw-text-[13px] tw-text-gray-dark tw-ml-1">{{ value.currency }}</span></span
                    >
                </template>
                <template v-slot:item.debit="{ value }">
                    <span
                        ><span class="tw-text-[15px]">{{ value.value }}</span>
                        <span class="tw-text-[13px] tw-text-gray-dark tw-ml-1">USDT</span></span
                    >
                </template>
                <template v-slot:item.status="{ value, index }">
                    <div v-if="value === 'awaiting'" class="tw-flex tw-gap-x-2">
                        <div
                            class="tw-rounded-xl tw-border-2 tw-border-solid tw-border-[#0085FF] tw-w-[158px] tw-px-2 tw-py-1 tw-text-center"
                        >
                            <span class="tw-text-[#0085FF] tw-text-xs">Ожидается платёж</span>
                        </div>
                        <!-- <div class="tw-flex tw-items-center tw-gap-x-2 tw-cursor-pointer">
                            <svg
                                width="26"
                                height="26"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M12.8562 4.71875L6.2937 11.2812L3.01245 8"
                                    stroke="#04B6F5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                            <span class="tw-text-[15px] tw-text-[#04B6F5] tw-leading-4 tw-select-none"
                                >Подтвердить<br />
                                вручную</span
                            >
                        </div> -->
                    </div>
                    <div
                        v-if="value === 'cancelled'"
                        class="tw-rounded-xl tw-border-2 tw-border-solid tw-border-red tw-w-[104px] tw-px-2 tw-py-1 tw-text-center"
                    >
                        <span class="tw-text-red tw-text-xs">Отменён</span>
                    </div>
                    <div
                        v-if="value === 'dispute'"
                        class="tw-flex tw-gap-x-1"
                    >
                        <div class="tw-rounded-xl tw-border-2 tw-border-solid tw-border-red tw-w-[104px] tw-px-2 tw-py-1 tw-text-center">
                            <span class="tw-text-red tw-text-xs">Диспут</span>
                        </div>
                        <div class="tw-flex tw-flex-col tw-items-center tw-justify-center
                                    tw-border-solid tw-border-[2px] tw-border-[#AEB7C1] tw-rounded-xl tw-w-[35px]
                                    tw-cursor-pointer hover:tw-bg-gray-mid"
                            @click="$router.push(`/disputs?id=${paymentsItemsAll[index].id}`)"
                        >
                            <CaretRight />
                        </div>
                    </div>
                    <div
                        v-if="value === 'done'"
                        class="tw-rounded-xl tw-border-2 tw-border-solid tw-border-green tw-w-[104px] tw-px-2 tw-py-1 tw-text-center"
                    >
                        <span class="tw-text-green tw-text-xs">Завершён</span>
                    </div>
                    <div
                        v-if="value === 'dispute_closed'"
                        class="tw-rounded-xl tw-border-2 tw-border-solid tw-border-orange tw-w-[104px] tw-px-2 tw-py-1 tw-text-center"
                    >
                        <span class="tw-text-orange tw-text-xs">Завершён</span>
                    </div>
                </template>
                <template v-slot:loading>
                    <v-skeleton-loader type="table-row@6"></v-skeleton-loader>
                </template>
                <template v-slot:bottom></template>
            </v-data-table>
        </v-card>
    </RenderOn>

    <RenderOn :px-min="320" :px-max="839">
        <section class="tw-flex tw-justify-between tw-w-full tw-mb-5">
            <div>
                <span class="tw-text-[13px] tw-select-none">
                    Сортировать по <v-menu>
                        <template v-slot:activator="{ props }">
                            <span class="tw-text-[#04B6F5]" v-bind="props">{{ sort.name }}</span>
                        </template>

                        <v-list>
                            <template v-for="option in sortOptions" :key="option">
                                <v-list-item class="tw-cursor-pointer hover:tw-bg-gray-200" @click="setSort(option)">
                                    <v-list-item-title><span class="tw-select-none">{{ option.name }}</span></v-list-item-title>
                                </v-list-item>
                            </template>
                        </v-list>
                    </v-menu>
                </span>
            </div>
            <div class="tw-flex tw-items-center tw-cursor-pointer" @click="mobileFilter = !mobileFilter">
                <span class="tw-text-[13px] tw-text-[#04B6F5] tw-select-none">Фильтр</span>
                <Filter />
            </div>
        </section>
        <section v-if="paymentsItemsAll.length > 0" class="tw-flex tw-flex-col tw-gap-y-2 tw-overflow-y-scroll tw-h-[520px]">
                <template v-for="(item, index) in paymentsItemsAll" :key="item">
                    <div class="tw-flex tw-flex-col tw-w-full tw-bg-white dark:tw-bg-dark-panel tw-px-4 tw-py-2 tw-rounded-2xl">
                        <div class="tw-flex tw-justify-between tw-items-center tw-w-full tw-mb-2">
                            <div class="tw-flex tw-flex-col">
                                <span class="tw-text-[10px] tw-text-[#AEB7C1]">{{ item.id }}</span>
                                <span class="tw-text-[13px] tw-font-semibold">{{ item.date.value }}</span>
                                <span class="tw-text-[10px] tw-font-semibold tw-text-[#AEB7C1]">{{ item.date.different }}</span>
                            </div>
                            <div
                                v-if="item.status === 'awaiting'"
                                class="tw-flex tw-flex-col tw-justify-start tw-rounded-xl tw-border-2 tw-border-solid tw-border-[#0085FF] tw-w-[104px] tw-px-2 tw-py-1 tw-text-center"
                            >
                                <span class="tw-text-[#0085FF] tw-text-xs">Ожидается платёж</span>
                            </div>
                            <div
                                v-if="item.status === 'cancelled'"
                                class="tw-flex tw-flex-col tw-justify-start tw-border-red tw-rounded-xl tw-border-2 tw-border-solid tw-w-[104px] tw-px-2 tw-py-1 tw-text-center"
                            >
                                <span class="tw-text-red tw-text-xs">Отменён</span>
                            </div>
                            <div
                                v-if="item.status === 'dispute'"
                                class="tw-flex tw-gap-x-1"
                            >
                                <div class="tw-rounded-xl tw-border-2 tw-border-solid tw-border-red tw-w-[104px] tw-px-2 tw-py-1 tw-text-center">
                                    <span class="tw-text-red tw-text-xs">Диспут</span>
                                </div>
                                <div class="tw-flex tw-flex-col tw-items-center tw-justify-center
                                        tw-border-solid tw-border-[2px] tw-border-[#AEB7C1] tw-rounded-xl tw-w-[35px]
                                        tw-cursor-pointer hover:tw-bg-gray-mid"
                                @click="$router.push(`/disputs?id=${paymentsItemsAll[index].id}`)"
                            >
                                <CaretRight />
                            </div>
                            </div>
                            <div
                                v-if="item.status === 'done'"
                                class="tw-flex tw-flex-col tw-justify-start tw-rounded-xl tw-border-2 tw-border-solid tw-border-green tw-w-[104px] tw-px-2 tw-py-1 tw-text-center"
                            >
                                <span class="tw-text-green tw-text-xs">Завершён</span>
                            </div>
                            <div
                                v-if="item.status === 'dispute_closed'"
                                class="tw-flex tw-flex-col tw-justify-start tw-rounded-xl tw-border-2 tw-border-solid tw-border-orange tw-w-[104px] tw-px-2 tw-py-1 tw-text-center"
                            >
                                <span class="tw-text-orange tw-text-xs">Завершён</span>
                            </div>
                        </div>
                        
                        <div class="tw-flex tw-gap-x-20 tw-items-center tw-w-full tw-mb-2">
                            <div class="tw-flex tw-flex-col">
                                <span class="tw-text-[10px] tw-text-[#AEB7C1]">Сумма</span>
                                <span
                                    ><span class="tw-text-[15px]">{{ item.sum.value }}</span>
                                    <span class="tw-text-[13px] tw-text-gray-dark tw-ml-1">{{ item.sum.currency }}</span></span
                                >
                            </div>
                            <div class="tw-flex tw-flex-col">
                                <span class="tw-text-[10px] tw-text-[#AEB7C1]">Списано</span>
                                <span
                                    ><span class="tw-text-[15px]">{{ item.debit.value }}</span>
                                    <span class="tw-text-[13px] tw-text-gray-dark tw-ml-1">USDT</span></span
                                >
                            </div>
                        </div>
                        <div class="tw-border-t-2 tw-border-l-0 tw-border-r-0 tw-border-b-0 tw-border-[#E0E4E8] tw-border-dashed tw-py-2">
                            <div class="tw-flex tw-items-center tw-gap-x-4">
                                <img :src="`/payment/${item.card.type}.svg`" :alt="item.card.type" />
                                <span class="tw-text-[15px]">**** {{ item.card.num }}</span>
                            </div>
                        </div>
                    </div>
                </template>
            </section>

            <div v-if="loading" class="tw-flex tw-justify-center tw-items-center tw-w-full tw-h-[326px]">
                <v-progress-circular
                    indeterminate
                    color="#04B6F5"
                ></v-progress-circular>
            </div>

            <v-btn v-if="paymentsItemsAll.length > 0" class="!tw-rounded-xl !tw-h-[50px] tw-mt-5" variant="outlined" color="#04B6F5" @click="loadMore">
                <span class="tw-tracking-normal tw-normal-case">Показать ещё</span>
            </v-btn>

            <v-card v-if="mobileFilter" class="!tw-fixed !tw-top-0 !tw-left-0 !tw-z-[2000] !tw-h-screen !tw-w-screen !tw-flex !tw-flex-col !tw-items-center !tw-rounded-2xl lg:!tw-p-[48px] xl:!tw-p-[48px] md:!tw-p-[26px] sm:!tw-p-[20px]">
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
                <div class="tw-flex tw-flex-col tw-items-start tw-w-full tw-mb-5">
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
                                <section class="sm:tw-absolute sm:tw-bottom-2 tw-flex sm:tw-flex-col md:tw-flex-col sm:tw-gap-y-2 md:tw-gap-y-2 min-lg:tw-justify-end tw-items-center min-lg:tw-gap-x-1 tw-w-full">
                                    <v-btn class="!tw-rounded-xl sm:!tw-w-[90%] md:!tw-w-[90%]" variant="outlined" color="#04B6F5" size="large" @click="closePicker">Отменить</v-btn>
                                    <v-btn class="!tw-rounded-xl sm:!tw-w-[90%] md:!tw-w-[90%]" variant="elevated" color="#04B6F5" size="large" @click="setDate">
                                        <span class="tw-text-white">Применить</span>
                                    </v-btn>
                                </section>
                            </template>
                        </Datepicker>
                </div>
                <div class="tw-flex tw-flex-col tw-items-start tw-w-full">
                    <v-autocomplete
                        v-model="cards.selected"
                        label="Все карты"
                        class="tw-w-full"
                        variant="outlined"
                        item-title="num"
                        no-filter
                        return-object
                        clearable
                        :items="cards.items"
                        @update:search="(value) => debounce((val: any) => searchCardValue(val as string), 1000)(value)"
                        @update:model-value="fetchData"
                        @click:clear="clearAutocomplete"
                    >
                            <!-- <template v-slot:item="{ item, props }">
                                <v-list-item v-bind="props">
                                    <div class="tw-flex tw-items-center">
                                        <img :src="`/payment/${item.value.type}.png`" :alt="item.value.type"/>
                                        <span class="tw-ml-2">**** **** **** {{ item.value.num }}</span>
                                    </div>
                                </v-list-item>
                            </template> -->
                    </v-autocomplete>
                </div>
                <div class="tw-w-full">
                    <v-select
                        v-model="statuses.select"
                        :items="statuses.items"
                        class="tw-w-full"
                        label="Все статусы"
                        variant="outlined"
                        item-title="name"
                        item-value="value"
                        clearable
                        :open="true"
                        @click:clear="clearStatuses"
                        @update:model-value="fetchData"
                    ></v-select>
                </div>
                <v-card-actions class="tw-absolute tw-bottom-1">
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

    <section v-if="!loading && paymentsItemsAll.length === 0" class="tw-flex tw-flex-col tw-justify-center tw-items-center tw-w-full tw-h-[calc(100vh-400px)]">
        <div class="tw-text-center">
            <Stars /><br>
            <span class="tw-text-lg tw-text-[#677483] tw-font-semibold">Платежи отсутствуют</span>
        </div>
    </section>

    <RenderOn :px="840">
        <v-pagination
            v-if="paymentsItemsAll.length > 0"
            class="tw-self-start"
            v-model="page"
            :length="lastPage"
            :total-visible="7"
        >
            <template v-slot:prev>
                <div class="tw-bg-white dark:tw-bg-dark-panel tw-border-[1px] tw-border-solid tw-text-[17px]
                    tw-rounded-xl tw-w-[40px] tw-h-[40px] tw-text-center tw-select-none tw-cursor-pointer
                    tw-border-[#04B6F5] tw-text-[#04B6F5] hover:tw-bg-blue-200"
                    @click="decPage"
                >
                    <div class="tw-mt-[6px]">
                        <svg width="10" height="16" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.5 13.25L1.25 7L7.5 0.75" stroke="#04B6F5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
            </template>
            <template v-slot:item="{ isActive, page }">
                <div v-if="page !== '...'" class="tw-bg-white dark:tw-bg-dark-panel tw-border-[1px] tw-border-solid tw-text-[17px]
                    tw-rounded-xl tw-w-[40px] tw-h-[40px] tw-text-center tw-select-none tw-cursor-pointer"
                    :class="{ 'tw-border-[#04B6F5] tw-text-[#04B6F5] hover:tw-bg-blue-200': !isActive, 'tw-border-[#AEB7C1] tw-text-[#AEB7C1]': isActive }"
                    @click="changePage(page, isActive)"
                >
                    <div class="tw-text-[15px] tw-font-semibold tw-mt-[6px]">{{ page }}</div>
                </div>
                <div v-if="page === '...'" class="tw-mt-2">
                    <span class="tw-text-[15px] tw-text-[#AEB7C1] tw-font-semibold">{{ page }}</span>
                </div>
            </template>
            <template v-slot:next>
                <div class="tw-bg-white dark:tw-bg-dark-panel tw-border-[1px] tw-border-solid tw-text-[17px]
                    tw-rounded-xl tw-w-[40px] tw-h-[40px] tw-text-center tw-select-none tw-cursor-pointer
                    tw-border-[#04B6F5] tw-text-[#04B6F5] hover:tw-bg-blue-200"
                    @click="incPage"
                >
                    <div class="tw-mt-[6px]">
                        <svg width="10" height="16" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.500001 0.749999L6.75 7L0.5 13.25" stroke="#04B6F5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
            </template>
        </v-pagination>
    </RenderOn>
</template>
