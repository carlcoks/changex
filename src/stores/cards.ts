import { defineStore } from 'pinia'
import { getCards, getCardByUID, addCard, setShutdownCard, editCard, setTurnOnCard, getBanks, deleteCard } from '@/api'
import type { TFilterPaginationOptions } from '@/types'

export const useCardsStore = defineStore('cards', {
  state: () => ({
    banks: [
        {
            slug: 'sber',
            name: 'Сбербанк'
        },
        {
            slug: 'raiff',
            name: 'Райфайзен'
        },
        {
            slug: 'tinkoff',
            name: 'Тинькофф'
        },
        {
            slug: 'alpha',
            name: 'Альфбанк'
        }
    ],
    bankList: [],
    cardsList: [] as any,
    loading: true,
    hasItems: true,
    page: 1,
    lastPage: 1,
    offset: 1,
    totalCount: 1
  }),
  getters: {
    itemsAll: (state) => {
        return state.cardsList.map((item) => {
            const switchStatus = item.status === 'active' ? true : false
            const bankName = state.banks.find((bank) => bank.slug === item.bank).name
            const pan = item.pan.slice(12, 16)

            return {
                id: item.uid,
                card: {
                    type: item.type,
                    num: pan
                },
                bank: {
                    slug: item.bank,
                    name: bankName
                },
                device: {
                    name: item.deviceName,
                    comment: item.deviceComment,
                    isOnline: item.isDeviceOnline,
                    batteryLevel: item.deviceBatteryLevel
                },
                comment: item.comment,
                status: item.status,
                switch: {
                    cardUid: item.uid,
                    isSwitched: switchStatus
                }
            }
        })
    },
    bankItems: (state) => state.bankList
  },
  actions: {
    async checkCard(search: string) {
        const res = await getCards({ search })
        return res?.data.list[0] ? true : false 
    },
    async checkCardNotCurrent(search: string, currentUid: string) {
        const res = await getCards({ search })

        console.log(res)

        if (res?.data && res.data.list.length > 0) {
            return res?.data.list[0].uid !== currentUid ? true : false
        } else {
            return false
        }
        
        // return res?.data.list && res?.data.list[0].uid !== currentUid ? true : false
    },
    async fetchCardByUID(uid: string) {
        const res = await getCardByUID(uid)
        return res?.data.card
    },
    async saveEditCard(editedCard: Record<string, unknown>) {
        this.showLoading()

        const uid = editedCard.uid as string
        const pan = editedCard.cardNum as string

        const onSaveCard = {
            pan,
            maxDailyOrderSumUSD: Number(editedCard.limit.replace(/\s/g, '')),
            comment: editedCard.comment
        }

        const idx = this.cardsList.findIndex((card) => card.uid === uid)

        const res = await editCard(uid, onSaveCard)
        
        if (res && res.data !== undefined && res?.data.card) this.cardsList[idx] = res?.data.card

        return res
    },
    async removeCard(uid: string) {
        this.cardsList = this.cardsList.filter((card) => card.uid !== uid)
        await deleteCard(uid)
    },
    async fetchCards(options: TFilterPaginationOptions) {
      this.showLoading()

      const res = await getCards(options)
      
      this.cardsList = res?.data.list
      this.page = res?.data.page
      this.offset = res?.data.offset
      this.totalCount = res?.data.totalCount
      this.lastPage = res?.data.lastPage

      if (this.cardsList.length === 0) {
        this.hasItems = false
      } else {
        this.hasItems = true
      }

      console.log(this.cardsList)
    },
    async loadMoreCards(options: TFilterPaginationOptions) {
      this.showLoading()

      const res = await getCards(options)
      const newListItems = res?.data.list
      
      this.cardsList.push(...newListItems)
      this.page = res?.data.page
      this.offset = res?.data.offset
      this.totalCount = res?.data.totalCount
      this.lastPage = res?.data.lastPage

      if (this.cardsList.length === 0) {
        this.hasItems = false
      } else {
        this.hasItems = true
      }
    },
    async createCard(newCard: Record<string, unknown>) {
        this.showLoading()

        const createdCard = {
            bank: newCard.bank.select,
            pan: newCard.cardNum.replace(/\s/g, ''),
            deviceId: newCard.device.select,
            maxDailyOrderSumUSD: Number(newCard.limit.replace(/\s/g, '')),
            comment: newCard.comment
        }
        const res = await addCard(createdCard)

        this.cardsList.unshift(res?.data.card)
    },
    async toggleCard(uid: string, isSwitched: boolean) {
        if (isSwitched) {
            const res = await setShutdownCard(uid)

            if (res?.status === 200) {
                this.cardsList.find((card) => card.uid === uid).status = 'stopped'
            }
        } else {
            this.cardsList.find((card) => card.uid === uid).status = 'connect'
            const res = await setTurnOnCard(uid)

            if (res?.status === 200) {
                this.cardsList.find((card) => card.uid === uid).status = 'active'
            }
        }
    },
    async fetchBanks() {
        const res = await getBanks()
        this.bankList = res?.data.banks
        // this.bankList = Object.entries(banks).map(([key, value]) => {
        //     const newItem = {} as any
        //     newItem[key] = value
        //     return newItem
        // })
    },
    showLoading() {
        this.loading = true
    },
    hideLoading() {
        this.loading = false
    }
  }
})
