import { $host, $authHost } from '@/http'
import type { ILocalUserInfo } from './index.interface'
import { setCookie, deleteCookie } from '@/utils'
import type { TFilterPaginationOptions } from '@/types'

const _writeLocalUserInfo = (info: ILocalUserInfo): void => {
    Object.entries(info).map(([key, value]) => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key)
        }

        localStorage.setItem(key, value)
    })
}

const _purgeLocalUserInfo = () => {
    const fields = new Set([
        'accessToken',
        'accessTokenExpireAt',
        'refreshToken',
        'refreshTokenExpireAt',
        'role',
        'status',
        'tokenType'
    ])

    for (const value of fields) {
        localStorage.removeItem(value)
    }
}

const _refreshToken = async () => {
    if (!localStorage.getItem('refreshToken')) {
        return
    }

    const res = await $authHost.post('/auth/refresh', {})
    _writeLocalUserInfo(res.data)

    try {
        const res = await $authHost.post('/auth/refresh', {})
        _writeLocalUserInfo(res.data)
        return res
    } catch (error) {
        if (error.response.data.code === 'not_authorized_request') {
            const res = await $authHost.post('/auth/refresh', {})
            _writeLocalUserInfo(res.data)
            return res
        }
    }

    return res
}

export const login = async (token: string) => {
    const res = await $host.post('/auth/login', { token })
    _writeLocalUserInfo(res.data)

    setCookie('changexlogin', 'true')

    return res
}

export const logout = async () => {
    try {
        await $authHost.post('/auth/logout', {})
        _purgeLocalUserInfo()
        deleteCookie('changexlogin')
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    await $authHost.post('/auth/logout', {})
                    _purgeLocalUserInfo()
                    deleteCookie('changexlogin')
                }
            } else {
                return
            }
        }
    }

    // const res = await $authHost.post('/auth/logout', {})

    // if (res.status === 200) {
    //     _purgeLocalUserInfo()
    //     deleteCookie('changexlogin')
    // }
}

export const getTempToken = async () => {
    try {
        return await $authHost.post('/auth/getTempToken', {})
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post('/auth/getTempToken', {})
                }
            } else {
                return
            }
        }
    }
}

export const checkTempToken = async () => {
    try {
        return await $authHost.post('/auth/checkTempToken', {})
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post('/auth/checkTempToken', {})
                }
            } else {
                return
            }
        }
    }
}

export const getUserInfo = async () => {
    try {
        return await $authHost.post('/me', {})
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post('/me', {})
                }
            } else {
                return
            }
        }
    }
}

export const getUserWallet = async () => {
    try {
        return await $authHost.post('/me/getWallet', {})
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post('/me/getWallet', {})
                }
            } else {
                return
            }
        }
    }
}

export const getLatestAppApk = async () => {
    try {
        return await $host.get('/apk/getLatest.json')
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $host.get('/apk/getLatest.json')
                }
            } else {
                return
            }
        }
    }
}

export const getDashboard = async () => {
    try {
        return await $authHost.post('/dashboard', {})
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post('/dashboard', {})
                }
            } else {
                return
            }
        }
    }
}

export const getDashboardDate = async (dateValue: string) => {
    try {
        return await $authHost.post(`/dashboard/${dateValue}`, {})
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post(`/dashboard/${dateValue}`, {})
                }
            } else {
                return
            }
        }
    }
}

export const getDashboardDateRange = async (dateStartValue: string, dateEndValue: string) => {
    try {
        return await $authHost.post(`/dashboard/${dateStartValue}/${dateEndValue}`, {})
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post(`/dashboard/${dateStartValue}/${dateEndValue}`, {})
                }
            } else {
                return
            }
        }
    }
}

export const getDashboardChart = async () => {
    try {
        return await $authHost.post('/dashboard/chart', {})
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post('/dashboard/chart', {})
                }
            } else {
                return
            }
        }
    }
}

