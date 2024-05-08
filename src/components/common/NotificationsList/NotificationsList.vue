<script setup lang="ts">
import { reactive, ref, onMounted, watch } from 'vue'
import { debounce } from 'vue-debounce'
import { useAccountStore } from '@/stores/accounts'
import { storeToRefs } from 'pinia'
import { copyToClipboard } from '@/utils'
import CopyIcon from '@/components/icons/CopyIcon.vue'
import RenderOn from '@/components/utils/RenderOn.vue'
import ReloadBtn from '@/components/common/ReloadBtn/ReloadBtn.vue'
import DeleteDialog from '@/components/common/DeleteDialog/DeleteDialog.vue'

const props = defineProps<{
    reload: boolean
}>()

const dialog = ref(false)
const editDialog = ref(false)
const dialogDelete = ref(false)

const copySnackbar = reactive({
    show: false,
    text: 'Скопировано в буфер обмена.',
    timeout: 2000,
})

const searchModel = ref('')
const searchQuery = ref('')

const accountsStore = useAccountStore()
const { loading, itemsAll, code, lastPage } = storeToRefs(accountsStore)

function openDialog() {
    accountsStore.getConnectCode()
    dialog.value = true
}

const editAccount = reactive({
    isEditable: false,
    uid: '',
    username: '',
    comment: ''
})

const deleteAccount = reactive<{id: string | number, title: string}>({
    id: '',
    title: ''
})

async function openEditDialog(accountUID: string) {
    editAccount.isEditable = false
    editDialog.value = true

    const account = await accountsStore.fetchAccountByUID(accountUID)

    editAccount.uid = account.uid
    editAccount.username = account.username
    editAccount.comment = account.comment

    if (account) editAccount.isEditable = true
}

function submitEditAccount() {
    accountsStore.saveEditAccount(editAccount).then(() => {
        accountsStore.hideLoading()
        editDialog.value = false
    })
}

function onDeleteAccount(id: number | string, title: string) {
    deleteAccount.id = id
    deleteAccount.title = title
    dialogDelete.value = true
}

function deleteAccountAction(id: number | string) {
    accountsStore.removeAccount(id as string)
}

function copyCode(code: string) {
    copyToClipboard(code)
    copySnackbar.show = true
}

const headers = ref([
    {
        title: 'ID',
        sortable: true,
        sortParams: {
            value: 'tgId',
            name: 'ID'
        },
        key: 'id'
    },
    {
        title: 'Аккаунт',
        sortable: true,
        sortParams: {
            value: 'username',
            name: 'Имени пользователя'
        },
        key: 'account'
    },
    {
        title: 'Подключён',
        sortable: true,
        sortParams: {
            value: 'timestamp_desc',
            name: 'Времени'
        },
        key: 'date'
    },
    {
        title: 'Комментарий',
        sortable: true,
        sortParams: {
            value: 'comment',
            name: 'Комментарию'
        },
        key: 'comment'
    },
    {
        title: '',
        sortable: false,
        key: 'actions'
    }
])

const sort = reactive({
    value: '',
    name: 'Не сортировать'
})

const sortOptions = ref([
    {
        value: '',
        name: 'Не сортировать'
    },
    {
        alue: 'tgId',
        name: 'ID'
    },
    {
        value: 'username',
        name: 'Имени пользователя'
    },
    {
        value: 'timestamp_desc',
        name: 'Времени'
    },
    {
        value: 'comment',
        name: 'По комментарию'
    }
])

function setSort(sortOption: Record<string, unknown>) {
    sort.value = sortOption.value
    sort.name = sortOption.name
    fetchData()
}

const page = ref(1)

function fetchData() {
    accountsStore.fetchAccounts({ search: searchQuery.value, sort: sort.value, page: page.value, countPerPage: 10 }).then(() => {
        accountsStore.hideLoading()
    })
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
        accountsStore.loadMoreAccounts({ search: searchQuery.value, sort: sort.value, page: page.value, countPerPage: 10 }).then(() => {
            accountsStore.hideLoading()
        })
    }
}

