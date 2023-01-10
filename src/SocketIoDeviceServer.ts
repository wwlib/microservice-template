import { Server as HTTPServer } from 'http'
import { Server as SocketIoServer } from 'socket.io'
import { JwtAuth } from './auth/JwtAuth'
import { ConnectionManager } from 'src/connection/ConnectionManager'
import { ConnectionAnalyticsEventType, ConnectionType } from 'src/connection/Connection'

export const setupSocketIoDeviceServer = (httpServer: HTTPServer, path: string): SocketIoServer => {
    const ioSocketServer = new SocketIoServer(httpServer, {
        path: path,
    })

    ioSocketServer.use(function (socket: any, next: any) {
        var auth = socket.request.headers.authorization
        // console.log("auth", auth)
        if (auth) {
            const token = auth.replace("Bearer ", "")
            console.log("auth token", token)
            if (!token) {
                return next(new Error('socket.io DEVICE connection: unauthorized: Missing token.'))
            }
            let decodedAccessToken: any
            try {
                decodedAccessToken = JwtAuth.decodeAccessToken(token)
                console.log(decodedAccessToken)
                socket.data.accountId = decodedAccessToken.accountId
            } catch (error: any) {
                console.error(error)
                return next(new Error('socket.io DEVICE connection: unauthorized: Invalid token.'))
            }
            return next()
        } else {
            return next(new Error("no authorization header"))
        }
    })

    ioSocketServer.on('connection', function (socket: any) {
        console.log(`socket.io: on DEVICE connection:`, socket.id)
        const connection = ConnectionManager.getInstance().addConnection(ConnectionType.DEVICE, socket, socket.data.accountId)
        socket.emit('message', { source: 'Microservice', event: 'handshake', message: 'DEVICE connection accepted' })


        socket.on('command', (command: any) => {
            console.log(`DeviceServer: on command:`, socket.id, socket.data.accountId, command)
            if (command.type === 'sync' && command.name === 'syncOffset') {
                if (command.payload && typeof command.payload.syncOffset === 'number' ) {
                    if (connection) {
                        console.log(`updating syncOffset for device socket: ${socket.id}`)
                        connection.onSyncOffset(command.payload.syncOffset)
                    }
                }
            }
        })

        socket.on('message', (message: string) => {
            console.log(`on message: ${message}`, socket.id, socket.data.accountId)
            ConnectionManager.getInstance().onAnalyticsEvent(ConnectionType.DEVICE, socket, ConnectionAnalyticsEventType.MESSAGE_IN)
            socket.emit('message', { source: 'Microservice', event: 'reply', data: message })
            ConnectionManager.getInstance().onAnalyticsEvent(ConnectionType.DEVICE, socket, ConnectionAnalyticsEventType.MESSAGE_OUT)
        })

        socket.once('disconnect', function (reason: string) {
            console.log(`on DEVICE disconnect: ${reason}: ${socket.id}`)
            ConnectionManager.getInstance().removeConnection(ConnectionType.DEVICE, socket)
        })

        // time sync

        socket.on('timesync', function (data: any) {
            // console.log('device timesync message:', data)
            socket.emit('timesync', {
                id: data && 'id' in data ? data.id : null,
                result: Date.now()
            })
        })
    })

    return ioSocketServer
}
