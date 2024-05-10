<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { formatter } from '@/utils'
import { debounce } from 'vue-debounce'
import { useCardsStore } from '@/stores/cards'
import { useDevicesStore } from '@/stores/devices'
import { storeToRefs } from 'pinia'
import { MaskInput, vMaska, type MaskType } from 'maska'
import RenderOn from '@/components/utils/RenderOn.vue'
import Stars from '@/components/icons/Stars.vue'
import Filter from '@/components/icons/Filter.vue'
import IsOnline from '@/components/info/IsOnline.vue'
import DeleteDialog from '@/components/common/DeleteDialog/DeleteDialog.vue'
import ReloadBtn from '@/components/common/ReloadBtn/ReloadBtn.vue'
import PhoneBattery from '@/components/info/PhoneBattery.vue'

const props = defineProps<{
    reload: boolean
}>()

const cardErrorSnackbar = reactive({
    show: false,
    text: 'Некорректный номер карты',
    timeout: 2000,
})

const cardsStore = useCardsStore()
const deviceStore = useDevicesStore()
const { bankItems, loading, itemsAll, lastPage } = storeToRefs(cardsStore)
const { filteredDeviceList } = storeToRefs(deviceStore)

const newCardForm = ref<HTMLFormElement>(null)
const newCardMobileForm = ref<HTMLFormElement>(null)
const editCardForm = ref<HTMLFormElement>(null)

const panMaskOptions = {
    mask: '#### #### #### ####'
}

const limitMaskOptions = {
  mask: (value: string) => {
    switch (value.replace(/\s/g, '').length) {
        case 4:
            return '# ###' as MaskType
        case 5:
            return '## ###' as MaskType
        case 6:
            return '### ###' as MaskType
        case 7:
            return '# ### ###' as MaskType
        case 8:
            return '## ### ###' as MaskType
        default:
            return '## ### ###' as MaskType
    }
  }
}

const searchModel = ref('')
const searchQuery = ref('')

const sort = reactive({
    value: '',
    name: 'Не сортировать'
})

const sortOptions = ref([
    {
        value: '',
        sortParams: {},
        name: 'Не сортировать'
    },
    {
        value: 'pan',
        name: 'Картам'
    },
    {
        value: 'bank',
        name: 'Банкам'
    },
    {
        value: 'deviceName',
        name: 'Устройствам'
    },
    {
        value: 'comment',
        name: 'Комментариям'
    },
    {
        value: 'status',
        name: 'Статусу'
    }
])

const dialog = ref(false)
const dialogConfirm = ref(false)
const editDialog = ref(false)
const dialogDelete = ref(false)

const mobileFilter = ref(false)

// function switchToConfirm() {
//     dialog.value = false
//     dialogConfirm.value = true
// }

function openDialog() {
    dialog.value = true
}

function closeDialog() {
    dialog.value = false
}

function closeEditDialog() {
    editDialog.value = false
}

// function closeConfirmDialog() {
//     dialogConfirm.value = false
// }

async function openEditDialog(cardUid: string) {
    editCard.isEditable = false
    editDialog.value = true

    const card = await cardsStore.fetchCardByUID(cardUid)

    editCard.uid = cardUid
    editCard.cardNum = card.pan
    editCard.limit = card.maxDailyOrderSumUSD
    editCard.comment = card.comment

    if (card) editCard.isEditable = true
}

const headers = ref([
    {
        title: 'Номер',
        sortable: true,
        sortParams: {
            value: 'pan',
            name: 'Картам'
        },
        key: 'card'
    },
    {
        title: 'Банк',
        sortable: true,
        sortParams: {
            value: 'bank',
            name: 'Банкам'
        },
        key: 'bank'
    },
    {
        title: 'Устройство',
        sortable: true,
        sortParams: {
            value: 'deviceName',
            name: 'Устройствам'
        },
        key: 'device'
    },
    {
        title: 'Комментарий',
        sortable: true,
        sortParams: {
            value: 'comment',
            name: 'Комментариям'
        },
        key: 'comment'
    },
    {
        title: 'Статус',
        sortable: true,
        sortParams: {
            value: 'status',
            name: 'Статусу'
        },
        key: 'status'
    },
    {
        title: 'Включена',
        sortable: false,
        sortParams: {},
        key: 'switch'
    },
    {
        title: '',
        sortable: false,
        sortParams: {},
        key: 'actions'
    }
])

const banks = reactive({
    select: undefined,
    items: []
})

const statuses = reactive({
    select: undefined,
    items: [
        {
            value: 'active',
            name: 'Активна'
        },
        {
            value: 'stopped',
            name: 'Отключена'
        }
    ]
})

const newCard = reactive<{
    bank: {
        select: Record<string, unknown> | undefined | null,
        items: Array<Record<string, string>> | null
    },
    device: {
        select: Record<string, unknown> | undefined | null,
        items: Array<Record<string, string>> | null
    },
    cardNum : string,
    limit: string,
    comment: string
}>({
    bank: {
        select: undefined,
        items: []
    },
    device: {
        select: undefined,
        items: []
    },
    cardNum: '',
    limit: '',
    comment: ''
})

