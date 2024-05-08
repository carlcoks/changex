import axios from "axios"

const $host = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL
})

const $authHost = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL
})

const authInterceptor = (config) => {
    if (!config) {
        config = {}
    }

    if (!config.headers) {
        config.headers = {}
    }

    if(!config.url) {
        config.url = ''
    }

    // On refresh request authorization header replace bearer to refresh token  
    if (config.url.includes('/refresh')) {
        config.headers.authorization = `Bearer ${localStorage.getItem('refreshToken')}`
    } else {
        config.headers.authorization = `Bearer ${localStorage.getItem('accessToken')}`
    }

    return config
}

$authHost.interceptors.request.use(authInterceptor)

export {
    $host,
    $authHost
}
