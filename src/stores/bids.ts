import { defineStore } from 'pinia'
import { getBids, getUserBids, cancelUserBid, takeBid, confirmTakenBid } from '@/api'
import type { TFilterPaginationOptions } from '@/types'
import { getDifferentTimeStatus, timestampToDatetime } from '@/utils'

export const useBidsStore = defineStore('bids', {
  state: () => ({
    bidsAllList: [] as any,
    bidsUserList: [] as any,
    loading: true,
    hasItems: true,
    page: 1,
    lastPage: 1,
    offset: 1,
    totalCount: 1
  }),
  getters: {
    bidsItemsAll: (state) => {
      return state.bidsAllList.map((item: Record<string, unknown>) => {
        return {
            id: item.uid,
            method: {
              methodValue: item.method,
              methodBank: item.bank
            },
            paymentSum: item.amount,
            sumUSDT: item.amountUSD
        }
      })
    },
    bidsItemsUser: (state) => {
      return state.bidsUserList.map((item: Record<string, unknown>) => {
        return {
            id: item.uid,
            method: {
              methodValue: item.method,
              methodBank: item.bank
            },
            requisites: item.requisites,
            paymentSum: item.amount,
            sumUSDT: item.amountUSD,
            date: {
                value: item.takenTimestamp ? timestampToDatetime(item.takenTimestamp as number) : '',
                different: getDifferentTimeStatus(item.takenTimestamp as string)
            },
            status: {
              id: item.uid,
              value: item.status,
              timeout: item.bidTimeoutAfter
            }
        }
      })
    }
  },
  actions: {
    async fetchBids(options: TFilterPaginationOptions) {
      this.showLoading()
      
      const res = await getBids(options)
      
      this.bidsAllList = res?.data.list
      this.page = res?.data.page
      this.offset = res?.data.offset
      this.totalCount = res?.data.totalCount
      this.lastPage = res?.data.lastPage
      if (this.bidsUserList.length === 0 && this.bidsAllList.length === 0) {
        this.hasItems = false
      } else {
        this.hasItems = true
      }

      console.log(this.bidsAllList)
    },
    async loadMoreBids(options: TFilterPaginationOptions) {
      this.showLoading()

      const res = await getBids(options)
      const newListItems = res?.data.list
      
      this.bidsAllList.push(...newListItems)
      this.page = res?.data.page
      this.offset = res?.data.offset
      this.totalCount = res?.data.totalCount
      this.lastPage = res?.data.lastPage

      if (this.bidsUserList.length === 0 && this.bidsAllList.length === 0) {
        this.hasItems = false
      } else {
        this.hasItems = true
      }
    },
    async fetchUserBids(options: TFilterPaginationOptions) {
        this.showLoading()
        
        const res = await getUserBids(options)
        
        this.bidsUserList = res?.data.list
        this.page = res?.data.page
        this.offset = res?.data.offset
        this.totalCount = res?.data.totalCount
        this.lastPage = res?.data.lastPage
        if (this.bidsUserList.length === 0 && this.bidsAllList.length === 0) {
          this.hasItems = false
        } else {
          this.hasItems = true
        }
  
        console.log(this.bidsUserList)
    },
    async loadMoreUserBids(options: TFilterPaginationOptions) {
        this.showLoading()
  
        const res = await getBids(options)
        const newListItems = res?.data.list
        
        this.bidsUserList.push(...newListItems)
        this.page = res?.data.page
        this.offset = res?.data.offset
        this.totalCount = res?.data.totalCount
        this.lastPage = res?.data.lastPage
  
        if (this.bidsUserList.length === 0 && this.bidsAllList.length === 0) {
          this.hasItems = false
        } else {
          this.hasItems = true
        }
    },
    async takeBidAction(id: string) {
      const res = await takeBid(id)

      this.bidsAllList = this.bidsAllList.filter((bid) => bid.uid !== id)
      
      return res
    },
    async confirmUserBid(id: string, bid: Record<string, unknown>) {
      const res = await confirmTakenBid(id, bid)

      const idx = this.bidsUserList.findIndex((bid) => bid.uid === id)
      this.bidsUserList[idx] = res?.data.bid

      return res
    }, 
    async cancelUserBidByID(id: string) {
      const res = await cancelUserBid(id)
      this.bidsUserList = this.bidsUserList.filter((bid) => bid.uid !== id)
    },
    showLoading() {
      this.loading = true
    },
    hideLoading() {
      this.loading = false
    }
  }
})
