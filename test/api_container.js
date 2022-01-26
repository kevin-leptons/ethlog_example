'use strict'

/* eslint-disable max-len*/
/* eslint-disable max-lines-per-function */

const assert = require('assert')
const {MongoMemoryServer} = require('mongodb-memory-server')
const {UInt64, EthEndpoint, HttpUrl, Address} = require('ethlog')
const Container = require('../lib_api/container')
const {MongodbEndpoint} = require('../lib/service/mongodb')
const {DbPoolEventService} = require('../lib/service/db_pool_event')
const {ApiSpecification} = require('../lib_api/service/api_specification')
const {Configuration} = require('../lib/configuration')

describe('api/container.open', () => {
    let mongoServer
    let mongoUrl
    before(async() => {
        mongoServer = await MongoMemoryServer.create()
        mongoUrl = mongoServer.getUri() + 'test'
    })
    after(async() => {
        if (mongoServer) {
            await mongoServer.stop()
        }
    })
    it('return an instance', async() => {
        let config = new Configuration({
            mongodbEndpoint: MongodbEndpoint.create({
                url: mongoUrl
            }).open(),
            mainBscEndpoints: [
                EthEndpoint.create({
                    url: HttpUrl.fromString('http://foo.bar').open()
                }).open()
            ],
            backupBscEndpoints: [],
            poolAddress: Address.fromHeximal('0x13b4bda1d6582b4c17452249bc9c9cd4396d4604').open(),
            beginBlockNumber: UInt64.fromNumber(0).open()
        })
        let container = await Container.open(config)
        assert.strictEqual(container instanceof Container, true)
        assert.strictEqual(container.dbPoolEvent instanceof DbPoolEventService, true)
        assert.strictEqual(container.apiSpecification instanceof ApiSpecification, true)
    })
})
