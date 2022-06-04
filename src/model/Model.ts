export class Model {
    private static instance: Model;

    private _requestsCount: number = 0

    private constructor() {
    }

    get requestCount() {
        return this._requestsCount;
    }

    public static getInstance(): Model {
        if (!Model.instance) {
            Model.instance = new Model()
        }
        return Model.instance
    }

    onRequest() {
        this._requestsCount += 1
    }

    resetRequestCount() {
        this._requestsCount = 0
    }
}
