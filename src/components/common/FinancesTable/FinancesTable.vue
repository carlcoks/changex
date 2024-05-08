<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { formatter } from '../../../utils'
import { useFinancesStore } from '@/stores/finances'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import RenderOn from '@/components/utils/RenderOn.vue'
import ArrowUpRight from '../../icons/ArrowUpRight.vue'
import ArrowDownLeft from '../../icons/ArrowDownLeft.vue'
import Stars from '../../icons/Stars.vue'
import FinancesBalance from '@/components/common/FinancesBalance/FinancesBalance.vue'

const props = defineProps<{
    reload: boolean
}>()

const financesStore = useFinancesStore()
const { loading, lastPage, itemsAll, itemsDeposit, itemsWithdrawal } = storeToRefs(financesStore)

const userStore = useUserStore()

const tab = ref(null)
const headers = ref([
    {
        title: "",
        sortable: false,
        sortParams: {},
        key: 'direction'
    },
    {
        title: "Дата и время",
        sortable: true,
        sortParams: {
            value: 'timestamp_desc',
            name: 'Дате и времени'
        },
        key: 'date',
    },
    {
        title: "Комментарий",
        sortable: true,
        sortParams: {
            value: 'comment',
            name: 'Комментариям'
        },
        key: 'comment'
    },
    {
        title: "Сумма",
        sortable: true,
        sortParams: {
            value: 'amount',
            name: 'Сумма'
        },
        key: 'amount'
    },
    // {
    //     title: "Статус",
    //     sortable: true,
    //     key: 'status'
    // }
])

function fetchData() {
    financesStore.fetchFinancesStory({ page: page.value, sort: sort.value, countPerPage: 10 }).then(() => {
        financesStore.hideLoading()
    })
}

const page = ref(1)

function changePage(newPage: string, isActive: boolean) {
    if (isActive) {
        return
    }

    page.value = Number(newPage.replace(",", ""))
    financesStore.fetchFinancesStory({ page: page.value, sort: sort.value, countPerPage: 10 }).then(() => {
            financesStore.hideLoading()
        })
}

function decPage() {
    if (page.value !== 1) {
        page.value--
        financesStore.fetchFinancesStory({ page: page.value, sort: sort.value, countPerPage: 10 }).then(() => {
            financesStore.hideLoading()
        })
    }
}

function incPage() {
    if (page.value !== lastPage.value) {
        page.value++
        financesStore.fetchFinancesStory({ page: page.value, sort: sort.value, countPerPage: 10 }).then(() => {
            financesStore.hideLoading()
        })
    }
}

function loadMore() {
    if (page.value < lastPage.value) {
        page.value++
        financesStore.loadMoreFinances({ page: page.value, sort: sort.value, countPerPage: 10 }).then(() => {
            financesStore.hideLoading()
        })
    }
}

const sort = reactive({
    value: 'timestamp_desc',
    name: 'Дате и времени'
})

const sortOptions = ref([
    {
        value: '',
        name: 'Не сортировать'
    },
    {
        value: 'timestamp_desc',
        name: 'Дате и времени'
    },
    {
        value: 'comment',
        name: 'Комментариям'
    },
    {
        value: 'amount',
        name: 'Сумма'
    }
])

function setSort(sortOption: Record<string, unknown>) {
    sort.value = sortOption.value
    sort.name = sortOption.name
    financesStore.fetchFinancesStory({ page: page.value, sort: sort.value, countPerPage: 10 }).then(() => {
        financesStore.hideLoading()
    })
}

function updateData() {
    userStore.fetchUserInfo()
    fetchData()
}

onMounted(() => {
    financesStore.fetchFinancesStory({ page: page.value, sort: sort.value, countPerPage: 10 }).then(() => {
        financesStore.hideLoading()
    })
})

watch(props, (newValue: Record<string, boolean>, _prevValue: Record<string, boolean>) => {
    if (newValue.reload) {
        updateData()
    }
})
</script>

