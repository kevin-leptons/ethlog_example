'use strict'

/**
 * Read, validate and transform configuration from JSON file. See
 * `doc/sample_config.json` for overview attribute from configuration file.
 *
 * @file
 * @example
 * let config = Configuration.fromFile('foo.json')
 */

const {LoadingError, load: loadConfigFile} = require('@trop/seed')
const {
    validateObject, mapObject, mapArray
} = require('minitype')
const {
    EthEndpoint, HttpUrl, EndpointQuota, UInt, UInt16, UInt64, Timespan,
    DataSize, Address
} = require('ethlog')
const {Result} = require('./type')
const {MongodbEndpoint} = require('./service/mongodb')

let uintSchema = {
    type: 'integer',
    minimum: 0
}
let portSchema = {
    type: 'integer',
    minimum: 0,
    maximum: 0xffff
}
let stringSchema = {
    type: 'string'
}
let urlSchema = {
    type: 'string',
    format: 'url'
}
let uriSchema = {
    type: 'string',
    format: 'uri'
}
let ethAddressSchema = {
    type: 'string',
    pattern: '^0x[a-f0-9]{40}$'
}
let mongodbEndpointSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        'url': uriSchema,
        'username': stringSchema,
        'password': stringSchema
    }
}
let bscEndpointSchema = {
    type: 'object',
    required: ['url'],
    additionalProperties: false,
    properties: {
        'url': urlSchema,
        'username': stringSchema,
        'password': stringSchema,
        'quota': {
            type: 'object',
            properties: {
                'batch_limit': uintSchema,
                'batch_timespan': uintSchema
            }
        },
        'log_safe_gap': uintSchema,
        'log_range_boundary': uintSchema,
        'log_time_border': uintSchema,
        'log_size_border': uintSchema,
        'log_quantity_border': uintSchema
    }
}
let hostSchema = {
    type: 'string',
    anyOf: [
        {format: 'hostname'},
        {format: 'ipv4'},
        {format: 'ipv6'}
    ]
}
let schema = {
    type: 'object',
    additionalProperties: false,
    required: ['main_bsc_endpoints'],
    properties: {
        'mongodb_endpoint': mongodbEndpointSchema,
        'main_bsc_endpoints': {
            type: 'array',
            items: bscEndpointSchema,
            minItems: 1
        },
        'backup_bsc_endpoints': {
            type: 'array',
            items: bscEndpointSchema
        },
        'pool_address': ethAddressSchema,
        'begin_block_number': uintSchema,
        'host': hostSchema,
        'port': portSchema
    }
}
let defaultValues = {
    'mongodb_endpoint.url': 'mongodb://localhost/ethlog_example',
    'backup_bsc_endpoints': [],
    'pool_address': '0x58f876857a02d6762e0101bb5c46a8c1ed44dc16',
    'begin_block_number': 6810708,
    'host': '127.0.0.1',
    'port': 8080
}

class Configuration {
    /**
     * Initialize by: {@link Configuration.fromFile}.
     *
     * @param {object} values
     * @param {MongodbEndpoint} values.mongodbEndpoint
     * @param {Array<EthEndpoint>} values.mainBscEndpoints
     * @param {Array<EthEndpoint>} values.backupBscEndpoints
     * @param {Address} values.poolAddress
     * @param {UInt64} values.beginBlockNumber
     * @param {string} values.host
     * @param {UInt16} values.port
     */
    constructor(values) {
        this.mongodbEndpoint = values.mongodbEndpoint
        this.mainBscEndpoints = values.mainBscEndpoints
        this.backupBscEndpoints = values.backupBscEndpoints
        this.poolAddress = values.poolAddress
        this.beginBlockNumber = values.beginBlockNumber
        this.host = values.host
        this.port = values.port
    }

    /**
     *
     * @param {string} filePath
     * @return {Result<LoadingError, Configuration>}
     * @throws {LoadingError}
     */
    static fromFile(filePath) {
        let r1 = Configuration._loadFile(filePath)
        if (r1.error) {
            return r1
        }
        let r2 = Configuration._fromFileData(r1.data)
        if (r2.error) {
            return Result.loadingError(r2.error.message, filePath)
        }
        return Result.ok(r2.data)
    }

