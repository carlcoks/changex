import { defineStore } from 'pinia'
import { deleteDevice, editDeviceName, editDeviceComment, getDeviceId, getDevices, getFilteredDevices, getTempToken, checkTempToken } from '@/api'
import type { TFilterPaginationOptions } from '@/types'

export const useDevicesStore = defineStore('devices', {
  state: () => ({
    deviceList: [] as any,
    filteredDeviceList: [],
    qr: '',
    loading: true,
    hasItems: true,
    isTempTokenGet: false,
    page: 1,
    lastPage: 1,
    offset: 1,
    totalCount: 1
  }),
  getters: {
    deviceItemsAll: (state) => {
      return state.deviceList.map((item: Record<string, unknown>) => {
        return {
            id: item.deviceId,
            title: {
              name: item.name,
              isOnline: item.isOnline,
              batteryLevel: item.batteryLevel
            },
            device: item.model,
            status: item.status,
            comment: item.comment
        }
      })
    }
  },
  actions: {
    async fetchDeviceById(id: string) {
      const res = await getDeviceId(id)
      return res?.data.device
    },
    async fetchDevices(options: TFilterPaginationOptions) {
      this.showLoading()

      const res = await getDevices(options)
      
      this.deviceList = res?.data.list
      this.page = res?.data.page
      this.offset = res?.data.offset
      this.totalCount = res?.data.totalCount
      this.lastPage = res?.data.lastPage

      if (this.deviceList.length === 0) {
        this.hasItems = false
      } else {
        this.hasItems = true
      }

      console.log(this.deviceList)
    },
    async fetchFilteredDevices() {
      const res = await getFilteredDevices()
      this.filteredDeviceList = res?.data.devices
    },
    async loadMoreDevices(options: TFilterPaginationOptions) {
      this.showLoading()

      const res = await getDevices(options)
      const newListItems = res?.data.list
      
      this.deviceList.push(...newListItems)
      this.page = res?.data.page
      this.offset = res?.data.offset
      this.totalCount = res?.data.totalCount
      this.lastPage = res?.data.lastPage

      if (this.deviceList.length === 0) {
        this.hasItems = false
      } else {
        this.hasItems = true
      }
    },
    async loadQR() {
      const res = await getTempToken()
      this.qr = res?.data.qr
      console.log(res)
      console.log(this.qr)
    },
    async checkToken() {
      const res = await checkTempToken()
      if (res?.data.status === 'done') {
        this.isTempTokenGet = true
      }
    },
    async saveEditDevice(edited: Record<string, unknown>) {
      this.showLoading()
      
      const id = edited.id as string

      const idx = this.deviceList.findIndex((device) => device.deviceId === id)
      
      const editedOptionsRename = {
        name: edited.name
      }

      const editedOptionsComment = {
        comment: edited.comment
      }

      await editDeviceName(id, editedOptionsRename)
      await editDeviceComment(id, editedOptionsComment)

      const newDevice = await getDeviceId(id)
      
      this.deviceList[idx] = newDevice?.data.device
    },
    async removeDevice(id: string) {
      this.deviceList = this.deviceList.filter((device) => device.deviceId !== id)
      await deleteDevice(id)
    },
    showLoading() {
      this.loading = true
    },
    hideLoading() {
      this.loading = false
    }
  }
})
