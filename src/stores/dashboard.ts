import { defineStore } from 'pinia'
import { getDashboard, getDashboardDate, getDashboardDateRange, getDashboardChart, getDashboardChartDate } from '@/api'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    dashboard: {},
    chart: {},
    percentage: 0,
    loading: true,
  }),
  getters: {},
  actions: {
    async fetchChart() {
        this.showLoading()

        const res = await getDashboardChart()
        this.chart = res?.data.chart[0]
        this.calculatePercentage(this.chart)
    },
    async fetchDashboard() {
        this.showLoading()

        const res = await getDashboard()
        this.dashboard = res?.data.dashboard
        this.calculatePercentage(this.dashboard)
    },
    async fetchChartForDate(date: Date) {
        this.showLoading()

        const yyyy = date.getFullYear();
        const mm = date.getMonth() + 1; // Months start at 0!
        const dd = date.getDate();

        const dateString = yyyy + '-' + mm.toString().padStart(2, '0') + '-' + dd.toString().padStart(2, '0')

        const res = await getDashboardChartDate(dateString)
        this.chart = res?.data.chart[0]
    },
    async fetchDashboardForDate(date: Date) {
        this.showLoading()

        const yyyy = date.getFullYear();
        const mm = date.getMonth() + 1; // Months start at 0!
        const dd = date.getDate();

        const dateString = yyyy + '-' + mm.toString().padStart(2, '0') + '-' + dd.toString().padStart(2, '0')

        const res = await getDashboardDate(dateString)
        this.dashboard = res?.data.dashboard
        this.calculatePercentage(this.dashboard)
    },
    async fetchDashboardForDateRange(dateStart: Date, dateEnd: Date) {
        this.showLoading()

        const yyyyStart = dateStart.getFullYear()
        const mmStart = dateStart.getMonth() + 1 // Months start at 0!
        const ddStart = dateStart.getDate()

        const dateStringStart = yyyyStart + '-' + mmStart.toString().padStart(2, '0') + '-' + ddStart.toString().padStart(2, '0')

        const yyyyEnd = dateEnd.getFullYear()
        const mmEnd = dateEnd.getMonth() + 1 // Months start at 0!
        const ddEnd = dateEnd.getDate()

        const dateStringEnd = yyyyEnd + '-' + mmEnd.toString().padStart(2, '0') + '-' + ddEnd.toString().padStart(2, '0')

        const res = await getDashboardDateRange(dateStringStart, dateStringEnd)
        this.dashboard = res?.data.dashboard
        this.calculatePercentage(this.dashboard)
    },
    calculatePercentage(chartData: Record<string, number | string>) {
      if (chartData.paymentsCount === 0) {
        this.percentage = 0
      } else {
        this.percentage = (Number(chartData.completePaymentsCount) / Number(chartData.paymentsCount)) * 100
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
