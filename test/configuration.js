'use strict'

/* eslint-disable max-len*/
/* eslint-disable max-lines-per-function */

const assert = require('assert')
const {
    EthEndpoint, HttpUrl, EndpointQuota, Timespan, UInt, UInt64, DataSize,
    Address
} = require('ethlog')
const mockFs = require('mock-fs')
const {UInt16} = require('minitype')
const {Configuration} = require('../lib/configuration')
const {getDataFilePath, readDataFile} = require('./_lib')
const {Result} = require('../lib/type')
const {MongodbEndpoint} = require('../lib/service/mongodb')

describe('Configuration.fromFile', () => {
    afterEach(() => {
        mockFs.restore()
    })
    it('invalid JSON format file, return error', () => {
        let filePath = 'config_invalid_json_format.json'
        mockFs({
            [filePath]: mockFs.file({
                content: readDataFile(filePath),
                mode: 0o600
            })
        })
        let expectedResult = 'invalid JSON format'
        let r1 = Configuration.fromFile(filePath)
        let {error: {message: actualResult}} = r1
        assert.deepStrictEqual(actualResult, expectedResult)
    })
    it('not existed file, return error', () => {
        let filePath = getDataFilePath('not_existed_ever')
        let expectedResult = 'file is not existed or access denied'
        let r1 = Configuration.fromFile(filePath)
        let {error: {message: actualResult}} = r1
        assert.deepStrictEqual(actualResult, expectedResult)
    })
    it('default attributes is not set, return default values', () => {
        let filePath = 'config_all_default_attribute_is_not_set.json'
        mockFs({
            [filePath]: mockFs.file({
                content: readDataFile(filePath),
                mode: 0o600
            })
        })
        let config = new Configuration({
            mongodbEndpoint: MongodbEndpoint.create({
                url: 'mongodb://localhost/ethlog_example'
            }).open(),
            mainBscEndpoints: [
                EthEndpoint.create({
                    url: HttpUrl.fromString('http://foo.bar').open(),
                    quota: EndpointQuota.create({
                        batchLimit: UInt.fromNumber(200).open(),
                        batchTimespan: Timespan.fromMinutes(1).open()
                    }).open(),
                    logSafeGap: UInt64.fromNumber(15).open(),
                    logRangeBoundary:  UInt64.fromNumber(5000).open(),
                    logTimeBorder: Timespan.fromSeconds(6).open(),
                    logSizeBorder: DataSize.fromMegabytes(4).open(),
                    logQuantityBorder: UInt64.fromNumber(10000).open()
                }).open()
            ],
            backupBscEndpoints: [],
            poolAddress: Address.fromHeximal('0x58f876857a02d6762e0101bb5c46a8c1ed44dc16').open(),
            beginBlockNumber: UInt64.fromNumber(6810708).open(),
            host: '127.0.0.1',
            port: UInt16.fromNumber(8080).open()
        })
        let expectedResult = Result.ok(config)
        let actualResult = Configuration.fromFile(filePath)
        assert.deepStrictEqual(actualResult, expectedResult)
    })
    it('all attributes is set, return correct values', () => {
        let filePath = 'config_all_attribute_is_set.json'
        mockFs({
            [filePath]: mockFs.file({
                content: readDataFile(filePath),
                mode: 0o600
            })
        })
        let config = new Configuration({
            mongodbEndpoint: MongodbEndpoint.create({
                url: 'mongodb://localhost/foo_bar',
                username: 'foo',
                password: '***'
            }).open(),
            mainBscEndpoints: [
                EthEndpoint.create({
                    url: HttpUrl.fromString('https://foo.bar').open(),
                    username: 'zoo',
                    password: '***',
                    quota: EndpointQuota.create({
                        batchLimit: UInt.fromNumber(555).open(),
                        batchTimespan: Timespan.fromMiliseconds(9999).open()
                    }).open(),
                    logSafeGap: UInt64.fromNumber(333).open(),
                    logRangeBoundary:  UInt64.fromNumber(13579).open(),
                    logTimeBorder: Timespan.fromMiliseconds(24680).open(),
                    logSizeBorder: DataSize.fromBytes(112233).open(),
                    logQuantityBorder: UInt64.fromNumber(332211).open()
                }).open()
            ],
            backupBscEndpoints: [
                EthEndpoint.create({
                    url: HttpUrl.fromString('https://zoo.foo').open(),
                    username: 'noop',
                    password: '***',
                    quota: EndpointQuota.create({
                        batchLimit: UInt.fromNumber(444).open(),
                        batchTimespan: Timespan.fromMiliseconds(555).open()
                    }).open(),
                    logSafeGap: UInt64.fromNumber(666).open(),
                    logRangeBoundary:  UInt64.fromNumber(777).open(),
                    logTimeBorder: Timespan.fromMiliseconds(888).open(),
                    logSizeBorder: DataSize.fromBytes(999).open(),
                    logQuantityBorder: UInt64.fromNumber(1234).open()
                }).open()
            ],
            poolAddress: Address.fromHeximal('0xd1ab4f5cd13f2ad8ed05e81590edcf49e46a8e46').open(),
            beginBlockNumber: UInt64.fromNumber(88889999).open(),
            host: '1.2.3.4',
            port: UInt16.fromNumber(1234).open()
        })
        let expectedResult = Result.ok(config)
        let actualResult = Configuration.fromFile(filePath)
        assert.deepStrictEqual(actualResult, expectedResult)
    })
})