const editCard = reactive({
    isEditable: false,
    uid: '',
    cardNum: '',
    limit: '',
    comment: ''
})

const deleteCard = reactive<{id: string | number, title: string}>({
    id: '',
    title: ''
})

const page = ref(1)

function fetchData() {
    cardsStore.fetchCards({
        search: searchQuery.value,
        page: page.value,
        countPerPage: 10,
        sort: sort.value,
        filter: {
            bank: banks.select,
            status: statuses.select
        }
    }).then(() => {
        cardsStore.hideLoading()
    })
}

function setSort(sortOption: Record<string, unknown>) {
    sort.value = sortOption.value
    sort.name = sortOption.name
    fetchData()
}

function searchValue(queryText: string) {
    searchQuery.value = queryText
    fetchData()
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
        cardsStore.loadMoreCards({
            search: searchQuery.value,
            page: page.value,
            countPerPage: 10,
            sort: sort.value,
            filter: {
                bank: banks.select,
                status: statuses.select
            }
        })
    }
}

function reset() {
    searchModel.value = ''
    searchQuery.value = ''
    banks.select = undefined
    statuses.select = undefined
    fetchData()
}

// function confirmAction() {
//     cardsStore.createCard(newCard).then(() => {
//         cardsStore.hideLoading()
//         dialogConfirm.value = false
//     })
// }

async function submitNewCard() {
    const { valid } = await newCardForm.value.validate()

    if (valid) {
        cardsStore.createCard(newCard).then(() => {
            cardsStore.hideLoading()
            dialogConfirm.value = false
        })
    }
}

async function submitNewCardMobile() {
    const { valid } = await newCardMobileForm.value.validate()

    if (valid) {
        cardsStore.createCard(newCard).then(() => {
            cardsStore.hideLoading()
            dialogConfirm.value = false
            dialog.value = false
        })
    }
}

async function submitEditCard() {
    const { valid } = await editCardForm.value.validate()

    if (valid) {
        cardsStore.saveEditCard(editCard).then((res) => {
            if (res && res.response && res.response.data && res?.response.data.code === 'incorrect_pan') {
                cardErrorSnackbar.show = true
                cardsStore.hideLoading()
                return
            }
            cardsStore.hideLoading()
            closeEditDialog()
        })
    }
}

function onDeleteCard(id: number | string, title: string) {
    deleteCard.id = id
    deleteCard.title = title
    dialogDelete.value = true
}

function deleteCardAction(id: number | string) {
    cardsStore.removeCard(id as string)
}

const newCardValidationRules = reactive({
    required: (value: string) => !!value || 'Поле обязвательно для заполнения',
    isCardOccupied: async (value: string) => {
        const num = value.replace(/\s/g, '')
        if (num.length === 16) {
            const isOccupied = await cardsStore.checkCard(value)
            
            if (isOccupied) {
                return 'Такая карта уже добавлена'
            }
        }
    }
})

const editCardValidationRules = reactive({
    required: (value: string) => !!value || 'Поле обязвательно для заполнения',
    isCardOccupied: async (value: string) => {
        const num = value.replace(/\s/g, '')
        if (num.length === 16) {
            const isOccupied = await cardsStore.checkCardNotCurrent(value, editCard.uid)

            console.log(isOccupied)
            
            if (isOccupied) {
                return 'Такая карта уже добавлена'
            }
        }
    }
})

function applyMobileFilter() {
    mobileFilter.value = !mobileFilter.value
}

/** Reset filter on close mobile filter window **/
function closeMobileFilter() {
    searchModel.value = ''
    searchQuery.value = ''
    banks.select = undefined
    statuses.select = undefined

    mobileFilter.value = !mobileFilter.value
}

