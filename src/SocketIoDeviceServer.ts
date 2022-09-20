import { Server as HTTPServer } from 'http'
import { Server as SocketIoServer } from 'socket.io'
import { JwtAuth } from './auth/JwtAuth'
import ConnectionManager from 'src/connection/ConnectionManager'
import { ConnectionEventType, ConnectionType } from 'src/connection/Connection'
// import ASRSessionHandler from './asr/ASRSessionHandler'
// import { ASRStreamingSessionConfig } from 'cognitiveserviceslib'
import { RCSCommand, RCSCommandType, RCSCommandName } from 'robokit-command-system'


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
        socket.emit('message', { message: 'A new DEVICE has joined!' })

        socket.on('command', (command: RCSCommand) => {
            console.log(`DeviceServer: on command:`, socket.id, socket.data.accountId, command)
            ConnectionManager.getInstance().onConnectionEvent(ConnectionType.DEVICE, socket, ConnectionEventType.COMMAND_FROM)
            ConnectionManager.getInstance().onConnectionEvent(ConnectionType.CONTROLLER, socket, ConnectionEventType.COMMAND_TO)
            if (command.type === RCSCommandType.sync && command.name === RCSCommandName.syncOffset) {
                if (command.payload && typeof command.payload.syncOffset === 'number' ) {
                    if (connection) {
                        console.log(`updating syncOffset for device socket: ${socket.id}`)
                        connection.onSyncOffset(command.payload.syncOffset)
                    }
                }
            } else {
                ConnectionManager.getInstance().broadcastDeviceCommandToSubscriptionsWithAccountId(socket.data.accountId, command)
            }
        })

        socket.on('message', (message: string) => {
            console.log(`on message: ${message}`, socket.id, socket.data.accountId)
            ConnectionManager.getInstance().onConnectionEvent(ConnectionType.DEVICE, socket, ConnectionEventType.MESSAGE_FROM)
            ConnectionManager.getInstance().onConnectionEvent(ConnectionType.CONTROLLER, socket, ConnectionEventType.MESSAGE_TO)
            ConnectionManager.getInstance().broadcastDeviceMessageToSubscriptionsWithAccountId(socket.data.accountId, { message: message })
            socket.emit('message', { message: 'sent', data: message })
        })

        socket.once('disconnect', function (reason: string) {
            console.log(`on DEVICE disconnect: ${reason}: ${socket.id}`)
            ConnectionManager.getInstance().removeConnection(ConnectionType.DEVICE, socket)
        })

        // ASR streaming

        // const asrConfig: ASRStreamingSessionConfig = {
        //     lang: 'en-US',
        //     hints: undefined,
        //     regexpEOS: undefined,
        //     maxSpeechTimeout: 60 * 1000,
        //     eosTimeout: 2000,
        //     providerConfig: {
        //         AzureSpeechSubscriptionKey: process.env.AZURE_SPEECH_SUBSCRIPTION_KEY || "<YOUR-AZURE-SUBSCRIPTION-KEY>",
        //         AzureSpeechTokenEndpoint: process.env.AZURE_SPEECH_TOKEN_ENDPOINT || "https://azurespeechserviceeast.cognitiveservices.azure.com/sts/v1.0/issuetoken",
        //         AzureSpeechRegion: process.env.AZURE_SPEECH_REGION || "eastus",
        //     }
        // }
        // let asrSessionHandler: ASRSessionHandler

        // socket.on('asrAudioStart', () => {
        //     console.log(`on asrAudioStart`)
        //     if (connection) {
        //         asrSessionHandler = new ASRSessionHandler(connection, asrConfig)
        //         asrSessionHandler.startAudio()
        //     }
        // })

        // socket.on('asrAudio', (data: Buffer) => {
        //     console.log(`on asrAudio`, data)
        //     if (data) {
        //         ConnectionManager.getInstance().onConnectionEvent(ConnectionType.DEVICE, socket, ConnectionEventType.AUDIO_BYTES_FROM, data.length)
        //         asrSessionHandler.provideAudio(data)
        //     } else {
        //         console.log(`on asrAudio: NOT sending empty audio data.`)
        //     }
        // })

        // socket.on('asrAudioEnd', () => {
        //     console.log(`on asrAudioEnd`)
        //     asrSessionHandler.endAudio()
        // })

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