    /**
     *
     * @param {string} filePath
     * @return {Result<LoadingError, object>}
     * @throws {Error}
     */
    static _loadFile(filePath) {
        try {
            let values = loadConfigFile({
                identity: 'ethlog_example',
                filePath: filePath,
                schema: schema,
                defaultValues: defaultValues,
                filePermission: 0o600
            })
            return Result.ok(values)
        }
        catch (error) {
            if (error instanceof LoadingError) {
                return Result.error(error)
            }
            throw error
        }
    }

    /**
     *
     * @param {object} data
     * @param {object} data.mongodb_endpoint
     * @param {Array<object>} data.main_bsc_endpoints
     * @param {Array<object>} data.backup_bsc_endpoints
     * @param {string} data.pool_address
     * @param {object} data.begin_block_number
     * @param {string} data.host
     * @param {number} data.port
     * @return {Configuration}
     */
    static _fromFileData(data) {
        let r1 = validateObject(data)
        if (r1.error) {
            return r1
        }
        let r2 = mapObject(data, [
            [
                'mongodb_endpoint', Configuration._makeMongodbEndpoint,
                'mongodbEndpoint'
            ],
            [
                'main_bsc_endpoints', Configuration._makeBscEndpoints,
                'mainBscEndpoints'
            ],
            [
                'backup_bsc_endpoints', Configuration._makeBscEndpoints,
                'backupBscEndpoints'
            ],
            ['pool_address', Address.fromHeximal, 'poolAddress'],
            ['begin_block_number', UInt64.fromNumber, 'beginBlockNumber'],
            ['host', v => Result.ok(v)],
            ['port', UInt16.fromNumber]
        ])
        if (r2.error) {
            return r2
        }
        if (r2.data.mainBscEndpoints.length <= 0) {
            return Result.typeError('mainBscEdnpoints: expect an item at least')
        }
        let config = new Configuration(r2.data)
        return Result.ok(config)
    }

    /**
     *
     * @param {object} value
     * @return {Result<TypeError, MongodbEndpoint>}
     */
    static _makeMongodbEndpoint(value) {
        return MongodbEndpoint.create({
            url: value['url'],
            username: value['username'],
            password: value['password']
        })
    }

    /**
     *
     * @param {object} value - List of endpoints.
     * @return {Result<TypeError, Array<EthEndpoint>>}
     */
    static _makeBscEndpoints(value) {
        return mapArray(value, Configuration._makeBscEndpoint)
    }

    /**
     *
     * @param {object} value
     * @return {Result<TypeError, EthEndpoint>}
     */
    static _makeBscEndpoint(value) {
        let r1 = mapObject(value, [
            ['url', HttpUrl.fromString],
            ['username', v => Result.ok(v)],
            ['password', v => Result.ok(v)],
            ['quota', Configuration._makeEndpointQuota, 'quota'],
            ['log_safe_gap', v => UInt64.fromNumber(v || 15), 'logSafeGap'],
            [
                'log_range_boundary',
                v => UInt64.fromNumber(v || 5000), 'logRangeBoundary'
            ],
            [
                'log_size_border',
                v => DataSize.fromBytes(v || 4194304), 'logSizeBorder'
            ],
            [
                'log_time_border',
                v => Timespan.fromMiliseconds(v || 6000), 'logTimeBorder'
            ],
            [
                'log_quantity_border',
                v => UInt64.fromNumber(v || 10000), 'logQuantityBorder'
            ]
        ])
        if (r1.error) {
            return r1
        }
        return EthEndpoint.create(r1.data)
    }

    /**
     *
     * @param {object} value
     * @return {Result<TypeError, EndpointQuota>}
     */
    static _makeEndpointQuota(value = {}) {
        let r1 = mapObject(value, [
            ['batch_limit', v => UInt.fromNumber(v || 200), 'batchLimit'],
            [
                'batch_timespan',
                v => Timespan.fromMiliseconds(v || 60000), 'batchTimespan'
            ]
        ])
        if (r1.error) {
            return r1
        }
        let {batchLimit, batchTimespan} = r1.data
        return EndpointQuota.create({batchLimit, batchTimespan})
    }
}

module.exports = {
    Configuration
}
