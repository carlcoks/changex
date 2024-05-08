import { createRouter, createWebHistory } from 'vue-router'
import { getCookie } from '@/utils'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Finances from '../views/Finances.vue'
import Cards from '../views/Cards.vue'
import Payments from '../views/Payments.vue'
import Disputs from '../views/Disputs.vue'
import Bids from '../views/Bids.vue'
import Devices from '../views/Devices.vue'
import Notifications from '../views/Notifications.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      meta: {
        auth: false,
        title: 'Вход'
      },
      component: Login
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      meta: {
        auth: true,
        title: 'Дашборд'
      },
      component: Dashboard
    },
    {
      path: '/finances',
      name: 'finances',
      meta: {
        auth: true,
        title: 'Финансы'
      },
      component: Finances
    },
    {
      path: '/cards',
      name: 'cards',
      meta: {
        auth: true,
        title: 'Банковские карты'
      },
      component: Cards
    },
    {
      path: '/payments',
      name: 'payments',
      meta: {
        auth: true,
        title: 'Платежи'
      },
      component: Payments
    },
    {
      path: '/disputs',
      name: 'disputs',
      meta: {
        auth: true,
        title: 'Диспуты'
      },
      component: Disputs
    },
    {
      path: '/bids',
      name: 'bids',
      meta: {
        auth: true,
        title: 'Откупы'
      },
      component: Bids
    },
    {
      path: '/devices',
      name: 'devices',
      meta: {
        auth: true,
        title: 'Устройства'
      },
      component: Devices
    },
    {
      path: '/notifications',
      name: 'notifications',
      meta: {
        auth: true,
        title: 'Уведомления'
      },
      component: Notifications
    }
  ]
})

router.beforeEach((to, from, next) => {
  /** Web App Page Title **/
  document.title = `Changex.io - ${to.meta?.title}` ?? 'Changex.io'

  /** Check to auth **/
  const requireAuth = to.matched.some(record => record.meta.auth)

  const isLogin = getCookie('changexlogin')

  if (requireAuth && !isLogin) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
