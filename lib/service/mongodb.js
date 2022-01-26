'use strict'

const {Result, validateInstance, validateInstanceMap} = require('minitype')
const {MongoClient, Db, Collection} = require('mongodb')

/**
 * Represent for a Mongodb Endpoint, include URL that refers to Mongdb server,
 * database, authentication such as username and password.
 */
class MongodbEndpoint {
    /**
     * @type {URL}
     */
    get url() {
        return this._url
    }

    /**
     * @type {string}
     */
    get databaseName() {
        return this._databaseName
    }

    /**
     * @type {string}
     */
    get username() {
        return this._username
    }

    /**
     * @type {string}
     */
    get password() {
        return this._password
    }

    /**
     * Initialize by: {@link MongodbEndpoint.create}.
     *
     * @param {object} config
     * @param {string} config.url
     * @param {string} config.databaseName
     * @param {string} [config.username]
     * @param {string} [config.password]
     */
    constructor(config) {
        this._url = config.url
        this._username = config.username
        this._password = config.password
    }

    /**
     *
     * @param {object} config
     * @param {string} config.url
     * @param {string} config.username
     * @param {string} config.password
     * @return {Result<TypeError, MongodbEndpoint>}
     */
    static create(config) {
        let r1 = validateInstanceMap(config, [
            ['url', 'string'],
            ['username', 'string', true],
            ['password', 'string', true]

        ])
        if (r1.error) {
            return r1
        }
        let r2 = MongodbEndpoint._parseMongodbUrl(config.url)
        if (r2.error) {
            return Result.typeError(`url: ${r2.error.message}`)
        }
        let {data: url} = r2
        let r3 = MongodbEndpoint._getDatabaseName(url)
        if (r3.error) {
            return Result.typeError(`url: ${r3.error.message}`)
        }
        let {data: databaseName} = r3
        let {username, password} = config
        let data = new MongodbEndpoint({url, databaseName, username, password})
        return Result.ok(data)
    }

    /**
     *
     * @param {string} value
     * @return {Result<TypeError, URL>}
     */
    static _parseMongodbUrl(value) {
        try {
            let url = new URL(value)
            if (url.protocol !== 'mongodb:') {
                return Result.typeError('expect protocol mongodb')
            }
            if (url.username || url.password) {
                return Result.typeError('expect no username or password')
            }
            return Result.ok(url)
        }
        catch {
            return Result.typeError('expect a URL')
        }
    }

    /**
     *
     * @param {URL} url
     * @return {Result<TypeError, string>}
     */
    static _getDatabaseName(url) {
        let name = url.pathname.substring(1)
        let index = name.indexOf('/')
        if (index === 0) {
            return Result.typeError('expect no slash before database name')
        }
        else if (index > 0) {
            return Result.typeError('expect no slash after database name')
        }
        else if (name.length === 0) {
            return Result.typeError('expect database name')
        }
        return Result.ok(name)
    }
}

/**
 * Provide ready-to-use collections.
 */
class MongodbService {
    /**
     * @type {Collection}
     */
    get settingCollection() {
        return this._settingCollection
    }

    /**
     * @type {Collection}
     */
    get poolEventCollection() {
        return this._poolEventCollection
    }

    /**
     * Initialize by {@link MongodbService.open}.
     *
     * @param {MongoClient} mongoClient
     * @param {string} databaseName
     */
    constructor(mongoClient, databaseName) {
        this._client = mongoClient
        let db = this._client.db(databaseName)
        this._settingCollection = db.collection('setting')
        this._poolEventCollection = db.collection('pool_event')
    }

    async close() {
        await this._client.close()
    }

    /**
     *
     * @param {MongodbEndpoint} endpoint
     * @return {Promise<MongoClient>}
     */
    static async open(endpoint) {
        validateInstance(endpoint, MongodbEndpoint).open()
        let options = {}
        if (endpoint.username || endpoint.password) {
            options.auth = {
                username: endpoint.username,
                password: endpoint.password
            }
        }
        let client = await MongoClient.connect(endpoint.url.href, options)
        let database = client.db(endpoint.databaseName)
        await MongodbService._createIndexes(database)
        return new MongodbService(client, endpoint.databaseName)
    }

    /**
     * @private
     * @param {Db} database
     * @return {Promise}
     */
    static async _createIndexes(database) {
        let settingCollection = database.collection('setting')
        await settingCollection.createIndex({'key': 1}, {unique: true})
        let poolEventCollection = database.collection('pool_event')
        await poolEventCollection.createIndex(
            {'block_number': 1, 'transaction_index': 1, 'log_index': 1},
            {unique: true}
        )
    }
}

module.exports = {
    MongodbEndpoint,
    MongodbService
}