onMounted(() => {
    cardsStore.fetchBanks()
    deviceStore.fetchFilteredDevices().then(() => {
        newCard.device.items = filteredDeviceList.value.map((device) => {
            return {
                value: device.deviceId,
                name: device.name
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
                            label="Поиск"
                            append-inner-icon="mdi mdi-magnify"
                            single-line
                            @update:model-value="debounce((val: any) => searchValue(val as string), 1000)(searchModel)"
                        ></v-text-field>
                    </v-responsive>
                    <v-responsive class="mx-auto" min-width="92" max-width="462">
                        <v-select
                            v-model="banks.select"
                            :items="bankItems"
                            label="Все банки"
                            variant="outlined"
                            item-title="name"
                            item-value="value"
                            @update:model-value="fetchData"
                        ></v-select>
                    </v-responsive>
                    <v-responsive class="mx-auto" min-width="92" max-width="462">
                        <v-select
                            v-model="statuses.select"
                            :items="statuses.items"
                            label="Все статусы"
                            variant="outlined"
                            item-title="name"
                            item-value="value"
                            @update:model-value="fetchData"
                        ></v-select>
                    </v-responsive>
                    <v-responsive class="mx-auto -tw-mt-5" min-width="92" max-width="262">
                        <div class="tw-flex tw-items-center tw-gap-x-2">
                            <v-btn
                                class="!tw-rounded-2xl !tw-normal-case"
                                variant="outlined"
                                color="#04B6F5"
                                size="x-large"
                                @click="reset"
                                >
                                    <span class="tw-text-[#04B6F5] tw-text-[15px] tw-tracking-normal">Сбросить фильтр</span>
                                </v-btn
                            >
                            <ReloadBtn @click="fetchData" />
                        </div>
                    </v-responsive>
                </section>
                <v-btn
                    class="!-tw-mt-5 !tw-rounded-xl !tw-w-[205px] !tw-h-[52px] hover:!tw-shadow-[0px_10px_18px_2px_rgba(4,182,245,0.2)]"
                    color="#04B6F5"
                    variant="elevated"
                    @click="dialog = !dialog"
                >
                    <template v-slot:prepend>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.125 10H16.875" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M10 3.125V16.875" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </template>
                    <span class="tw-text-white tw-text-[16px] tw-normal-case tw-tracking-normal tw-leading-4">Добавить карту</span>
                </v-btn>
            </section>
        </v-card>
    </RenderOn>

    <RenderOn :px="840">
        <v-card class="!tw-rounded-2xl tw-mb-6">
            <v-data-table :headers="headers" :items="itemsAll" :footer="false" :loading="loading" hide-no-data>
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
                <template v-slot:item.card="{ value }">
                    <div class="tw-flex tw-items-center tw-gap-x-4">
                        <img :src="`/payment/${value.type}.svg`" />
                        <span class="tw-text-[15px]">**** **** **** {{ value.num }}</span>
                    </div>
                </template>
                <template v-slot:item.bank="{ value }">
                    <div class="tw-flex tw-items-center tw-gap-x-4">
                        <img :src="`/payment/${value.slug}.svg`" />
                        <span class="tw-text-[15px]">{{ value.name }}</span>
                    </div>
                </template>
                <template v-slot:item.device="{ value }">
                    <div class="tw-flex tw-flex-col">
                        <div class="tw-flex tw-items-center tw-gap-x-2">
                            <IsOnline :online="value.isOnline" />
                            <span class="tw-text-[15px]">{{ value.name }}</span>
                            <PhoneBattery :percent-value="value.batteryLevel" />
                        </div>
                        <span class="tw-text-[12px] tw-text-[#677483]">{{ value.comment }}</span>
                    </div>
                </template>
                <template v-slot:item.comment="{ value }">
                    <span class="tw-text-[15px]">{{ value }}</span>
                </template>
                <template v-slot:item.amount="{ value }">
                    <span
                        ><span class="tw-text-[15px]">{{ formatter.format(value) }}</span>
                        <span class="tw-text-[13px] tw-text-gray-dark">USD</span></span
                    >
                </template>
                <template v-slot:item.status="{ value }">
                    <div
                        v-if="value === 'connect'"
                        class="tw-bg-gray-200 tw-rounded-xl tw-border-2 tw-border-solid tw-border-gray tw-w-[104px] tw-px-2 tw-py-1 tw-text-center"
                    >
                        <span class="tw-text-gray tw-text-xs">Подключение</span>
                    </div>
                    <div
                        v-if="value === 'stopped'"
                        class="tw-rounded-xl tw-border-2 tw-border-solid tw-border-orange tw-w-[104px] tw-px-2 tw-py-1 tw-text-center"
                    >
                        <span class="tw-text-orange tw-text-xs">Отключена</span>
                    </div>
                    <div
                        v-if="value === 'active'"
                        class="tw-rounded-xl tw-border-2 tw-border-solid tw-border-green tw-w-[104px] tw-px-2 tw-py-1 tw-text-center"
                    >
                        <span class="tw-text-green tw-text-xs">Активна</span>
                    </div>
                </template>
                <template v-slot:item.switch="{ value }">
                    <v-switch :model-value="value.isSwitched" color="#04B6F5" @click="cardsStore.toggleCard(value.cardUid, value.isSwitched)"></v-switch>
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-menu>
                        <template v-slot:activator="{ props }">
                            <v-btn
                                class="!tw-border-none !tw-bg-none !tw-shadow-none dark:tw-bg-dark-panel"
                                icon="mdi-dots-vertical"
                                v-bind="props"
                            ></v-btn>
                        </template>

                        <v-list>
                            <v-list-item class="tw-cursor-pointer hover:tw-bg-gray-200" @click="openEditDialog(item.id)">
                                <v-list-item-title><span class="tw-select-none">Редактировать</span></v-list-item-title>
                            </v-list-item>
                            <v-list-item class="tw-cursor-pointer hover:tw-bg-gray-200" @click="onDeleteCard(item.id, `**** **** **** ${item.card.num}`)">
                                <v-list-item-title><span class="tw-select-none">Удалить</span></v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </template>
                <template v-slot:loading>
                    <v-skeleton-loader type="table-row@7"></v-skeleton-loader>
                </template>
                <template v-slot:bottom></template>
            </v-data-table>
        </v-card>
    </RenderOn>

    <RenderOn :px-min="320" :px-max="839">
        <section class="tw-flex tw-justify-between tw-items-center tw-w-full tw-mb-5">
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
        <section v-if="itemsAll.length > 0" class="tw-flex tw-flex-col tw-gap-y-2 tw-overflow-y-scroll tw-h-[520px]">
                <template v-for="item in itemsAll" :key="item">
                    <div class="tw-flex tw-flex-col tw-w-full tw-bg-white dark:tw-bg-dark-panel tw-px-3 tw-py-1 tw-rounded-2xl">
                        <div class="tw-flex tw-justify-between tw-items-center tw-w-full">
                            <!-- <span><span class="tw-text-[15px]">{{ formatter.format(item.amount) }}</span> <span class="tw-text-[13px] tw-text-gray-400">USD</span></span> -->
                            <div
                                v-if="item.status === 'connect'"
                                class="tw-flex tw-flex-col tw-justify-start tw-bg-gray tw-rounded-xl tw-border-2 tw-border-solid tw-border-gray-400 tw-w-[104px] tw-px-2 tw-py-1 tw-text-center"
                            >
                                <span class="tw-text-gray tw-text-xs">Подключение</span>
                            </div>
                            <div
                                v-if="item.status === 'stopped'"
                                class="tw-flex tw-flex-col tw-justify-start tw-rounded-xl tw-border-2 tw-border-solid tw-border-orange tw-w-[104px] tw-px-2 tw-py-1 tw-text-center"
                            >
                                <span class="tw-text-orange tw-text-xs">Отключена</span>
                            </div>
                            <div
                                v-if="item.status === 'active'"
                                class="tw-flex tw-flex-col tw-justify-start tw-rounded-xl tw-border-2 tw-border-solid tw-border-green tw-w-[104px] tw-px-2 tw-py-1 tw-text-center"
                            >
                                <span class="tw-text-green tw-text-xs">Активна</span>
                            </div>
                            <div class="tw-flex">
                                <v-switch class="!tw-flex-none" :style="'grid-template-areas: none;'" :model-value="item.switch.isSwitched" color="#04B6F5" @click="cardsStore.toggleCard(item.switch.cardUid, item.switch.isSwitched)"></v-switch>
                                <v-menu>
                                    <template v-slot:activator="{ props }">
                                        <v-btn
                                            class="!tw-border-none !tw-bg-none !tw-shadow-none dark:tw-bg-dark-panel"
                                            icon="mdi-dots-vertical"
                                            v-bind="props"
                                        ></v-btn>
                                    </template>

                                    <v-list>
                                        <v-list-item class="tw-cursor-pointer hover:tw-bg-gray-200" @click="openEditDialog(item.id)">
                                            <v-list-item-title><span class="tw-select-none">Редактировать</span></v-list-item-title>
                                        </v-list-item>
                                        <v-list-item class="tw-cursor-pointer hover:tw-bg-gray-200" @click="onDeleteCard(item.id, `**** **** **** ${item.card.num}`)">
                                            <v-list-item-title><span class="tw-select-none">Удалить</span></v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                            </div>
                        </div>
                        <div class="tw-flex tw-justify-between tw-items-center tw-w-full tw-mb-4">
                            <div class="tw-flex tw-items-center tw-gap-x-1">
                                <img :src="`/payment/${item.bank.slug}.svg`" />
                                <span class="tw-text-[15px]">{{ item.bank.name }}</span>
                            </div>
                            <div class="tw-flex tw-items-center tw-gap-x-1">
                                <img :src="`/payment/${item.card.type}.svg`" />
                                <span class="tw-text-[13px]">**** {{ item.card.num }}</span>
                            </div>
                        </div>
                        <div class="tw-flex tw-items-center tw-gap-x-2 tw-border-t-2 tw-border-l-0 tw-border-r-0 tw-border-b-0 tw-border-[#E0E4E8] tw-border-dashed">
                            <IsOnline :online="item.device.isOnline" />
                            <span class="tw-text-[15px]">{{ item.device.name }}</span>
                            <PhoneBattery :percent-value="item.device.batteryLevel" />
                        </div>
                        <div>
                            <span class="tw-text-[13px] tw-min-w-[300px]">{{ item.comment }}</span>
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
            <v-btn v-if="itemsAll.length > 0" class="!tw-rounded-xl !tw-h-[50px] tw-mt-5" variant="outlined" color="#04B6F5" @click="loadMore">
                <span class="tw-tracking-normal tw-normal-case">Показать ещё</span>
            </v-btn>
            <v-btn class="!tw-rounded-xl !tw-h-[50px] tw-mt-5" :class="itemsAll.length === 0 ? '!tw-absolute !tw-bottom-0 !tw-w-[80%]' : ''" variant="elevated" color="#04B6F5" @click="openDialog">
                <template v-slot:prepend>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.125 10H16.875" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M10 3.125V16.875" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </template>
                <span class="tw-tracking-normal tw-normal-case tw-text-white">Добавить карту</span>
            </v-btn>
    </RenderOn>
    
    <section v-if="!loading && itemsAll.length === 0" class="tw-flex tw-flex-col tw-justify-center tw-items-center tw-w-full tw-h-[calc(100vh-400px)]">
        <div class="tw-text-center">
            <Stars /><br>
            <span class="tw-text-lg tw-text-[#677483] tw-font-semibold">Карты отсутствуют</span>
        </div>
    </section>

    <DeleteDialog
        :open="dialogDelete"
        title="Вы действительно хотите удалить карту?"
        :entity="deleteCard"
        @delete="(e) => deleteCardAction(e.entityId)"
        @close="dialogDelete = !dialogDelete"
    />

    <RenderOn :px="840">
        <v-dialog v-model="dialog" width="auto">
            <v-card class="tw-flex tw-flex-col tw-items-center tw-h-fit !tw-rounded-2xl lg:!tw-p-[48px] xl:!tw-p-[48px] md:!tw-p-[26px]">
                <span class="tw-text-2xl tw-mb-[14px]">Добавление новой карты</span>
                <v-form ref="newCardForm">
                    <div class="tw-flex tw-flex-col tw-items-start tw-w-full">
                        <span class="tw-text-[13px] tw-text-[#677483] tw-mb-2">Банк</span>
                        <v-select
                            v-model="newCard.bank.select"
                            :items="bankItems"
                            item-title="name"
                            item-value="value"
                            class="tw-w-full"
                            label="Выберите"
                            variant="outlined"
                            :rules="[newCardValidationRules.required]"
                        ></v-select>
                    </div>
                    <div class="tw-flex tw-flex-col tw-items-start tw-w-full">
                        <span class="tw-text-[13px] tw-text-[#677483] tw-mb-2">Устройство</span>
                        <v-select
                            v-model="newCard.device.select"
                            :items="newCard.device.items"
                            item-title="name"
                            item-value="value"
                            class="tw-w-full"
                            label="Выберите"
                            variant="outlined"
                            :rules="[newCardValidationRules.required]"
                        ></v-select>
                    </div>
                    <div class="tw-flex tw-flex-col tw-items-start tw-w-full">
                        <span class="tw-text-[13px] tw-text-[#677483] tw-mb-2">Номер карты</span>
                        <v-text-field
                            v-model="newCard.cardNum"
                            class="tw-w-full"
                            label="0000 0000 0000 0000"
                            variant="outlined"
                            v-maska:[panMaskOptions]
                            :rules="[newCardValidationRules.required, newCardValidationRules.isCardOccupied]"
                        ></v-text-field>
                    </div>
                    <div class="tw-flex tw-flex-col tw-items-start tw-w-full">
                        <span class="tw-text-[13px] tw-text-[#677483] tw-mb-2">Лимит операций в USDT</span>
                        <v-text-field
                            v-model="newCard.limit"
                            class="tw-w-full"
                            label="10 000"
                            variant="outlined"
                            v-maska:[limitMaskOptions]
                        ></v-text-field>
                    </div>
                    <div class="tw-flex tw-flex-col tw-items-start tw-w-full">
                        <span class="tw-text-[13px] tw-text-[#677483] tw-mb-2">Комментарий</span>
                        <v-textarea
                            v-model="newCard.comment"
                            class="tw-w-full"
                            label="Комментарий к карте"
                            variant="outlined"
                            :rules="[newCardValidationRules.required]"
                        ></v-textarea>
                    </div>
                    <v-card-actions>
                        <section class="tw-flex tw-flex-col tw-gap-y-4">
                            <v-btn
                                class="tw-w-[426px] !tw-h-[50px] !tw-rounded-xl !tw-normal-case"
                                color="#04B6F5"
                                variant="elevated"
                                block
                                @click="submitNewCard"
                            >
                                <v-progress-circular
                                    v-if="loading"
                                    class="tw-mr-3"
                                    indeterminate
                                    color="white"
                                ></v-progress-circular>
                                <span class="tw-text-white tw-text-[15px] !tw-normal-case">Добавить</span>
                            </v-btn>
                            <v-btn
                                class="tw-w-[426px] !tw-h-[50px] !tw-rounded-xl !tw-normal-case !tw-m-auto"
                                color="#04B6F5"
                                variant="outlined"
                                @click="closeDialog"
                            >
                                Отмена
                            </v-btn>
                        </section>
                    </v-card-actions>
                </v-form>
            </v-card>
        </v-dialog>
        <!-- <v-dialog
            v-model="dialogConfirm"
            width="auto"
        >
        <v-card class="tw-flex tw-flex-col tw-items-center !tw-rounded-2xl !tw-p-[48px]">
            <div class="tw-mb-[24px]">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M32 6C26.8577 6 21.8309 7.52487 17.5552 10.3818C13.2795 13.2387 9.94702 17.2994 7.97914 22.0502C6.01127 26.8011 5.49638 32.0288 6.49959 37.0723C7.50281 42.1159 9.97907 46.7486 13.6152 50.3848C17.2514 54.0209 21.8842 56.4972 26.9277 57.5004C31.9712 58.5036 37.1989 57.9887 41.9498 56.0209C46.7007 54.053 50.7613 50.7205 53.6182 46.4448C56.4751 42.1691 58 37.1423 58 32C57.9868 25.1084 55.2433 18.5029 50.3702 13.6298C45.4971 8.75674 38.8916 6.01321 32 6ZM30 20C30 19.4696 30.2107 18.9609 30.5858 18.5858C30.9609 18.2107 31.4696 18 32 18C32.5304 18 33.0392 18.2107 33.4142 18.5858C33.7893 18.9609 34 19.4696 34 20V34C34 34.5304 33.7893 35.0391 33.4142 35.4142C33.0392 35.7893 32.5304 36 32 36C31.4696 36 30.9609 35.7893 30.5858 35.4142C30.2107 35.0391 30 34.5304 30 34V20ZM32 46C31.4067 46 30.8266 45.8241 30.3333 45.4944C29.84 45.1648 29.4554 44.6962 29.2284 44.148C29.0013 43.5999 28.9419 42.9967 29.0577 42.4147C29.1734 41.8328 29.4591 41.2982 29.8787 40.8787C30.2982 40.4591 30.8328 40.1734 31.4147 40.0576C31.9967 39.9419 32.5999 40.0013 33.1481 40.2284C33.6962 40.4554 34.1648 40.8399 34.4944 41.3333C34.8241 41.8266 35 42.4067 35 43C35 43.7957 34.6839 44.5587 34.1213 45.1213C33.5587 45.6839 32.7957 46 32 46Z" fill="#EFC327"/>
                </svg>
            </div>
            <span class="tw-text-2xl tw-mb-[24px] tw-text-center">Подтверждение<br>действия</span>
            <div class="tw-mb-[24px] tw-w-[320px] tw-text-center">
            <span class="tw-text-[15px] tw-break-words tw-overflow-ellipsis">
                Lorem ipsum dolor sit amet consectetur. Volutpat sit dui congue massa aliquam sed cursus. Odio sed eget ultrices urna phasellus nibh. Tortor amet sed velit amet. Fames ut lacus non lectus blandit mi faucibus amet nulla. Lectus urna sollicitudin est proin. Sodales mauris.
            </span>
            </div>
            <v-card-actions>
                    <section class="tw-flex tw-flex-col tw-gap-y-4">
                        <v-btn class="tw-w-[320px] !tw-h-[50px] !tw-rounded-xl !tw-normal-case" color="#04B6F5" variant="elevated" block @click="confirmAction">
                            <span class="tw-text-white tw-text-[15px] !tw-normal-case">Подтвердить</span>
                        </v-btn>
                        <v-btn class="tw-w-[320px] !tw-h-[50px] !tw-rounded-xl !tw-normal-case !tw-m-auto" color="#04B6F5" variant="outlined" @click="closeConfirmDialog">
                            Отмена
                        </v-btn>
                    </section>
                </v-card-actions>
        </v-card>
        </v-dialog> -->
    </RenderOn>

    <!-- EDIT -->
    <v-dialog v-model="editDialog" width="auto">
            <v-card class="tw-flex tw-flex-col tw-items-center tw-h-fit !tw-rounded-2xl sm:!tw-p-[28px] md:!tw-p-[48px] min-lg:!tw-p-[48px]">
                <span class="sm:tw-text-xl md:tw-text-2xl min-lg:tw-text-2xl tw-mb-[14px]">Редактирование карты</span>
                <v-form ref="editCardForm">
                    <div class="tw-flex tw-flex-col sm:tw-items-center tw-w-full">
                        <span class="tw-text-[13px] tw-text-[#677483] tw-mb-2">Номер карты</span>
                        <v-text-field
                            v-if="editCard.isEditable"
                            v-model="editCard.cardNum"
                            class="tw-w-full sm:tw-w-[300px]"
                            label="0000 0000 0000 0000"
                            variant="outlined"
                            v-maska:[panMaskOptions]
                            :rules="[editCardValidationRules.required, editCardValidationRules.isCardOccupied]"
                        ></v-text-field>
                        <v-skeleton-loader v-else type="text" width="320"></v-skeleton-loader>
                    </div>
                    <div class="tw-flex tw-flex-col tw-items-start tw-w-full">
                        <span class="tw-text-[13px] tw-text-[#677483] tw-mb-2">Лимит операций в USDT</span>
                        <v-text-field
                            v-if="editCard.isEditable"
                            v-model="editCard.limit"
                            class="tw-w-full"
                            label="10 000"
                            variant="outlined"
                            v-maska:[limitMaskOptions]
                        ></v-text-field>
                        <v-skeleton-loader v-else type="text" width="320"></v-skeleton-loader>
                    </div>
                    <div class="tw-flex tw-flex-col sm:tw-items-center tw-w-full">
                        <span class="tw-text-[13px] tw-text-[#677483] tw-mb-2">Комментарий</span>
                        <v-textarea
                            v-if="editCard.isEditable"
                            v-model="editCard.comment"
                            class="tw-w-full sm:tw-w-[300px]"
                            label="Комментарий к карте"
                            variant="outlined"
                            :rules="[editCardValidationRules.required]"
                        ></v-textarea>
                        <v-skeleton-loader v-else type="image" width="320"></v-skeleton-loader>
                    </div>
                    <v-card-actions>
                        <section class="tw-flex tw-flex-col tw-gap-y-4">
                            <v-btn
                                class="sm:!tw-w-[300px] md:tw-w-[426px] min-lg:tw-w-[426px] !tw-h-[50px] !tw-rounded-xl !tw-normal-case"
                                color="#04B6F5"
                                variant="elevated"
                                block
                                @click="submitEditCard"
                            >
                                <v-progress-circular
                                    v-if="loading"
                                    class="tw-mr-3"
                                    indeterminate
                                    color="white"
                                ></v-progress-circular>
                                <span class="tw-text-white tw-text-[15px] !tw-normal-case">Сохранить</span>
                            </v-btn>
                            <v-btn
                                class="sm:!tw-w-[300px] md:tw-w-[426px] min-lg:tw-w-[426px] !tw-h-[50px] !tw-rounded-xl !tw-normal-case !tw-m-auto"
                                color="#04B6F5"
                                variant="outlined"
                                @click="closeEditDialog"
                            >
                                Отмена
                            </v-btn>
                        </section>
                    </v-card-actions>
                </v-form>
            </v-card>
        </v-dialog>

    <!-- MOBILE DIALOGS -->
    <RenderOn :px-min="320" :px-max="839">
        <v-card v-if="dialog" class="!tw-fixed !tw-top-0 !tw-left-0 !tw-z-[2000] !tw-h-screen !tw-w-screen !tw-flex !tw-flex-col !tw-justify-center !tw-items-center !tw-rounded-2xl lg:!tw-p-[48px] xl:!tw-p-[48px] md:!tw-p-[26px] sm:!tw-p-[20px]">
                <span class="tw-text-2xl tw-mb-[14px]">Добавление новой карты</span>
                <v-form ref="newCardMobileForm">
                    <div class="tw-flex tw-flex-col tw-items-start tw-w-full">
                        <span class="tw-text-[13px] tw-text-[#677483] tw-mb-2">Банк</span>
                        <v-select
                            v-model="newCard.bank.select"
                            :items="bankItems"
                            item-title="name"
                            item-value="value"
                            class="tw-w-full"
                            label="Выберите"
                            variant="outlined"
                            :rules="[newCardValidationRules.required]"
                        ></v-select>
                    </div>
                    <div class="tw-flex tw-flex-col tw-items-start tw-w-full">
                        <span class="tw-text-[13px] tw-text-[#677483] tw-mb-2">Устройство</span>
                        <v-select
                            v-model="newCard.device.select"
                            :items="newCard.device.items"
                            item-title="name"
                            item-value="value"
                            class="tw-w-full"
                            label="Выберите"
                            variant="outlined"
                            :rules="[newCardValidationRules.required]"
                        ></v-select>
                    </div>
                    <div class="tw-flex tw-flex-col tw-items-start tw-w-full">
                        <span class="tw-text-[13px] tw-text-[#677483] tw-mb-2">Лимит операций в USDT</span>
                        <v-text-field
                            v-model="newCard.limit"
                            class="tw-w-full"
                            label="10 000"
                            variant="outlined"
                            v-maska:[limitMaskOptions]
                        ></v-text-field>
                    </div>
                    <div class="tw-flex tw-flex-col tw-items-start tw-w-full">
                        <span class="tw-text-[13px] tw-text-[#677483] tw-mb-2">Номер карты</span>
                        <v-text-field
                            v-model="newCard.cardNum"
                            class="tw-w-full"
                            label="0000 0000 0000 0000"
                            variant="outlined"
                            v-maska:[panMaskOptions]
                            :rules="[newCardValidationRules.required, newCardValidationRules.isCardOccupied]"
                        ></v-text-field>
                    </div>
                    <div class="tw-flex tw-flex-col tw-items-start tw-w-full">
                        <span class="tw-text-[13px] tw-text-[#677483] tw-mb-2">Комментарий</span>
                        <v-textarea
                            v-model="newCard.comment"
                            class="tw-w-full"
                            label="Комментарий к карте"
                            variant="outlined"
                            :rules="[newCardValidationRules.required]"
                        ></v-textarea>
                    </div>
                    <v-card-actions>
                        <section class="tw-flex tw-flex-col tw-gap-y-4">
                            <v-btn class="tw-w-[326px] !tw-h-[50px] !tw-rounded-xl !tw-normal-case" color="#04B6F5" variant="elevated" block @click="submitNewCardMobile">
                                <v-progress-circular
                                    v-if="loading"
                                    class="tw-mr-3"
                                    indeterminate
                                    color="white"
                                ></v-progress-circular>
                                <span class="tw-text-white tw-text-[15px] !tw-normal-case">Добавить</span>
                            </v-btn>
                            <v-btn class="tw-w-[326px] !tw-h-[50px] !tw-rounded-xl !tw-normal-case !tw-m-auto" color="#04B6F5" variant="outlined" @click="closeDialog">
                                Отмена
                            </v-btn>
                        </section>
                    </v-card-actions>
                </v-form>
            </v-card>

            <!-- <v-card v-if="dialogConfirm" class="!tw-fixed !tw-top-0 !tw-left-0 !tw-z-[2000] !tw-h-screen !tw-w-screen !tw-flex !tw-flex-col !tw-justify-center !tw-items-center !tw-rounded-2xl !tw-p-[48px]">
                <div class="tw-mb-[24px]">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M32 6C26.8577 6 21.8309 7.52487 17.5552 10.3818C13.2795 13.2387 9.94702 17.2994 7.97914 22.0502C6.01127 26.8011 5.49638 32.0288 6.49959 37.0723C7.50281 42.1159 9.97907 46.7486 13.6152 50.3848C17.2514 54.0209 21.8842 56.4972 26.9277 57.5004C31.9712 58.5036 37.1989 57.9887 41.9498 56.0209C46.7007 54.053 50.7613 50.7205 53.6182 46.4448C56.4751 42.1691 58 37.1423 58 32C57.9868 25.1084 55.2433 18.5029 50.3702 13.6298C45.4971 8.75674 38.8916 6.01321 32 6ZM30 20C30 19.4696 30.2107 18.9609 30.5858 18.5858C30.9609 18.2107 31.4696 18 32 18C32.5304 18 33.0392 18.2107 33.4142 18.5858C33.7893 18.9609 34 19.4696 34 20V34C34 34.5304 33.7893 35.0391 33.4142 35.4142C33.0392 35.7893 32.5304 36 32 36C31.4696 36 30.9609 35.7893 30.5858 35.4142C30.2107 35.0391 30 34.5304 30 34V20ZM32 46C31.4067 46 30.8266 45.8241 30.3333 45.4944C29.84 45.1648 29.4554 44.6962 29.2284 44.148C29.0013 43.5999 28.9419 42.9967 29.0577 42.4147C29.1734 41.8328 29.4591 41.2982 29.8787 40.8787C30.2982 40.4591 30.8328 40.1734 31.4147 40.0576C31.9967 39.9419 32.5999 40.0013 33.1481 40.2284C33.6962 40.4554 34.1648 40.8399 34.4944 41.3333C34.8241 41.8266 35 42.4067 35 43C35 43.7957 34.6839 44.5587 34.1213 45.1213C33.5587 45.6839 32.7957 46 32 46Z" fill="#EFC327"/>
                    </svg>
                </div>
                <span class="tw-text-2xl tw-mb-[24px] tw-text-center">Подтверждение<br>действия</span>
                <div class="tw-mb-[24px] tw-w-[320px] tw-text-center">
                <span class="tw-text-[15px] tw-break-words tw-overflow-ellipsis">
                    Lorem ipsum dolor sit amet consectetur. Volutpat sit dui congue massa aliquam sed cursus. Odio sed eget ultrices urna phasellus nibh. Tortor amet sed velit amet. Fames ut lacus non lectus blandit mi faucibus amet nulla. Lectus urna sollicitudin est proin. Sodales mauris.
                </span>
                </div>
                <v-card-actions>
                        <section class="tw-flex tw-flex-col tw-gap-y-4">
                            <v-btn class="tw-w-[320px] !tw-h-[50px] !tw-rounded-xl !tw-normal-case" color="#04B6F5" variant="elevated" block @click="confirmAction">
                                <span class="tw-text-white tw-text-[15px] !tw-normal-case">Подтвердить</span>
                            </v-btn>
                            <v-btn class="tw-w-[320px] !tw-h-[50px] !tw-rounded-xl !tw-normal-case !tw-m-auto" color="#04B6F5" variant="outlined" @click="closeConfirmDialog">
                                Отмена
                            </v-btn>
                        </section>
                    </v-card-actions>
        </v-card> -->

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
                            label="Поиск"
                            append-inner-icon="mdi mdi-magnify"
                            single-line
                            @update:model-value="debounce((val: any) => searchValue(val as string), 1000)(searchModel)"
                        ></v-text-field>
                    </div>
                    <div class="tw-flex tw-flex-col tw-items-start tw-w-full">
                        <v-select
                            v-model="banks.select"
                            :items="bankItems"
                            label="Все банки"
                            class="tw-w-full"
                            variant="outlined"
                            item-title="name"
                            item-value="value"
                            @update:model-value="cardsStore.fetchCards({ search: searchQuery, page, countPerPage: 10, filter: { bank: banks.select, status: statuses.select } })"
                        ></v-select>
                    </div>
                    <div class="tw-flex tw-flex-col tw-items-start tw-w-full">
                        <v-select
                            v-model="statuses.select"
                            :items="statuses.items"
                            class="tw-w-full"
                            label="Все статусы"
                            variant="outlined"
                            item-title="name"
                            item-value="value"
                            @update:model-value="cardsStore.fetchCards({ search: searchQuery, page, countPerPage: 10, filter: { bank: banks.select, status: statuses.select } })"
                        ></v-select>
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

    <v-snackbar
        v-model="cardErrorSnackbar.show"
        :timeout="cardErrorSnackbar.timeout"
        color="red"
    >
        {{ cardErrorSnackbar.text }}

        <template v-slot:actions>
            <v-btn
                color="white"
                variant="text"
                @click="cardErrorSnackbar.show = false"
            >
                Скрыть
            </v-btn>
        </template>
    </v-snackbar>

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