export const getDashboardChartDate = async (dateValue: string) => {
    try {
        return await $authHost.post(`/dashboard/chart/${dateValue}`, {})
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post(`/dashboard/chart/${dateValue}`, {})
                }
            } else {
                return
            }
        }
    }
}

export const getFinancesStory = async (options: TFilterPaginationOptions) => {
    try {
        return await $authHost.post('/balance/history', { ...options })
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post('/balance/history', { ...options })
                }
            } else {
                return
            }
        }
    }
}

export const getCards = async (options: TFilterPaginationOptions) => {
    try {
        return await $authHost.post('/cards/list', { ...options })
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post('/cards/list', { ...options })
                }
            } else {
                return
            }
        }
    }
}

export const getCardByUID = async (uid: string) => {
    try {
        return await $authHost.post(`/cards/${uid}/info`, {})
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post(`/cards/${uid}/info`, {})
                }
            } else {
                return
            }
        }
    }
}

export const addCard = async (data: Record<string, unknown>) => {
    try {
        return await $authHost.post('/cards/add', { ...data })
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post('/cards/add', { ...data })
                }
            } else {
                return
            }
        }
    }
}

export const setShutdownCard = async (cardUid: string) => {
    try {
        return await $authHost.post(`/cards/${cardUid}/off`, {})
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post(`/cards/${cardUid}/off`, {})
                }
            } else {
                return
            }
        }
    }
}

export const setTurnOnCard = async (cardUid: string) => {
    try {
        return await $authHost.post(`/cards/${cardUid}/on`, {})
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post(`/cards/${cardUid}/on`, {})
                }
            } else {
                return
            }
        }
    }
}

export const editCard = async (uid: string, onSaveCard: Record<string, unknown>) => {
    try {
        return await $authHost.post(`/cards/${uid}/edit`, { ...onSaveCard })
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post(`/cards/${uid}/edit`, { ...onSaveCard })
                }
            } else {
                return
            }
        } else {
            return error
        }
    }
}

export const deleteCard = async (uid: string) => {
    try {
        return await $authHost.post(`/cards/${uid}/trash`, {})
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post(`/cards/${uid}/trash`, {})
                }
            } else {
                return
            }
        }
    }
}

export const getBanks = async () => {
    try {
        return await $host.get('/server/banks')
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $host.get('/server/banks')
                }
            } else {
                return
            }
        }
    }
}

export const getPayments = async (options: TFilterPaginationOptions) => {
    try {
        return await $authHost.post('/payments/list', { ...options })
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post('/payments/list', { ...options })
                }
            } else {
                return
            }
        }
    }
}

export const getAwaitingDisputesCount = async () => {
    try {
        return await $authHost.post('/awaitingDisputes/count', {})
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post('/awaitingDisputes/count', {})
                }
            } else {
                return
            }
        }
    }
}

export const getDisputes = async (options: TFilterPaginationOptions) => {
    try {
        return await $authHost.post('/disputes/list', { ...options })
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post('/disputes/list', { ...options })
                }
            } else {
                return
            }
        }
    }
}

export const getCurrentDispute = async (id: string) => {
    try {
        return await $authHost.post(`/payments/${id}/info`, {})
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post(`/payments/${id}/info`, {})
                }
            } else {
                return
            }
        }
    }
}

export const approveDisput = async (id: string) => {
    try {
        return await $authHost.post(`disputes/${id}/approve`, {})
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post(`disputes/${id}/approve`, {})
                }
            } else {
                return
            }
        }
    }
}

export const cancelDisput = async (id: string) => {
    try {
        return await $authHost.post(`disputes/${id}/cancel`, {})
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post(`disputes/${id}/cancel`, {})
                }
            } else {
                return
            }
        }
    }
}

export const getDeviceId = async (id: string) => {
    try {
        return await $authHost.post(`/devices/${id}/info`, {})
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post(`/devices/${id}/info`, {})
                }
            } else {
                return
            }
        }
    }
}

