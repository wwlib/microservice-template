import { Socket } from 'socket.io';

export enum ConnectionType {
    DEVICE = 'device',
}

export enum ConnectionAnalyticsEventType {
    MESSAGE_IN = 'message_in',
    MESSAGE_OUT = 'message_out',
}

export class Connection {

    private _type: ConnectionType;
    private _socket: Socket | undefined;
    private _socketId: string;
    private _accountId: string;
    private _syncOffset: number;
    private _lastSyncTimestamp: number;
    private _messageCountIn: number;
    private _messageCountInQuota: number;
    private _messageCountOut: number;
    private _syncOffest: number;

    constructor(type: ConnectionType, socket: Socket, accountId: string) {
        this._type = type
        this._socket = socket
        this._socketId = socket.id
        this._accountId = accountId
        this._syncOffset = 0
        this._lastSyncTimestamp = 0
        this._messageCountIn = 0
        this._messageCountInQuota = 0
        this._messageCountOut = 0
        this._syncOffest = 0;
    }

    get accountId(): string {
        return this._accountId
    }

    get syncOffest(): number {
        return this._syncOffest
    }

    toString(): string {
        const syncOffset = Math.round(this._syncOffest * 1000) / 1000
        return `${this._accountId}: [${this._socketId.substring(0, 6)}] syncOffset: ${syncOffset} ms, messagesIn: ${this._messageCountIn}, messagesOut: ${this._messageCountOut}`
    }

    sendMessage(message: unknown) {
        if (this._socket && this._socket.connected) {
            this._socket.emit('message', message)
        }
    }

    onAnalyticsEvent(eventType: ConnectionAnalyticsEventType) {
        switch (eventType) {
            case ConnectionAnalyticsEventType.MESSAGE_IN:
                this._messageCountIn += 1
                break;
            case ConnectionAnalyticsEventType.MESSAGE_OUT:
                this._messageCountOut += 1
                break;
        }
    }

    onSyncOffset(offset: number) {
        this._syncOffest = offset
    }

    emitEvent(eventName: string, data?: any) {
        if (this._socket) {
            this.onAnalyticsEvent(ConnectionAnalyticsEventType.MESSAGE_OUT)
            this._socket.emit(eventName, data)
        }
    }

    dispose() {

    }
}