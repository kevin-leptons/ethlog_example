'use strict'

const {
    Result, mapArray, mapObject, validateInstance,
    validateInstanceMap, Heximal
} = require('minitype')
const {PoolSyncEvent} = require('../../lib/type/event')
const {PInt} = require('../../lib/type/basic')

class GetPoolEventRequest {
    /**
     * Initialize by {@link GetPoolEventRequest.fromRequest}.
     *
     * @param {object} data
     * @param {PInt} data.page
     */
    constructor(data) {
        this.page = data.page
    }

    /**
     *
     * @param {object} req
     * @param {object} req.query
     * @param {string} req.query.p
     * @return {Result<TypeError, GetPoolEventRequest>}
     */
    static fromRequest(req) {
        let r1 = validateInstanceMap(req, [
            ['query', 'object']
        ], false)
        if (r1.error) {
            return r1
        }
        let r2 = mapObject(req.query, [
            ['p', v => PInt.fromDecimal(v || '1'), 'page']
        ])
        if (r2.error) {
            return Result.typeError(`query: ${r2.error.message}`)
        }
        let {data: values} = r2
        let instance = new GetPoolEventRequest(values)
        return Result.ok(instance)
    }
}

class GetPoolEventResponse {
    /**
     * @type {Array<GetPoolEventItem>}
     */
    get value() {
        return this._value
    }

    /**
     *
     * @param {Array<GetPoolEventItem>} value
     */
    constructor(value) {
        this._value = value
    }

    /**
     *
     * @param {Array<PoolSyncEvent>} events
     * @return {Result<TypeError, GetPoolEventResponse>}
     */
    static fromEvents(events) {
        let r1 = mapArray(events, GetPoolEventItem.fromEvent)
        if (r1.error) {
            return r1
        }
        let {data: items} = r1
        let instance = new GetPoolEventResponse(items)
        return Result.ok(instance)
    }
}

class GetPoolEventItem {
    /**
     *
     * @param {object} data
     * @param {Heximal} data.blockNumber
     * @param {number} data.transactionIndex
     * @param {number} data.logIndex
     * @param {Heximal} data.transactionHash
     * @param {Heximal} data.reserve0
     * @param {Heximal} data.reserve1
     */
    constructor(data) {
        this['block_number'] = data.blockNumber
        this['transaction_index'] = data.transactionIndex
        this['log_index'] = data.logIndex
        this['transaction_hash'] = data.transactionHash
        this['reserve0'] = data.reserve0
        this['reserve1'] = data.reserve1
    }

    /**
     *
     * @param {PoolSyncEvent} event
     * @return {Result<TypeError, GetPoolEventItem>}
     */
    static fromEvent(event) {
        let r1 = validateInstance(event, PoolSyncEvent)
        if (r1.error) {
            return r1
        }
        let r2 = mapObject(event, [
            ['blockNumber', v => Result.ok(v.toHeximal())],
            ['transactionIndex', v => Result.ok(v.value)],
            ['logIndex', v => Result.ok(v.value)],
            ['transactionHash', v => Result.ok(v.toHeximal())],
            ['reserve0', v => Result.ok(v.toHeximal())],
            ['reserve1', v => Result.ok(v.toHeximal())]
        ])
        if (r2.error) {
            return r2
        }
        let {data: values} = r2
        let instance = new GetPoolEventItem(values)
        return Result.ok(instance)
    }
}

module.exports = {
    GetPoolEventRequest,
    GetPoolEventResponse
}
