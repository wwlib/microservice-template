import { Socket } from 'socket.io';
import { Connection, ConnectionType, ConnectionAnalyticsEventType } from './Connection';

export class ConnectionManager {

    private static instance: ConnectionManager

    private _deviceConnections: Map<string, Connection>
    private _deviceConnectionsByAccountId: Map<string, Connection>

    private constructor() {
        this._deviceConnections = new Map<string, Connection>()
        this._deviceConnectionsByAccountId = new Map<string, Connection>()
    }

    public static getInstance(): ConnectionManager {
        if (!ConnectionManager.instance) {
            ConnectionManager.instance = new ConnectionManager()
        }
        return ConnectionManager.instance
    }

    getConnectionsWithType(type: ConnectionType): Map<string, Connection> | undefined {
        let result: Map<string, Connection> | undefined = undefined
        switch (type) {
            case ConnectionType.DEVICE:
                result = this._deviceConnections
                break;
        }
        return result
    }

    getConnectionsAsArray(type: ConnectionType): Connection[] | undefined {
        let connections: Map<string, Connection> | undefined = this.getConnectionsWithType(type)
        if (connections) {
            return Array.from(connections.values())
        } else {
            return undefined
        }
    }

    getConnectionWithTypeAndSocketId(type: ConnectionType, socketId: string): Connection | undefined {
        let result: Connection | undefined = undefined
        const connections: Map<string, Connection> | undefined = this.getConnectionsWithType(type)
        if (connections) {
            result = connections.get(socketId)
        }
        return result
    }

    getConnectionWithTypeAndAccountId(type: ConnectionType, accountId: string): Connection | undefined {
        let result: Connection | undefined = undefined
        if (type === ConnectionType.DEVICE) {
            const connections: Map<string, Connection> | undefined = this._deviceConnectionsByAccountId
            if (connections) {
                result = connections.get(accountId)
            }
        }
        return result
    }

    addConnection(type: ConnectionType, socket: Socket, accountId: string): Connection | undefined {
        let connection: Connection | undefined = undefined
        const connections = this.getConnectionsWithType(type)
        if (connections && socket && socket.id) {
            connection = new Connection(type, socket, accountId)
            connections.set(socket.id, connection)
            // update _deviceConnectionsByAccountId
            if (type === ConnectionType.DEVICE && accountId) {
                this._deviceConnectionsByAccountId.set(accountId, connection)
            }
        } else {
            throw new Error(`Error adding connection type: ${type}`)
        }
        return connection
    }

    removeConnection(type: ConnectionType, socket: Socket) {
        const connections = this.getConnectionsWithType(type)
        if (connections && socket) {
            const connection = connections.get(socket.id)
            connections.delete(socket.id)
            // update _deviceConnectionsByAccountId
            if (connection && type === ConnectionType.DEVICE && connection.accountId) {
                this._deviceConnectionsByAccountId.delete(connection.accountId)
            }
        }
    }

    onAnalyticsEvent(type: ConnectionType, socket: Socket, eventType: ConnectionAnalyticsEventType) {
        const connection = this.getConnectionWithTypeAndSocketId(type, socket.id)
        if (connection) {
            connection.onAnalyticsEvent(eventType)
        }
    }
}