'use strict'

const {validateInstance} = require('minitype')
const {MongodbService} = require('../../lib/service/mongodb')
const {UInt64} = require('../../lib/type')

/**
 * @readonly
 * @enum {string}
 */
const SettingKey = {
    CURRENT_BLOCK_NUMBER: 'current_block_number'
}

class SettingService {
    /**
     * Initialize by {@link SettingService.open}.
     *
     * @param {MongodbService} mongdbService
     */
    constructor(mongdbService) {
        this._collection = mongdbService.settingCollection
    }

    /**
     *
     * @param {MongodbService} mongdbService
     * @return {SettingService}
     */
    static open(mongdbService) {
        validateInstance(mongdbService, MongodbService).open()
        return new SettingService(mongdbService)
    }

    /**
     *
     * @param {UInt64} blockNumber
     * @return {Promise}
     */
    async setCurrentBlockNumber(blockNumber) {
        validateInstance(blockNumber, UInt64)
        await this._collection.updateOne(
            {key: SettingKey.CURRENT_BLOCK_NUMBER},
            {
                $set: {value: blockNumber.toMongodbType()}
            },
            {
                upsert: true
            }
        )
    }

    /**
     * @return {Promise<UInt64 | undefined>}
     */
    async getCurrentBlockNumber() {
        let document = await this._collection.findOne({
            key: SettingKey.CURRENT_BLOCK_NUMBER
        })
        if (!document) {
            return undefined
        }
        return UInt64.fromMongodbType(document['value']).open()
    }
}

module.exports = {
    SettingService
}