<template>
  <FinancesBalance @reload="updateData()"/>
  <RenderOn :px="840">
    <v-card class="!tw-rounded-2xl tw-mb-6 dark:tw-bg-dark-panel">
        <v-tabs v-model="tab" align-tabs="center">
            <v-tab value="one" color="blue" width="33.3%" class="!tw-normal-case !tw-tracking-normal">Все</v-tab>
            <v-tab value="two" color="blue" width="33.3%" class="!tw-normal-case !tw-tracking-normal">Пополнения</v-tab>
            <v-tab value="three" color="blue" width="33.3%" class="!tw-normal-case !tw-tracking-normal">Списания</v-tab>
        </v-tabs>

        <v-card-text>
            <v-window v-model="tab">
                <v-window-item value="one">
                    <v-data-table :headers="headers" :items="itemsAll" :footer='false' :loading="loading" hide-no-data>
                        <template v-slot:item.direction="{ value }">
                            <ArrowUpRight v-if="value === 'deposit'" />
                            <ArrowDownLeft v-if="value === 'withdrawal'" />
                        </template>
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
                        <template v-slot:item.date="{ value }">
                            <span class="tw-text-[15px]">{{ value }}</span>
                        </template>
                        <template v-slot:item.comment="{ value }">
                            <span class="tw-text-[15px]">{{ value }}</span>
                        </template>
                        <template v-slot:item.amount="{ value }">
                            <span><span class="tw-text-[15px]">{{ formatter.format(value) }}</span> <span class="tw-text-[13px] tw-text-gray-dark">USDT</span></span>
                        </template>
                        <!-- <template v-slot:item.status="{ value }">
                            <div
                                v-if="value === 'process'"
                                class="tw-bg-gray-200 tw-rounded-xl tw-border-2 tw-border-solid tw-border-gray-400 tw-w-[94px] tw-px-2 tw-py-1 tw-text-center"
                            >
                                <span class="tw-text-gray-400 tw-text-xs">В процессе</span>
                            </div>
                            <div
                                v-if="value === 'error'"
                                class="tw-rounded-xl tw-border-2 tw-border-solid tw-border-yellow-500 tw-w-[94px] tw-px-2 tw-py-1 tw-text-center"
                            >
                                <span class="tw-text-yellow-400 tw-text-xs">Ошибка</span>
                            </div>
                            <div
                                v-if="value === 'done'"
                                class="tw-rounded-xl tw-border-2 tw-border-solid tw-border-green-500 tw-w-[94px] tw-px-2 tw-py-1 tw-text-center"
                            >
                                <span class="tw-text-green-400 tw-text-xs">Выполнено</span>
                            </div>
                        </template> -->
                        <template v-slot:loading>
                            <v-skeleton-loader type="table-row@4"></v-skeleton-loader>
                        </template>
                        <template v-slot:bottom></template>
                    </v-data-table>
                </v-window-item>

                <v-window-item value="two">
                    <v-data-table :headers="headers" :items="itemsDeposit" :loading="loading" hide-no-data>
                        <template v-slot:item.direction="{ value }">
                            <ArrowUpRight v-if="value === 'deposit'" />
                            <ArrowDownLeft v-if="value === 'withdrawal'" />
                        </template>
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
                        <template v-slot:item.date="{ value }">
                            <span class="tw-text-[15px]">{{ value }}</span>
                        </template>
                        <template v-slot:item.comment="{ value }">
                            <span class="tw-text-[15px]">{{ value }}</span>
                        </template>
                        <template v-slot:item.amount="{ value }">
                            <span><span class="tw-text-[15px]">{{ formatter.format(value) }}</span> <span class="tw-text-[13px] tw-text-gray-dark">USDT</span></span>
                        </template>
                        <!-- <template v-slot:item.status="{ value }">
                            <div
                                v-if="value === 'process'"
                                class="tw-bg-gray-200 tw-rounded-xl tw-border-2 tw-border-solid tw-border-gray-400 tw-w-[94px] tw-px-2 tw-py-1 tw-text-center"
                            >
                                <span class="tw-text-gray-400 tw-text-xs">В процессе</span>
                            </div>
                            <div
                                v-if="value === 'error'"
                                class="tw-rounded-xl tw-border-2 tw-border-solid tw-border-yellow-500 tw-w-[94px] tw-px-2 tw-py-1 tw-text-center"
                            >
                                <span class="tw-text-yellow-400 tw-text-xs">Ошибка</span>
                            </div>
                            <div
                                v-if="value === 'done'"
                                class="tw-rounded-xl tw-border-2 tw-border-solid tw-border-green-500 tw-w-[94px] tw-px-2 tw-py-1 tw-text-center"
                            >
                                <span class="tw-text-green-400 tw-text-xs">Выполнено</span>
                            </div>
                        </template> -->
                        <template v-slot:loading>
                            <v-skeleton-loader type="table-row@4"></v-skeleton-loader>
                        </template>
                        <template v-slot:bottom></template>
                    </v-data-table>
                </v-window-item>

                <v-window-item value="three">
                    <v-data-table :headers="headers" :items="itemsWithdrawal" :loading="loading" hide-no-data>
                        <template v-slot:item.direction="{ value }">
                            <ArrowUpRight v-if="value === 'deposit'" />
                            <ArrowDownLeft v-if="value === 'withdrawal'" />
                        </template>
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
                        <template v-slot:item.date="{ value }">
                            <span class="tw-text-[15px]">{{ value }}</span>
                        </template>
                        <template v-slot:item.comment="{ value }">
                            <span class="tw-text-[15px]">{{ value }}</span>
                        </template>
                        <template v-slot:item.amount="{ value }">
                            <span><span class="tw-text-[15px]">{{ formatter.format(value) }}</span> <span class="tw-text-[13px] tw-text-gray-dark">USDT</span></span>
                        </template>
                        <!-- <template v-slot:item.status="{ value }">
                            <div
                                v-if="value === 'process'"
                                class="tw-bg-gray-200 tw-rounded-xl tw-border-2 tw-border-solid tw-border-gray-400 tw-w-[94px] tw-px-2 tw-py-1 tw-text-center"
                            >
                                <span class="tw-text-gray-400 tw-text-xs">В процессе</span>
                            </div>
                            <div
                                v-if="value === 'error'"
                                class="tw-rounded-xl tw-border-2 tw-border-solid tw-border-yellow-500 tw-w-[94px] tw-px-2 tw-py-1 tw-text-center"
                            >
                                <span class="tw-text-yellow-400 tw-text-xs">Ошибка</span>
                            </div>
                            <div
                                v-if="value === 'done'"
                                class="tw-rounded-xl tw-border-2 tw-border-solid tw-border-green-500 tw-w-[94px] tw-px-2 tw-py-1 tw-text-center"
                            >
                                <span class="tw-text-green-400 tw-text-xs">Выполнено</span>
                            </div>
                        </template> -->
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

  <RenderOn :px-min="320" :px-max="839">
    <v-tabs v-if="itemsAll.length > 0" v-model="tab" align-tabs="center">
        <v-tab value="one" color="blue" width="33.3%" class="!tw-normal-case !tw-tracking-normal">Все</v-tab>
        <v-tab value="two" color="blue" width="33.3%" class="!tw-normal-case !tw-tracking-normal">Пополнения</v-tab>
        <v-tab value="three" color="blue" width="33.3%" class="!tw-normal-case !tw-tracking-normal">Списания</v-tab>
    </v-tabs>

    <v-window v-if="!loading" v-model="tab">
        <v-window-item value="one">
            <section class="tw-flex tw-justify-between tw-items-center tw-w-full tw-mb-2 tw-mt-2">
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
            </section>
            <section class="tw-flex tw-flex-col tw-gap-y-2 tw-overflow-y-scroll tw-p-2 tw-h-[420px]">
                <template v-for="item in itemsAll" :key="item">
                    <div class="tw-flex tw-flex-col tw-w-full tw-bg-white tw-p-4 tw-rounded-2xl dark:tw-bg-dark-panel">
                        <div class="tw-flex tw-justify-between tw-mb-2">
                            <div class="tw-flex tw-items-center tw-gap-x-2">
                                <ArrowUpRight v-if="item.direction === 'deposit'" :width="32" :height="32" />
                                <ArrowDownLeft v-if="item.direction === 'withdrawal'" :width="32" :height="32" />
                                <div class="tw-leading-4">
                                    <span class="tw-text-[10px] tw-text-[#AEB7C1]">{{ item.date }}</span><br>
                                    <span><span class="tw-text-[15px]">{{ formatter.format(item.amount) }}</span> <span class="tw-text-[13px] tw-text-gray-dark">USDT</span></span>
                                </div>
                            </div>
                            <!-- <div
                                v-if="item.status === 'process'"
                                class="tw-flex tw-flex-col tw-justify-center tw-items-center tw-bg-gray-200 tw-rounded-xl tw-border-2 tw-border-solid tw-border-gray-400 tw-w-[79px] tw-h-[20px] tw-px-2 tw-text-center"
                            >
                                <span class="tw-text-gray-400 tw-text-[10px]">В процессе</span>
                            </div>
                            <div
                                v-if="item.status === 'error'"
                                class="tw-flex tw-flex-col tw-justify-center tw-items-center tw-rounded-xl tw-border-2 tw-border-solid tw-border-yellow-500 tw-w-[79px] tw-h-[20px] tw-px-2 tw-text-center"
                            >
                                <span class="tw-text-yellow-400 tw-text-[10px]">Ошибка</span>
                            </div>
                            <div
                                v-if="item.status === 'done'"
                                class="tw-flex tw-flex-col tw-justify-center tw-items-center tw-rounded-xl tw-border-2 tw-border-solid tw-border-green-500 tw-w-[75px] tw-h-[20px] tw-px-2 tw-text-center"
                            >
                                <span class="tw-text-green-400 tw-text-[10px]">Выполнено</span>
                            </div> -->
                        </div>
                        <div class="tw-border-t-2 tw-border-l-0 tw-border-r-0 tw-border-b-0 tw-border-[#E0E4E8] tw-border-dashed">
                            <span class="tw-text-[13px] tw-min-w-[300px]">{{ item.comment }}</span>
                        </div>
                    </div>
                </template>
            </section>
        </v-window-item>
        <v-window-item value="two">
            <section class="tw-flex tw-justify-between tw-items-center tw-w-full tw-mb-2 tw-mt-2">
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
            </section>
            <section class="tw-flex tw-flex-col tw-gap-y-2 tw-overflow-y-scroll tw-p-2 tw-h-[420px]">
                <template v-for="item in itemsDeposit" :key="item">
                    <div class="tw-flex tw-flex-col tw-w-full tw-bg-white dark:tw-bg-dark-panel tw-p-4 tw-rounded-2xl">
                        <div class="tw-flex tw-justify-between tw-mb-2">
                            <div class="tw-flex tw-items-center tw-gap-x-2">
                                <ArrowUpRight v-if="item.direction === 'deposit'" :width="32" :height="32" />
                                <ArrowDownLeft v-if="item.direction === 'withdrawal'" :width="32" :height="32" />
                                <div class="tw-leading-4">
                                    <span class="tw-text-[10px] tw-text-[#AEB7C1]">{{ item.date }}</span><br>
                                    <span><span class="tw-text-[15px]">{{ formatter.format(item.amount) }}</span> <span class="tw-text-[13px] tw-text-gray-dark">USD</span></span>
                                </div>
                            </div>
                            <!-- <div
                                v-if="item.status === 'process'"
                                class="tw-flex tw-flex-col tw-justify-center tw-items-center tw-bg-gray-200 tw-rounded-xl tw-border-2 tw-border-solid tw-border-gray-400 tw-w-[79px] tw-h-[20px] tw-px-2 tw-text-center"
                            >
                                <span class="tw-text-gray-400 tw-text-[10px]">В процессе</span>
                            </div>
                            <div
                                v-if="item.status === 'error'"
                                class="tw-flex tw-flex-col tw-justify-center tw-items-center tw-rounded-xl tw-border-2 tw-border-solid tw-border-yellow-500 tw-w-[79px] tw-h-[20px] tw-px-2 tw-text-center"
                            >
                                <span class="tw-text-yellow-400 tw-text-[10px]">Ошибка</span>
                            </div>
                            <div
                                v-if="item.status === 'done'"
                                class="tw-flex tw-flex-col tw-justify-center tw-items-center tw-rounded-xl tw-border-2 tw-border-solid tw-border-green-500 tw-w-[75px] tw-h-[20px] tw-px-2 tw-text-center"
                            >
                                <span class="tw-text-green-400 tw-text-[10px]">Выполнено</span>
                            </div> -->
                        </div>
                        <div class="tw-border-t-2 tw-border-l-0 tw-border-r-0 tw-border-b-0 tw-border-[#E0E4E8] tw-border-dashed">
                            <span class="tw-text-[13px] tw-min-w-[300px]">{{ item.comment }}</span>
                        </div>
                    </div>
                </template>
            </section>
        </v-window-item>
        <v-window-item value="three">
            <section class="tw-flex tw-justify-between tw-items-center tw-w-full tw-mb-2 tw-mt-2">
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
            </section>
            <section class="tw-flex tw-flex-col tw-gap-y-2 tw-overflow-y-scroll tw-p-2 tw-h-[420px]">
                <template v-for="item in itemsWithdrawal" :key="item">
                    <div class="tw-flex tw-flex-col tw-w-full tw-bg-white dark:tw-bg-dark-panel tw-p-4 tw-rounded-2xl">
                        <div class="tw-flex tw-justify-between tw-mb-2">
                            <div class="tw-flex tw-items-center tw-gap-x-2">
                                <ArrowUpRight v-if="item.direction === 'deposit'" :width="32" :height="32" />
                                <ArrowDownLeft v-if="item.direction === 'withdrawal'" :width="32" :height="32" />
                                <div class="tw-leading-4">
                                    <span class="tw-text-[10px] tw-text-[#AEB7C1]">{{ item.date }}</span><br>
                                    <span><span class="tw-text-[15px]">{{ formatter.format(item.amount) }}</span> <span class="tw-text-[13px] tw-text-gray-dark">USD</span></span>
                                </div>
                            </div>
                            <!-- <div
                                v-if="item.status === 'process'"
                                class="tw-flex tw-flex-col tw-justify-center tw-items-center tw-bg-gray-200 tw-rounded-xl tw-border-2 tw-border-solid tw-border-gray-400 tw-w-[79px] tw-h-[20px] tw-px-2 tw-text-center"
                            >
                                <span class="tw-text-gray-400 tw-text-[10px]">В процессе</span>
                            </div>
                            <div
                                v-if="item.status === 'error'"
                                class="tw-flex tw-flex-col tw-justify-center tw-items-center tw-rounded-xl tw-border-2 tw-border-solid tw-border-yellow-500 tw-w-[79px] tw-h-[20px] tw-px-2 tw-text-center"
                            >
                                <span class="tw-text-yellow-400 tw-text-[10px]">Ошибка</span>
                            </div>
                            <div
                                v-if="item.status === 'done'"
                                class="tw-flex tw-flex-col tw-justify-center tw-items-center tw-rounded-xl tw-border-2 tw-border-solid tw-border-green-500 tw-w-[75px] tw-h-[20px] tw-px-2 tw-text-center"
                            >
                                <span class="tw-text-green-400 tw-text-[10px]">Выполнено</span>
                            </div> -->
                        </div>
                        <div class="tw-border-t-2 tw-border-l-0 tw-border-r-0 tw-border-b-0 tw-border-[#E0E4E8] tw-border-dashed">
                            <span class="tw-text-[13px] tw-min-w-[300px]">{{ item.comment }}</span>
                        </div>
                    </div>
                </template>
            </section>
        </v-window-item>
    </v-window>
    <div v-if="loading" class="tw-flex tw-justify-center tw-items-center tw-w-full tw-h-[326px]">
        <v-progress-circular
            indeterminate
            color="#04B6F5"
        ></v-progress-circular>
    </div>
    <v-btn v-if="itemsAll.length > 0" class="!tw-rounded-xl !tw-h-[50px] tw-mt-5" variant="outlined" color="#04B6F5" @click="loadMore">
        <span class="tw-tracking-normal tw-normal-case">Показать ещё</span>
    </v-btn>
  </RenderOn>
  
  <section v-if="!loading && itemsAll.length === 0" class="tw-flex tw-flex-col tw-justify-center tw-items-center tw-w-full tw-h-[calc(100vh-400px)]">
    <div class="tw-text-center">
        <Stars /><br>
        <span class="tw-text-lg tw-text-[#677483] tw-font-semibold">Операции отсутствуют</span>
    </div>
  </section>

  <RenderOn :px="840">
    <v-pagination
        v-if="itemsAll.length > 0"
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
