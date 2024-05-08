import { defineStore } from 'pinia'
import { getAccounts, getAccountCode, getAccountUID, editAccount, deleteAccount } from '@/api'
import type { TFilterPaginationOptions } from '@/types'
import { timestampToDatetime } from '@/utils'

export const useAccountStore = defineStore('accounts', {
  state: () => ({
    accountsList: [] as any,
    code: '',
    loading: true,
    hasItems: true,
    page: 1,
    lastPage: 1,
    offset: 1,
    totalCount: 1
  }),
  getters: {
    itemsAll: (state) => {
      return state.accountsList.map((item: Record<string, unknown>) => {
        return {
            id: item.uid,
            account: item.username,
            date: timestampToDatetime(item.timestamp),
            comment: item.comment
        }
      })
    }
  },
  actions: {
    async fetchAccountByUID(uid: string) {
      const res = await getAccountUID(uid)
      return res?.data.account
    },
    async fetchAccounts(options: TFilterPaginationOptions) {
      this.showLoading()

      const res = await getAccounts(options)
      
      this.accountsList = res?.data.list
      this.page = res?.data.page
      this.offset = res?.data.offset
      this.totalCount = res?.data.totalCount
      this.lastPage = res?.data.lastPage

      if (this.accountsList.length === 0) {
        this.hasItems = false
      } else {
        this.hasItems = true
      }

      console.log(this.accountsList)
    },
    async loadMoreAccounts(options: TFilterPaginationOptions) {
      this.showLoading()
      
      const res = await getAccounts(options)
      const newListItems = res?.data.list
      
      this.accountsList.push(...newListItems)
      this.page = res?.data.page
      this.offset = res?.data.offset
      this.totalCount = res?.data.totalCount
      this.lastPage = res?.data.lastPage

      if (this.accountsList.length === 0) {
        this.hasItems = false
      } else {
        this.hasItems = true
      }
    },
    async getConnectCode() {
      const res = await getAccountCode()
      this.code = res?.data.code
    },
    async saveEditAccount(edited: Record<string, unknown>) {
      this.showLoading()
      
      const uid = edited.uid as string

      const idx = this.accountsList.findIndex((account) => account.uid === uid)

      const editedOptions = {
        username: edited.username,
        comment: edited.comment
      }

      await editAccount(uid, editedOptions)

      const newAccount = await this.fetchAccountByUID(uid)

      this.accountsList[idx] = newAccount
    },
    async removeAccount(uid: string) {
      this.accountsList = this.accountsList.filter((account) => account.uid !== uid)
      await deleteAccount(uid)
    },
    showLoading() {
      this.loading = true
    },
    hideLoading() {
      this.loading = false
    }
  }
})
