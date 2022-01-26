'use strict'

const {Result, Log} = require('ethlog')
const {validateInstanceMap, mapObject} = require('minitype')
const mongodb = require('mongodb')
const {pancakePoolV2Codec} = require('../../lib/codec')
const {
    UInt16, UInt64, UInt256, Address, ByteData32
} = require('../../lib/type/basic')
const {isBigNumber} = require('../../lib/type/validator')

class PoolSyncEvent {
    /**
     * Initialize by {@link PoolSyncEvent.create},
     * {@link PoolSyncEvent.fromLog}.
     *
     * @param {object} data
     * @param {Address} data.address
     * @param {UInt64} data.blockNumber
     * @param {UInt16} data.transactionIndex
     * @param {UInt16} data.logIndex
     * @param {ByteData32} data.transactionHash
     * @param {UInt256} data.reserve0
     * @param {UInt256} data.reserve1
     */
    constructor(data) {
        this.address = data.address
        this.blockNumber = data.blockNumber
        this.transactionIndex = data.transactionIndex
        this.logIndex = data.logIndex
        this.transactionHash = data.transactionHash
        this.reserve0 = data.reserve0
        this.reserve1 = data.reserve1
    }

    /**
     * @param {object} data
     * @param {Address} data.address
     * @param {UInt64} data.blockNumber
     * @param {UInt16} data.transactionIndex
     * @param {UInt16} data.logIndex
     * @param {ByteData32} data.transactionHash
     * @param {UInt256} data.reserve0
     * @param {UInt256} data.reserve1
     * @return {Result<TypeError, PoolSyncEvent>}
     */
    static create(data) {
        let r1 = validateInstanceMap(data, [
            ['address', Address],
            ['blockNumber', UInt64],
            ['transactionIndex', UInt16],
            ['logIndex', UInt16],
            ['transactionHash', ByteData32],
            ['reserve0', UInt256],
            ['reserve1', UInt256]
        ])
        if (r1.error) {
            return r1
        }
        let instance = new PoolSyncEvent(data)
        return Result.ok(instance)
    }

    /**
     *
     * @param {Log} log
     * @return {Result<TypeError, PoolSyncEvent>}
     */
    static fromLog(log) {
        let r1 = PoolSyncEvent._parseReserves(log)
        if (r1.error) {
            return r1
        }
        let {reserve0, reserve1} = r1.data
        let values = {
            address: log.address,
            blockNumber: log.blockNumber,
            transactionIndex: log.transactionIndex,
            logIndex: log.logIndex,
            transactionHash: log.transactionHash,
            reserve0: reserve0,
            reserve1: reserve1
        }
        return PoolSyncEvent.create(values)
    }

    /**
     *
     * @param {object} document
     * @return {Result<TypeError, PoolSyncEvent>}
     */
    static fromDocument(document) {
        let r1 = mapObject(document, [
            ['address', Address.fromMongodbType],
            ['block_number', UInt64.fromMongodbType, 'blockNumber'],
            ['transaction_index', UInt16.fromMongodbType, 'transactionIndex'],
            ['log_index', UInt16.fromMongodbType, 'logIndex'],
            ['transaction_hash', ByteData32.fromMongodbType, 'transactionHash'],
            ['reserve0', UInt256.fromMongodbType],
            ['reserve1', UInt256.fromMongodbType]
        ])
        if (r1.error) {
            return r1
        }
        let {data: values} = r1
        return PoolSyncEvent.create(values)
    }

    /**
     *
     * @param {Log} log
     * @return {Result<TypeError, {reserve0, reserve1}>}
     */
    static _parseReserves(log) {
        let decoded = pancakePoolV2Codec.parseLog(log)
        let {args} = decoded
        if (args === undefined) {
            return Result.typeError('expect arguments from Sync event')
        }
        let {reserve0, reserve1} = args
        if (!isBigNumber(reserve0)) {
            return Result.error('reserve0: expect a BigNumber')
        }
        let r1 = UInt256.fromHeximal(reserve0.toHexString())
        if (r1.error) {
            return Result.typeError(`reserve0: ${r1.error.message}`)
        }
        if (!isBigNumber(reserve1)) {
            return Result.error('reserve1: expect a BigNumber')
        }
        let r2 = UInt256.fromHeximal(args.reserve1.toHexString())
        if (r2.error) {
            return Result.typeError(`reserve1: ${r2.error.message}`)
        }
        return Result.ok({
            reserve0: r1.data,
            reserve1: r1.data
        })
    }

    /**
     * @return {PoolSyncEventDocument}
     */
    toMongodbDocument() {
        let data = {
            address: this.address.toMongodbType(),
            blockNumber: this.blockNumber.toMongodbType(),
            transactionIndex: this.transactionIndex.toMongodbType(),
            logIndex: this.logIndex.toMongodbType(),
            transactionHash: this.transactionHash.toMongodbType(),
            reserve0: this.reserve0.toMongodbType(),
            reserve1: this.reserve1.toMongodbType()
        }
        return PoolSyncEventDocument.create(data).open()
    }
}

class PoolSyncEventDocument {
    /**
     * Initialize by {@link PoolSyncEventDocument.create}.
     *
     * @param {object} data
     * @param {mongodb.Binary} data.address
     * @param {mongodb.Binary} data.blockNumber
     * @param {mongodb.Int32} data.transactionIndex
     * @param {mongodb.Int32} data.logIndex
     * @param {mongodb.Binary} data.transactionHash
     * @param {mongodb.Binary} data.reserve0
     * @param {mongodb.Binary} data.reserve1
     */
    constructor(data) {
        this['address'] = data.address
        this['block_number'] = data.blockNumber
        this['transaction_index'] = data.transactionIndex
        this['log_index'] = data.logIndex
        this['transaction_hash'] = data.transactionHash
        this['reserve0'] = data.reserve0
        this['reserve1'] = data.reserve1
    }

    /**
     *
     * @param {object} data
     * @param {mongodb.Binary} data.address
     * @param {mongodb.Binary} data.blockNumber
     * @param {mongodb.Int32} data.transactionIndex
     * @param {mongodb.Int32} data.logIndex
     * @param {mongodb.Binary} data.transactionHash
     * @param {mongodb.Binary} data.reserve0
     * @param {mongodb.Binary} data.reserve1
     * @return {Result<TypeError, PoolSyncEventDocument>}
     */
    static create(data) {
        let r1 = validateInstanceMap(data, [
            ['address', mongodb.Binary],
            ['blockNumber', mongodb.Binary],
            ['transactionIndex', mongodb.Int32],
            ['logIndex', mongodb.Int32],
            ['transactionHash', mongodb.Binary],
            ['reserve0', mongodb.Binary],
            ['reserve1', mongodb.Binary]
        ])
        if (r1.error) {
            return r1
        }
        let instance = new PoolSyncEventDocument(data)
        return Result.ok(instance)
    }
}

module.exports = {
    PoolSyncEvent,
    PoolSyncEventDocument
}