export const getDevices = async (options: TFilterPaginationOptions) => {
    try {
        return await $authHost.post('/devices/list', { ...options })
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post('/devices/list', { ...options })
                }
            } else {
                return
            }
        }
    }
}

export const getFilteredDevices = async () => {
    try {
        return await $authHost.post('/filters/devices', {})
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post('/filters/devices', {})
                }
            } else {
                return
            }
        }
    }
}

export const editDeviceName = async (id: string, onSaveOptions: Record<string, unknown>) => {
    try {
        return await $authHost.post(`/devices/${id}/rename`, { ...onSaveOptions })
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post(`/devices/${id}/rename`, { ...onSaveOptions })
                }
            } else {
                return
            }
        }
    }
}

export const editDeviceComment = async (id: string, onSaveOptions: Record<string, unknown>) => {
    try {
        return await $authHost.post(`/devices/${id}/edit`, { ...onSaveOptions })
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post(`/devices/${id}/edit`, { ...onSaveOptions })
                }
            } else {
                return
            }
        }
    }
}

export const deleteDevice = async (id: string) => {
    try {
        return await $authHost.post(`/devices/${id}/hide`, {})
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post(`/devices/${uid}/hide`, {})
                }
            } else {
                return
            }
        }
    }
}

export const getAccountUID = async (uid: string) => {
    try {
        return await $authHost.post(`/tg/${uid}/info`, {})
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post(`/tg/${uid}/info`, {})
                }
            } else {
                return
            }
        }
    }
}


export const getAccounts = async (options: TFilterPaginationOptions) => {
    try {
        return await $authHost.post('/tg/list', { ...options })
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post('/tg/list', { ...options })
                }
            } else {
                return
            }
        }
    }
}

export const getAccountCode = async () => {
    try {
        return await $authHost.post('/tg/generateCode', {})
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post('/tg/generateCode', {})
                }
            } else {
                return
            }
        }
    }
}

export const editAccount = async (uid: string, onSaveAccount: Record<string, unknown>) => {
    try {
        return await $authHost.post(`/tg/${uid}/edit`, { ...onSaveAccount })
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post(`/tg/${uid}/edit`, { ...onSaveAccount })
                }
            } else {
                return
            }
        }
    }
}

export const deleteAccount = async (uid: string) => {
    try {
        return await $authHost.post(`/tg/${uid}/remove`, {})
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post(`/tg/${uid}/remove`, {})
                }
            } else {
                return
            }
        }
    }
}

export const getBids = async (options: TFilterPaginationOptions) => {
    try {
        return await $authHost.post('/bids/free/list', { ...options })
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post('/bids/free/list', { ...options })
                }
            } else {
                return
            }
        }
    }
}

export const getUserBids = async (options: TFilterPaginationOptions) => {
    try {
        return await $authHost.post('/bids/taken/list', { ...options })
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post('/bids/taken/list', { ...options })
                }
            } else {
                return
            }
        }
    }
}

export const cancelUserBid = async (uid: string) => {
    try {
        return await $authHost.post(`/bids/${uid}/cancel`, {})
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post(`/bids/${uid}/cancel`, {})
                }
            } else {
                return
            }
        } else {
            return error
        }
    }
}

export const takeBid = async (uid: string) => {
    try {
        return await $authHost.post(`/bids/${uid}/take`, {})
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post(`/bids/${uid}/take`, {})
                }
            } else {
                return
            }
        }

        return error
    }
}

export const confirmTakenBid = async (uid: string, bid: Record<string, unknown>) => {
    const formData = new FormData()
    formData.append("receipt", bid.receipt)

    try {
        return await $authHost.post(`/bids/${uid}/addReceipt`, formData)
    } catch (error) {
        if (error.response.data.code === 'jwt_error') {
            if (localStorage.getItem('refreshToken')) {
                const updateRes = await _refreshToken()
                if (updateRes?.status === 200) {
                    return await $authHost.post(`/bids/${uid}/addReceipt`, formData)
                }
            } else {
                return
            }
        } else {
            return error
        }
    }
}
