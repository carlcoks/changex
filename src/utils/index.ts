import type { IUseDeviceWidth, IGetNavItemStroke, ICookieOptions, ICopyToClipboard } from './index.interface'

export const formatter = new Intl.NumberFormat('ru', {
    minimumFractionDigits: 2
})

export const getNavItemStroke: IGetNavItemStroke = (navItemRouteName, currentRouteName, colors) => {
    if (localStorage.getItem('theme') === 'dark') {
        colors.default = '#FFFFFF'
    }

    return navItemRouteName === currentRouteName ? colors.active : colors.default
}

// cw - document.documentElement.clientWidth - device screen app blank width
export const useDeviceWidth: IUseDeviceWidth = () => ({
    getWidth: () => document.documentElement.clientWidth,
    isEqual: (cw, px) => px === cw,
    lessThan: (cw, px) => cw <= px,
    moreThan: (cw, px) => cw >= px,
    between: (cw, pxMin, pxMax) => cw >= pxMin && cw <= pxMax
})

export const setCookie = (name: string, value: string, options?: ICookieOptions) => {
    options = {
        path: '/',
        ...options
    }

    if (options.expires instanceof Date) {
        options.expires = options.expires.toUTCString()
    }

    let updatedCookie = encodeURIComponent(name) + '=' + encodeURIComponent(value)

    for (const optionKey in options) {
        updatedCookie += '; ' + optionKey
        const optionValue = options[optionKey]
        if (optionValue !== true) {
            updatedCookie += '=' + optionValue
        }
    }

    document.cookie = updatedCookie
}

export const deleteCookie = (name: string) => {
    setCookie(name, '', {
        'max-age': -1
    })
}

export const getCookie = (name: string) => {
    const matches = document.cookie.match(
        new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)')
    )
    return matches ? decodeURIComponent(matches[1]) : undefined
}

export const timestampToDatetime = (timestamp: number | string): string => {
    const dateFormat = new Date(timestamp)

    const formatter = new Intl.DateTimeFormat('ru', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        minute: '2-digit',
        hour: '2-digit'
    })

    const formattedDate = formatter.format(dateFormat)
    // console.log(formattedDate)

    return formattedDate
}

export const timestampToDatetimeOffset = (timestamp: number | string, timezone: string): string => {
    const dateFormat = new Date(timestamp)

    const formatter = new Intl.DateTimeFormat('ru', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        minute: '2-digit',
        hour: '2-digit',
        timeZone: timezone
    })

    const formattedDate = formatter.format(dateFormat)

    return formattedDate
}

export const datetimeToTimestamp = (datetime: string | Date): number => {
    if (typeof datetime === 'string') {
        const date = new Date(datetime)
        return date.getTime()
    } else {
        return datetime.getTime()
    }
}

export const dateToDMYString = (date: Date, options: { time: boolean } = { time: true }): string => {
    const yyyy = date.getFullYear();
    const mm = date.getMonth() + 1; // Months start at 0!
    const dd = date.getDate();

    if (options.time) {
        const hours = date.getHours()
        const minutes = date.getMinutes()

        const dateTimeString = `${dd.toString().padStart(2, '0')}-${mm.toString().padStart(2, '0')}-${yyyy} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        return dateTimeString
    } else {
        const dateString = `${dd.toString().padStart(2, '0')}-${mm.toString().padStart(2, '0')}-${yyyy}`
        return dateString
    }
}

export const dateToYMDString = (date: Date, options: { time: boolean } = { time: true }): string => {
    const yyyy = date.getFullYear();
    const mm = date.getMonth() + 1; // Months start at 0!
    const dd = date.getDate();

    if (options.time) {
        const hours = date.getHours()
        const minutes = date.getMinutes()

        const dateTimeString = `${yyyy}-${mm.toString().padStart(2, '0')}-${dd.toString().padStart(2, '0')} ${hours}:${minutes}`
        return dateTimeString
    } else {
        const dateString = `${yyyy}-${mm.toString().padStart(2, '0')}-${dd.toString().padStart(2, '0')}`
        return dateString
    }
}

export const getDifferentTimeStatus = (datetime: string | Date): string | undefined => {
    const present = new Date().getTime()
    
    const date = new Date(datetime).getTime()
    const different = present - date
    let differentRes = 0

    let hours = 0, minutes = 0, days = 0

    if (different > 0) {
        differentRes = different;
        hours = Math.floor((differentRes % 86400000) / 3600000)
        minutes = Math.round(((differentRes % 86400000) % 3600000) / 60000)
        days = Math.floor(differentRes / (1000*60*60*24))
    } else {
        differentRes = Math.abs(different)
        hours = Math.floor(24 - (differentRes % 86400000) / 3600000)
        minutes = Math.round(60 - ((differentRes % 86400000) % 3600000) / 60000)
        days = Math.floor(differentRes / (1000*60*60*24))
    }
    
    if (hours < 1 && minutes < 1) {
        return 'Несколько секунд назад'
    }

    if (hours < 1 && minutes <= 15 && days < 1) {
        return 'Несколько минут назад'
    }

    if (hours < 1 && minutes > 15 && minutes <= 30 && days < 1) {
        return 'Пол-часа назад'
    }

    if (hours < 1 && minutes > 30 && days < 1) {
        return 'Более полу-часа назад'
    }

    if (hours >= 1 && hours < 3 && days < 1) {
        return 'Более часа назад'
    }

    if (hours >= 3 && hours < 24 && days < 1) {
        return 'Несколько часов назад'
    }

    if (days === 1) {
        return 'Сутки назад'
    }

    if (days > 1 && days <= 6) {
        return 'Несколько дней назад'
    }

    if (days === 7) {
        return 'Неделю назад'
    }

    if (days >= 8 && days <= 11) {
        return 'Более недели назад'
    }

    if (days >= 12 && days <= 14) {
        return 'Две недели назад'
    }

    if (days >= 14 && days <= 30) {
        return 'Более двух недель назад'
    }

    if (days > 30) {
        return 'Более месяца назад'
    }
}

export const copyToClipboard: ICopyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        console.log(text)
    })
}
