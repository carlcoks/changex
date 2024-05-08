import { defineStore } from 'pinia'
import { getUserInfo, getUserWallet, getLatestAppApk } from '@/api'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: {},
    walletAddress: '',
    apkUrl: ''
  }),
  actions: {
    async fetchUserInfo() {
      const res = await getUserInfo()
      this.userInfo = res?.data.user
    },
    async getWallet() {
      const res = await getUserWallet()
      this.walletAddress = res?.data.wallet
    },
    async getAppLink() {
      const res = await getLatestAppApk()
      this.apkUrl = res?.data.url
    }
  }
})
