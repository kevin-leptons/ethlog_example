'use strict'

const {validateInstance} = require('minitype')
const {Configuration} = require('../lib/configuration')
const {MongodbService} = require('../lib/service/mongodb')
const {DbPoolEventService} = require('../lib/service/db_pool_event')
const {ApiSpecification} = require('./service/api_specification')

/**
 * Intialize services.
 */
class Container {
    /**
     * @type {DbPoolEventService}
     */
    get dbPoolEvent() {
        return this._dbPoolEventService
    }

    /**
     * @type {ApiSpecification}
     */
    get apiSpecification() {
        return this._apiSpecification
    }

    /**
     * Initialize by {@link Container.open}.
     *
     * @param {object} services
     * @param {DbPoolEventService} services.dbPoolEventService
     * @param {ApiSpecification} services.apiSpecification
     */
    constructor(services) {
        this._dbPoolEventService = services.dbPoolEventService
        this._apiSpecification = services.apiSpecification
    }

    /**
     *
     * @param {Configuration} config
     * @return {Promise<Container>}
     */
    static async open(config) {
        validateInstance(config, Configuration).open()
        let mongodbService = await MongodbService.open(config.mongodbEndpoint)
        let dbPoolEventService = DbPoolEventService.open(mongodbService)
        let apiSpecification = await ApiSpecification.open()
        return new Container({
            dbPoolEventService,
            apiSpecification
        })
    }
}

module.exports = Container
