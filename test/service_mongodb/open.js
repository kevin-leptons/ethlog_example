'use strict'

const assert = require('assert')
const {MongoMemoryServer} = require('mongodb-memory-server')
const {MongodbEndpoint, MongodbService} = require('../../lib/service/mongodb')

describe('service.MongodbService.open', () => {
    let mongoServer
    before(async() => {
        mongoServer = await MongoMemoryServer.create()
    })
    after(async() => {
        if (mongoServer) {
            await mongoServer.stop()
        }
    })
    it('succeeded', async() => {
        let endpoint = MongodbEndpoint.create({
            url: mongoServer.getUri() + 'test'
        }).open()
        let actualResult = await MongodbService.open(endpoint)
        assert.strictEqual(actualResult instanceof MongodbService, true)
    })
})
