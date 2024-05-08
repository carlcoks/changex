import type { RouteLocationRaw } from "vue-router"

export type TMenuToggleOptions = {
    mobileItem?: boolean,
    routerLink?: RouteLocationRaw
}

export type TFilterPaginationOptions = {
    search?: string,
    filter?: Record<string, any>,
    sort?: string,
    page?: number,
    countPerPage?: number
}
