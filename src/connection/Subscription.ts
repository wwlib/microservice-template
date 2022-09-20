import { RCSCommand } from "robokit-command-system"

export type SubscriptionCommandCallback = (command: RCSCommand, ) => void
export type SubscriptionMessageCallback = (message: unknown, ) => void

export default class Subscription {
    private _accountId: string
    private _subscriberAccountId: string
    private _commandCallback: SubscriptionCommandCallback | undefined
    private _messageCallback: SubscriptionMessageCallback | undefined
    private _commandCount: number
    private _messageCount: number
    private _lastEventTimestamp: number

    constructor(accountId: string, subscriberAccountId: string, commandCallback: SubscriptionCommandCallback, messageCallback?: SubscriptionMessageCallback) {
        this._accountId = accountId
        this._subscriberAccountId = subscriberAccountId
        this._commandCallback = commandCallback
        this._messageCallback = messageCallback
        this._commandCount = 0
        this._messageCount = 0
        this._lastEventTimestamp = 0
    }

    get accountId() {
        return this._accountId
    }

    get subscriberAccountId(): string {
        return this._subscriberAccountId
    }

    get commandCount(): number {
        return this._commandCount
    }

    get messageCount(): number {
        return this._messageCount
    }

    get lastEventTimestamp(): number {
        return this._lastEventTimestamp
    }

    onCommand(command: RCSCommand) {
        if (this._commandCallback) {
            this._commandCount += 1
            this._lastEventTimestamp = new Date().getTime()
            this._commandCallback(command)
        }
    }

    onMessage(message: unknown) {
        if (this._messageCallback) {
            this._messageCount += 1
            this._lastEventTimestamp = new Date().getTime()
            this._messageCallback(message)
        }
    }

    dispose() {
        this._commandCallback = undefined
        this._messageCallback = undefined
    }
}