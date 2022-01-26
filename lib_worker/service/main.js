'use strict'

const {log} = require('stdio_log')
const {LogSegment} = require('ethlog')
const {
    validateInstanceMap, validateArrayItems,
    mapArray
} = require('minitype')
const {
    LogStream, UInt64, EthEndpoint, Address, Log, LogTopicFilter,
    Client
} = require('ethlog')
const {DbPoolEventService} = require('../../lib/service/db_pool_event')
const {pancakePoolV2Codec} = require('../../lib/codec')
const {PoolSyncEvent} = require('../../lib/type/event')
const {SettingService} = require('./setting')

class MainService {
    /**
     * Initialize by {@link MainService.open}.
     *
     * @param {object} config
     * @param {LogStream} config.logStream
     * @param {SettingService} config.settingService
     * @param {DbPoolEventService} config.dbPoolEventService
     */
    constructor(config) {
        this._logStream = config.logStream
        this._gameService = config.gameService
        this._settingService = config.settingService
        this._dbPoolEventService = config.dbPoolEventService
    }

    /**
     *
     * @param {*} config
     * @param {EthEndpoint} config.mainEndpoints
     * @param {EthEndpoint} config.backupEndpoints
     * @param {SettingService} config.settingService
     * @param {DbPoolEventService} config.dbPoolEventService
     * @param {Address} config.poolAddress
     * @param {UInt64} config.beginBlockNumber
     * @return {Promise<MainService>}
     */
    static async open(config) {
        validateInstanceMap(config, [
            ['mainEndpoints', Array],
            ['backupEndpoints', Array],
            ['settingService', SettingService],
            ['dbPoolEventService', DbPoolEventService],
            ['poolAddress', Address],
            ['beginBlockNumber', UInt64]
        ]).open()
        validateArrayItems(config.mainEndpoints, EthEndpoint, 1).open()
        validateArrayItems(config.backupEndpoints, EthEndpoint).open()
        let {
            mainEndpoints, backupEndpoints, settingService,
            dbPoolEventService, poolAddress, beginBlockNumber
        } = config
        let client = Client.create({mainEndpoints, backupEndpoints}).open()
        let addresses = [poolAddress]
        let topics = LogTopicFilter.create([
            pancakePoolV2Codec.getEventTopic('Sync')
        ]).open()
        let currentBlock = await settingService.getCurrentBlockNumber()
        let fromBlock = currentBlock
            ? currentBlock.addNumber(1) : beginBlockNumber
        let logStream = LogStream
            .create({client, fromBlock, addresses, topics})
            .open()
        return new MainService({logStream, settingService, dbPoolEventService})
    }

    /**
     * Start running fetching and saving data.
     *
     * @return {Promise<undefined>}
     */
    async start() {
        log.info('start from block number', this._logStream.fromBlock.format9())
        let handler = this._handlerLogs.bind(this)
        await this._logStream.start(handler)
    }

    /**
     *
     * @param {LogSegment} logSegment
     */
    async _handlerLogs(logSegment) {
        MainService._printLogSegment('begin round', logSegment)
        let {logs, toBlock} = logSegment
        if (logs.length > 0) {
            await this._parseAndSaveLogs(logs)
        }
        await this._settingService.setCurrentBlockNumber(toBlock)
        MainService._printLogSegment('end round  ', logSegment)
    }

    /**
     *
     * @param {Array<Log>} logs
     */
    async _parseAndSaveLogs(logs) {
        let segmentSize = 512
        for (let i = 0; i < logs.length;) {
            let segment = logs.slice(i, i + segmentSize)
            if (segment.length === 0) {
                break
            }
            await this._parseAndSaveLogSegment(segment)
            i += segment.length
            log.info('save log segment', `${i}/${logs.length}`)
        }
    }

    /**
     *
     * @param {Array<Log>} logs
     */
    async _parseAndSaveLogSegment(logs) {
        let events = mapArray(logs, PoolSyncEvent.fromLog).open()
        let documents = events.map(e => e.toMongodbDocument())
        await this._dbPoolEventService.putMany(documents)
    }

    /**
     * @param {string} prefix
     * @param {LogSegment} logSegment
     */
    static _printLogSegment(prefix, logSegment) {
        let {logs, fromBlock, toBlock} = logSegment
        let logQuantities = UInt64.fromNumber(logs.length).open()
        let blockQuantities = toBlock.sub(fromBlock).addNumber(1)
        log.info(
            prefix, logQuantities.format5(), 'logs;',
            blockQuantities.format4(), 'blocks;',
            logSegment.fromBlock.format9()
        )
    }
}

module.exports = {
    MainService
}