onMounted(() => {
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
                    <v-responsive class="mx-auto" min-width="92" max-width="1600">
                        <v-text-field
                            v-model="searchModel"
                            variant="outlined"
                            label="Поиск по ID/Названию"
                            append-inner-icon="mdi mdi-magnify"
                            single-line
                            @update:model-value="debounce((val: any) => searchValue(val as string), 1000)(searchModel)"
                        ></v-text-field>
                    </v-responsive>
                    <v-btn
                        class="!-tw-mt-5 !tw-rounded-xl !tw-w-[245px] !tw-h-[52px] hover:!tw-shadow-[0px_10px_18px_2px_rgba(4,182,245,0.2)]"
                        color="#04B6F5"
                        variant="elevated"
                        @click="openDialog"
                    >
                            <template v-slot:prepend>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3.125 10H16.875" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M10 3.125V16.875" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </template>
                            <span class="tw-text-white tw-text-[16px] tw-normal-case tw-tracking-normal tw-leading-4">Подключить</span>
                        </v-btn>
                        <div class="!-tw-mt-5 ">
                            <ReloadBtn @click="fetchData" />
                        </div>
                </section>
            </section>
        </v-card>
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
                <template v-slot:item.id="{ value }">
                    <span class="tw-text-[15px] tw-text-gray-500">{{ value }}</span>
                </template>
                <template v-slot:item.account="{ value }">
                    <span class="tw-text-[15px]">{{ value }}</span>
                </template>
                <template v-slot:item.date="{ value }">
                    <span class="tw-text-[15px]">{{ value }}</span>
                </template>
                <template v-slot:item.comment="{ value }">
                    <span class="tw-text-[15px]">{{ value }}</span>
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
                                <v-list-item-title>Редактировать</v-list-item-title>
                            </v-list-item>
                            <v-list-item class="tw-cursor-pointer hover:tw-bg-gray-200" @click="onDeleteAccount(item.id, `@${item.account}`)">
                                <v-list-item-title>Удалить</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </template>
                <template v-slot:loading>
                    <v-skeleton-loader type="table-row@5"></v-skeleton-loader>
                </template>
                <template v-slot:bottom></template>
            </v-data-table>
        </v-card>
    </RenderOn>

    <RenderOn :px-min="320" :px-max="839">
        <section v-if="itemsAll.length > 0" class="tw-flex tw-flex-col tw-gap-y-2 tw-overflow-y-scroll tw-p-2 tw-h-[420px]">
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
                <template v-for="item in itemsAll" :key="item">
                    <div class="tw-flex tw-flex-col tw-w-full tw-bg-white dark:tw-bg-dark-panel tw-p-4 tw-rounded-2xl">
                        <div class="tw-flex tw-justify-between tw-mb-2">
                            <div class="tw-flex tw-flex-col tw-gap-x-2">
                                <div class="tw-leading-4">
                                    <span class="tw-text-[10px] tw-text-[#AEB7C1]">{{ item.id }},</span>
                                    <span class="tw-text-[10px] tw-text-[#AEB7C1] tw-ml-1">{{ item.date }}</span>
                                </div>
                                <span class="tw-text-[15px]">{{ item.account }}</span>
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
                                        <v-list-item class="tw-cursor-pointer hover:tw-bg-gray-200" @click="openEditDialog(item.id)">
                                            <v-list-item-title><span class="tw-select-none">Редактировать</span></v-list-item-title>
                                        </v-list-item>
                                        <v-list-item class="tw-cursor-pointer hover:tw-bg-gray-200" @click="accountsStore.removeAccount(item.id)">
                                            <v-list-item-title><span class="tw-select-none">Удалить</span></v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                        </div>
                        <div class="tw-border-t-2 tw-border-l-0 tw-border-r-0 tw-border-b-0 tw-border-[#E0E4E8] tw-border-dashed">
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
            <v-btn class="!tw-rounded-xl !tw-h-[50px] tw-mt-5" variant="elevated" color="#04B6F5" @click="openDialog">
                <template v-slot:prepend>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.125 10H16.875" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M10 3.125V16.875" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </template>
                <span class="tw-tracking-normal tw-normal-case tw-text-white">Подключить</span>
            </v-btn>
    </RenderOn>

    <section v-if="!loading && itemsAll.length === 0" class="tw-flex tw-flex-col tw-justify-center tw-items-center tw-w-full tw-h-[calc(100vh-400px)]">
        <div class="tw-text-center">
            <Stars /><br>
            <span class="tw-text-lg tw-text-[#677483] tw-font-semibold">Нет подключенных аккаунтов</span>
        </div>
    </section>

    <DeleteDialog
        :open="dialogDelete"
        title="Вы действительно хотите удалить аккаунт?"
        :entity="deleteAccount"
        @delete="(e) => deleteAccountAction(e.entityId)"
        @close="dialogDelete = !dialogDelete"
    />

    <v-dialog
      v-model="dialog"
      width="auto"
    >
      <v-card class="tw-flex tw-flex-col tw-items-center !tw-rounded-2xl sm:!tw-p-[28px] md:!tw-p-[48px] min-lg:!tw-p-[48px]">
        <span class="tw-text-2xl tw-mb-[24px] tw-text-center">Новое подключение</span>
        <div class="tw-flex tw-flex-col tw-items-center tw-mb-5">
            <span class="tw-text-[15px] tw-text-[#677483]">Ваш код</span>
            <div class="tw-flex tw-items-center">
                <span v-if="code !== ''" class="sm:tw-text-[10px] md:tw-text-lg min-lg:tw-text-lg tw-font-semibold">{{ code }}</span>
                <v-skeleton-loader v-else type="text" width="450"></v-skeleton-loader>
                <span class="tw-ml-2 tw-cursor-pointer tw-p-2" @click="copyCode(code)"><CopyIcon /></span>
                <v-snackbar
                    v-model="copySnackbar.show"
                    :timeout="copySnackbar.timeout"
                >
                    {{ copySnackbar.text }}

                    <template v-slot:actions>
                        <v-btn
                            color="blue"
                            variant="text"
                            @click="copySnackbar.show = false"
                        >
                            Скрыть
                        </v-btn>
                    </template>
                </v-snackbar>
            </div>
        </div>
        <div class="tw-text-center">
            <span class="tw-text-[15px]">Отправьте данный код в бота </span><span class="tw-text-[15px] tw-text-[#04B6F5]">@bot_changeex_bot</span>
        </div>
        <v-btn class="!tw-rounded-xl !tw-h-[50px] tw-w-full tw-mt-5" variant="outlined" color="#04B6F5" @click="dialog = !dialog">
            <span class="tw-tracking-normal tw-normal-case">Отмена</span>
        </v-btn>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editDialog" width="auto">
            <v-card class="tw-flex tw-flex-col tw-items-center !tw-rounded-2xl sm:!tw-p-[28px] md:!tw-p-[48px] min-lg:!tw-p-[48px]">
                <span class="tw-text-2xl tw-mb-[14px]">Редактировать аккаунт</span>
                    <div class="tw-flex tw-flex-col tw-items-start tw-w-full">
                        <span class="tw-text-[13px] tw-text-[#677483] tw-mb-2">Имя аккаунта</span>
                        <v-text-field
                            v-if="editAccount.isEditable"
                            v-model="editAccount.username"
                            class="tw-w-full"
                            label="Имя аккаунта"
                            variant="outlined"
                        ></v-text-field>
                        <v-skeleton-loader v-else type="text" width="100%"></v-skeleton-loader>
                    </div>
                    <div class="tw-flex tw-flex-col tw-items-start tw-w-full">
                        <span class="tw-text-[13px] tw-text-[#677483] tw-mb-2">Комментарий</span>
                        <v-textarea
                            v-if="editAccount.isEditable"
                            v-model="editAccount.comment"
                            class="tw-w-full"
                            label="Комментарий к подключению"
                            variant="outlined"
                        ></v-textarea>
                        <v-skeleton-loader v-else type="image" width="100%"></v-skeleton-loader>
                    </div>
                <v-card-actions>
                    <section class="tw-flex tw-flex-col tw-gap-y-4">
                        <v-btn class="sm:!tw-w-[280px] md:tw-w-[426px] min-lg:tw-w-[426px] !tw-h-[50px] !tw-rounded-xl !tw-normal-case" color="#04B6F5" variant="elevated" block @click="submitEditAccount">
                            <v-progress-circular
                                v-if="loading"
                                class="tw-mr-3"
                                indeterminate
                                color="white"
                            ></v-progress-circular>
                            <span class="tw-text-white tw-text-[15px] !tw-normal-case">Сохранить</span>
                        </v-btn>
                        <v-btn class="sm:!tw-w-[280px] md:tw-w-[426px] min-lg:tw-w-[426px] !tw-h-[50px] !tw-rounded-xl !tw-normal-case !tw-m-auto" color="#04B6F5" variant="outlined" @click="editDialog = !editDialog">
                            Отмена
                        </v-btn>
                    </section>
                </v-card-actions>
            </v-card>
    </v-dialog>

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
