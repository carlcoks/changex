export interface ILocalUserInfo {
    status: string,
    tokenType: string,
    accessToken: string,
    accessTokenExpireAt: number,
    refreshToken: string,
    refreshTokenExpireAt: number,
    role: string
}
