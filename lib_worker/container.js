'use strict'

const {validateInstance} = require('minitype')
const {Configuration} = require('../lib/configuration')
const {MongodbService} = require('../lib/service/mongodb')
const {DbPoolEventService} = require('../lib/service/db_pool_event')
const {SettingService} = require('./service/setting')
const {MainService} = require('./service/main')

/**
 * Intialize services.
 */
class Container {
    /**
     * @type {MainService}
     */
    get mainService() {
        return this._mainService
    }

    /**
     * Initialize by {@link Container.open}.
     *
     * @param {object} services
     * @param {MainService} services.mainService
     */
    constructor(services) {
        this._mainService = services.mainService
    }

    /**
     *
     * @param {Configuration} config
     * @return {Promise<Container>}
     */
    static async open(config) {
        validateInstance(config, Configuration).open()
        let mongodbService = await MongodbService.open(config.mongodbEndpoint)
        let settingService = SettingService.open(mongodbService)
        let dbPoolEventService = DbPoolEventService.open(mongodbService)
        let mainService = await MainService.open({
            mainEndpoints : config.mainBscEndpoints,
            backupEndpoints: config.backupBscEndpoints,
            settingService: settingService,
            dbPoolEventService: dbPoolEventService,
            poolAddress: config.poolAddress,
            beginBlockNumber: config.beginBlockNumber
        })
        return new Container({
            mainService
        })
    }
}

module.exports = Container
