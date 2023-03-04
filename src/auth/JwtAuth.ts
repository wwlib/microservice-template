const jwt = require('jsonwebtoken');

export interface AuthResult {
    access_token: string
    refresh_token: string
    account_id: string
}

export const ACCESS_TOKEN_NAME = 'access_token'
export const REFRESH_TOKEN_NAME = 'refresh_token'

// https://dev.to/franciscomendes10866/using-cookies-with-jwt-in-node-js-8fn
// https://indepth.dev/posts/1382/localstorage-vs-cookies
export class JwtAuth {

    static ACCESS_PRIVATE_KEY_MOCK: string = 'RANDOM_TOKEN_SECRET'
    static REFRESH_PRIVATE_KEY_MOCK: string = 'RANDOM_TOKEN_SECRET'
    static ACCESS_TOKEN_EXPIRES_IN: string = '9999 years' // '1m'
    static REFRESH_TOKEN_EXPIRES_IN: string = '1d'

    // a mock signIn method using ACCESS_PRIVATE_KEY_MOCK to sign tokens
    static signIn = (accountId: string, password: string): Promise<AuthResult> => {
        return new Promise<any>((resolve, reject) => {
            const accessTokenPayload = JwtAuth.getAccessTokenPayload(accountId)
            const refreshTokenPayload = {
                accountId: 'TBD',
            }
            refreshTokenPayload.accountId = accountId
            jwt.sign(accessTokenPayload, JwtAuth.ACCESS_PRIVATE_KEY_MOCK, { algorithm: 'HS256', expiresIn: JwtAuth.ACCESS_TOKEN_EXPIRES_IN }, function (err: any, accessToken: string) {
                if (err) {
                    reject(err)
                } else {
                    jwt.sign(refreshTokenPayload, JwtAuth.REFRESH_PRIVATE_KEY_MOCK, { algorithm: 'HS256', expiresIn: JwtAuth.REFRESH_TOKEN_EXPIRES_IN }, function (err: any, refreshToken: string) {
                        if (err) {
                            reject(err)
                        } else {

                            resolve({ access_token: accessToken, refresh_token: refreshToken, account_id: accessTokenPayload.accountId })
                        }
                    })
                }
            })
        })
    }

    // a mock refresh method using ACCESS_PRIVATE_KEY_MOCK to sign tokens
    static refresh = (accountId: string): Promise<AuthResult> => {
        return new Promise<any>((resolve, reject) => {
            const accessTokenPayload = JwtAuth.getAccessTokenPayload(accountId)
            jwt.sign(accessTokenPayload, JwtAuth.ACCESS_PRIVATE_KEY_MOCK, { algorithm: 'HS256', expiresIn: JwtAuth.ACCESS_TOKEN_EXPIRES_IN }, function (err: any, accessToken: string) {
                if (err) {
                    reject(err)
                } else {
                    resolve({ access_token: accessToken, account_id: accessTokenPayload.accountId })
                }
            })
        })
    }

    // mock method to generate access token payload with permissions
    static getAccessTokenPayload(accountId: string): any {
        return {
            accountId: accountId,
            auth: {
                permissions: [
                    {
                        scopes: [
                            "read",
                            "admin"
                        ],
                        resource: "example"
                    }
                ]
            }
        }
    }

    // a mock method for decoding a JWT token
    // works with tokens signed using ACCESS_PRIVATE_KEY_MOCK
    static decodeAccessToken(token: string, refreshToken?: string): any {
        let payload = undefined
        try {
            payload = jwt.verify(token, JwtAuth.ACCESS_PRIVATE_KEY_MOCK)
        } catch (error: any) {
            console.warn('decodeAccessToken: handled error Ignoring:', error.message)
            console.warn('refreshToken:', refreshToken)
        }
        return payload
    }

    // a mock method for decoding a JWT token
    // works with tokens signed using ACCESS_PRIVATE_KEY_MOCK
    static decodeRefreshToken(token: string): any {
        let payload = undefined
        try {
            payload = jwt.verify(token, JwtAuth.REFRESH_PRIVATE_KEY_MOCK)
        } catch (error: any) {
            console.warn(`decodeRefreshToken: handled error Ignoring:`, error.message)
        }
        return payload
    }
}
