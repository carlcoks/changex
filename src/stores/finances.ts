import { defineStore } from 'pinia'
import { getFinancesStory } from '@/api'
import type { TFilterPaginationOptions } from '@/types'
import { timestampToDatetime } from '@/utils'

export const useFinancesStore = defineStore('finances', {
  state: () => ({
    financesList: [] as any,
    statuses: ['process', 'done', 'error'], // TEMPORARY
    loading: true,
    hasItems: true,
    page: 1,
    lastPage: 1,
    offset: 1,
    totalCount: 1
  }),
  getters: {
    itemsAll: (state) => state.financesList,
    itemsDeposit: (state) => state.financesList.filter((item) => item.direction === 'deposit'),
    itemsWithdrawal: (state) => state.financesList.filter((item) => item.direction === 'withdrawal')
  },
  actions: {
    async fetchFinancesStory(options: TFilterPaginationOptions) {
      this.showLoading()

      const res = await getFinancesStory(options)

      this.financesList = res?.data.list.map((item) => {
        return {
          direction: item.direction,
          date: timestampToDatetime(item.timestamp),
          comment: item.comment,
          amount: item.amount,
          status: this.statuses[Math.floor(Math.random() * 2) + 0]
        }
      })
      this.page = res?.data.page
      this.offset = res?.data.offset
      this.totalCount = res?.data.totalCount
      this.lastPage = res?.data.lastPage

      if (this.financesList.length === 0) {
        this.hasItems = false
      } else {
        this.hasItems = true
      }
    },
    async loadMoreFinances(options: TFilterPaginationOptions) {
      this.showLoading()
      
      const res = await getFinancesStory(options)

      const newListItems = res?.data.list.map((item) => {
        return {
          direction: item.direction,
          date: timestampToDatetime(item.timestamp),
          comment: item.comment,
          amount: item.amount,
          status: this.statuses[Math.floor(Math.random() * 2) + 0]
        }
      })

      this.financesList.push(...newListItems)
      this.page = res?.data.page
      this.offset = res?.data.offset
      this.totalCount = res?.data.totalCount
      this.lastPage = res?.data.lastPage

      if (this.financesList.length === 0) {
        this.hasItems = false
      } else {
        this.hasItems = true
      }

    },
    showLoading() {
      this.loading = true
    },
    hideLoading() {
      this.loading = false
    }
  }
})
