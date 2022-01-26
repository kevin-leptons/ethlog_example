'use strict'

const {validateInstance, validateArrayItems, mapArray} = require('minitype')
const {MongodbService} = require('./mongodb')
const {PoolSyncEvent, PoolSyncEventDocument} = require('../type/event')
const {PInt} = require('../type/basic')

class DbPoolEventService {
    /**
     * Initialize by {@link DbPoolEventService.open}.
     *
     * @param {MongodbService} mongdbService
     */
    constructor(mongdbService) {
        this._collection = mongdbService.poolEventCollection
    }

    /**
     *
     * @param {MongodbService} mongdbService
     * @return {DbPoolEventService}
     */
    static open(mongdbService) {
        validateInstance(mongdbService, MongodbService).open()
        return new DbPoolEventService(mongdbService)
    }

    /**
     *
     * @param {PInt} [page=1]
     * @return {Promise<PoolSyncEventDocument>}
     */
    async find(page = PInt.fromNumber(1).open()) {
        validateInstance(page, PInt).open()
        let filter = {}
        let limit = 10
        let skip = limit * (page.value - 1)
        let documents = await this._collection
            .find(filter, {_id: 0})
            .skip(skip)
            .limit(limit)
            .toArray()
        return mapArray(documents, PoolSyncEvent.fromDocument).open()
    }

    /**
     *
     * @param {Array<PoolSyncEventDocument>} documents
     * @throws {TypeError}
     */
    async putMany(documents) {
        validateArrayItems(documents, PoolSyncEventDocument).open()
        if (documents.length === 0) {
            return
        }
        let operations = documents.map(DbPoolEventService._makePutOperation)
        await this._collection.bulkWrite(operations)
    }

    /**
     * @private
     * @param {PoolSyncEventDocument} document
     * @return {object}
     */
    static _makePutOperation(document) {
        return {
            updateOne: {
                filter: {
                    'block_number': document['block_number'],
                    'transaction_index': document['transaction_index'],
                    'log_index': document['log_index']
                },
                update: {
                    $set: document
                },
                upsert: true
            }
        }
    }
}

module.exports = {
    DbPoolEventService
}
