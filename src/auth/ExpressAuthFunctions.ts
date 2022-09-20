import { Response, NextFunction } from 'express'
import { AuthRequest } from '@types'
import * as errors from '@errors'
import { IncomingMessage } from 'http'
import { WebSocketServer } from 'ws'
import { Duplex } from 'stream'
import { JwtAuth, ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from './JwtAuth'
import { StatusCodes } from 'http-status-codes'

export const noAuthHttp = () =>
  function noAuthNoPermissions(req: AuthRequest, res: Response, next: NextFunction) {
    next()
  };

export const authHttp = (permissions: string[]) =>
  function authWithPermissions(req: AuthRequest, res: Response, next: NextFunction) {
    let expectedPermissions: string[] = permissions
    const refreshToken = req.cookies ? req.cookies[REFRESH_TOKEN_NAME] as string : ''
    try {
      let accessToken: string = req.headers.authorization ? req.headers.authorization.split(' ')[1] : ''
      // also look for accessToken in the query string
      if (!accessToken && req.query) {
        accessToken = req.query[ACCESS_TOKEN_NAME] as string
      }
      if (!accessToken && req.cookies) {
        accessToken = req.cookies[ACCESS_TOKEN_NAME] as string
      }
      const decodedAccessToken = JwtAuth.decodeAccessToken(accessToken, refreshToken)
      const accountId = decodedAccessToken ? decodedAccessToken.accountId : ''
      checkPermissions(expectedPermissions, decodedAccessToken)
      req.auth = {
        accountId,
        accessTokenPayload: decodedAccessToken
      }
      next();
    } catch (error: any) {
      console.error('Error:', error.message)
      if (error.code === StatusCodes.FORBIDDEN) {
        res.redirect('/forbidden')
      } else {
        if (refreshToken) {
          const encodedUrl = encodeURIComponent(req.url)
          console.log(`starting refresh. encoded url: ${encodedUrl}`)
          res.redirect(`/refresh/?destination=${encodedUrl}`)
        } else {
          res.redirect('/signin/')
        }
      }
    }
  }

export const getPermissionsFromDecodedAccessToken = (payload: any): string[] => {
  const permissions = payload.auth?.permissions
  if (permissions && permissions.length > 0) {
    return permissions
      .map(({ resource, scopes }: any) => scopes.map((scope: any) => `${resource}:${scope}`))
      .flat()
  } else {
    throw errors.ForbiddenError('No permissions found in the token.')
  }
}

export const checkPermissions = (expectedPermissions: string[], decodedAccessToken: any) => {
  if (!expectedPermissions.length) {
    console.info('Authorization is enforced but no permissions are required for this request.')
    return
  }
  if (!decodedAccessToken) {
    throw new Error('decodedAccessToken is undefined.')
  }
  const tokenPermissions = getPermissionsFromDecodedAccessToken(decodedAccessToken)
  if (expectedPermissions.every((perm) => tokenPermissions.includes(perm))) {
    return
  } else {
    throw errors.ForbiddenError('Invalid permissions.')
  }
}

//// WebSocket Auth

export const getTokenFromWebsocket = (req: IncomingMessage): string | undefined => {
  let token = req.headers.authorization?.split('Bearer ').pop()
  if (!token || token === '') {
    console.info({ token }, 'Token not found in header, looking in query string.')
    const location = new URL(req.url as string, `http://${req.headers.host}`)
    const headerToken = location.searchParams.get('accessToken')
    if (headerToken !== null) {
      console.info({ headerToken }, 'Token found in query parameter.')
      token = headerToken
    }
  }
  return token
}

export const socketAuthorization = (req: IncomingMessage) => {
  const token = getTokenFromWebsocket(req)
  if (!token) {
    throw errors.UnauthorizedError('Unauthorized: Missing token.')
  }

  try {
    return JwtAuth.decodeAccessToken(token)
  } catch (error: any) {
    console.error(error)
    throw errors.UnauthorizedError('Unauthorized: Invalid token.')
  }
}

export const sendErrorAndDestroySocket = (wss: WebSocketServer, req: IncomingMessage, socket: Duplex, head: Buffer, error: errors.WSErrorResponse) => {
  console.error('sendErrorAndDestroySocket:', error)
  socket.write(`HTTP/1.1 ${error.code} ${error.result.message}\r\n\r\n`)
  socket.destroy()
}
