import { defineStore } from 'pinia'
import { getPayments, getDisputes, approveDisput, cancelDisput, getAwaitingDisputesCount, getCurrentDispute } from '@/api'
import type { TFilterPaginationOptions } from '@/types'
import { formatter, getDifferentTimeStatus, timestampToDatetime, timestampToDatetimeOffset } from '@/utils'

export const usePaymentsStore = defineStore('payments', {
  state: () => ({
    paymentsList: [] as any,
    disputsList: [] as any,
    loading: true,
    hasItems: true,
    awaitingItems: 0 as number,
    page: 1,
    lastPage: 1,
    offset: 1,
    totalCount: 1
  }),
  getters: {
    paymentsItemsAll: (state) => {
      return state.paymentsList.map((item: Record<string, unknown>) => {
        return {
            id: item.paymentId,
            date: {
              value: timestampToDatetime(item.timestamp),
              different: getDifferentTimeStatus(item.timestamp as string)
            },
            sum: {
                value: formatter.format(item.amount),
                currency: item.currency
            },
            debit: {
                value: formatter.format(item.withdrawalAmount),
                currency: item.currency
            },
            card: {
                type: item.cardType,
                num: item.card.slice(1)
            },
            status: item.status
        }
      })
    },
    disputsItemsAll: (state) => {
      return state.disputsList.map((item: Record<string, unknown>) => {
        return {
            id: item.paymentId,
            disputeStart: {
              value: item.disputeStartTimestamp ? timestampToDatetime(item.disputeStartTimestamp) : '',
              different: getDifferentTimeStatus(item.timestamp as string)
            },
            date: {
              value: item.disputePaidTime ? `${timestampToDatetimeOffset(item.disputePaidTime, 'Europe/Moscow')} MSK` : '',
              different: getDifferentTimeStatus(item.timestamp as string)
            },
            sum: {
                value: formatter.format(item.amount),
                currency: item.currency
            },
            debit: {
                value: formatter.format(item.disputePaidAmount),
                currency: item.currency
            },
            card: {
                type: item.cardType,
                num: item.card.slice(1)
            },
            status: {
              id: item.paymentId,
              value: item.disputeStatus,
              timeout: item.disputeTimeoutAfter
            },
            receipt: item.receiptURL
        }
      })
    }
  },
  actions: {
    async fetchPayments(options: TFilterPaginationOptions) {
      this.showLoading()
      
      const res = await getPayments(options)
      
      this.paymentsList = res?.data.list
      this.page = res?.data.page
      this.offset = res?.data.offset
      this.totalCount = res?.data.totalCount
      this.lastPage = res?.data.lastPage
      if (this.paymentsList.length === 0) {
        this.hasItems = false
      } else {
        this.hasItems = true
      }

      console.log(this.paymentsList)
    },
    async loadMorePayments(options: TFilterPaginationOptions) {
      this.showLoading()

      const res = await getPayments(options)
      const newListItems = res?.data.list
      
      this.paymentsList.push(...newListItems)
      this.page = res?.data.page
      this.offset = res?.data.offset
      this.totalCount = res?.data.totalCount
      this.lastPage = res?.data.lastPage

      if (this.paymentsList.length === 0) {
        this.hasItems = false
      } else {
        this.hasItems = true
      }
    },
    async fetchDisputeById(id: string) {
      const res = await getCurrentDispute(id)
      return res?.data.payment
    },
    async fetchDisputs(options: TFilterPaginationOptions) {
      this.showLoading()

      const res = await getDisputes(options)
      
      this.disputsList = res?.data.list
      this.page = res?.data.page
      this.offset = res?.data.offset
      this.totalCount = res?.data.totalCount
      this.lastPage = res?.data.lastPage

      if (this.disputsList.length === 0) {
        this.hasItems = false
      } else {
        this.hasItems = true
      }
      console.log(this.disputsList)
    },
    async loadMoreDisputs(options: TFilterPaginationOptions) {
      this.showLoading()

      const res = await getDisputes(options)
      const newListItems = res?.data.list
      
      this.disputsList.push(...newListItems)
      this.page = res?.data.page
      this.offset = res?.data.offset
      this.totalCount = res?.data.totalCount
      this.lastPage = res?.data.lastPage

      if (this.disputsList.length === 0) {
        this.hasItems = false
      } else {
        this.hasItems = true
      }
    },
    async approveDisputByID(id: string) {
      const res = await approveDisput(id)
      
      const idx = this.disputsList.findIndex((disput) => disput.paymentId === id)
      console.log(res)
      this.disputsList[idx] = res?.data.payment
    },
    async cancelDisputByID(id: string) {
      const res = await cancelDisput(id)

      const idx = this.disputsList.findIndex((disput) => disput.paymentId === id)
      this.disputsList[idx] = res?.data.payment
    },
    async fetchAwaitingDisputesCount() {
      const res = await getAwaitingDisputesCount()
      this.awaitingItems = res?.data.count
    },
    showLoading() {
      this.loading = true
    },
    hideLoading() {
      this.loading = false
    }
  }
})
