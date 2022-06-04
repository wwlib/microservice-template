import { IncomingMessage, Server } from 'http'
import { WebSocketServer } from 'ws'
import { Duplex } from 'stream'
import { checkPermissions, socketAuthorization, sendErrorAndDestroySocket } from '../auth/ExpressAuthFunctions'
import * as errors from '@errors'

export interface WSSRoute {
    path: string
    handler: any
    permissions: string[]
}

export type WSSRoutes = WSSRoute[]

export const setupWebSocketServer = (httpServer: Server, wssRoutes: WSSRoutes, serviceOptions?: any): WebSocketServer => {
    const wss = new WebSocketServer({ noServer: true })
    httpServer.on('upgrade', async (req: IncomingMessage, socket: Duplex, head: Buffer) => {
        const location = new URL(req.url as string, `http://${req.headers.host}`)
        const path = location.pathname
        const currentRoute = wssRoutes.find(route => route.path === path)
        if (currentRoute) {
            let token: any
            if (serviceOptions.useAuth) {
                try {
                    token = socketAuthorization(req)
                    checkPermissions(currentRoute.permissions, token)
                } catch (error: any) {
                    sendErrorAndDestroySocket(wss, req, socket, head, error)
                    return
                }
            }
            wss.handleUpgrade(req, socket, head, (ws, req) => {
                currentRoute.handler(wss, ws, req, token)
                wss.emit('connection', ws, req, token)
            })
        } else {
            sendErrorAndDestroySocket(wss, req, socket, head, errors.NotFoundError())
        }
    })

    return wss
}
