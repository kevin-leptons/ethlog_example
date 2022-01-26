'use strict'

const express = require('express')
const {log} = require('stdio_log')
const {Configuration} = require('../lib/configuration')
const controller = require('./controller')
const Container = require('./container')
const {
    requestLogMiddleware,
    serviceContainerMiddleware,
    allOriginMiddleware,
    errorHandleMiddleware,
    routerNotFoundMiddleware
} = require('./middleware')

/**
 * Start server from a configuration file.
 *
 * @param {string} filePath
 * @return {Promise<undefined>}
 */
async function startFromConfigurationFile(filePath) {
    let config = Configuration.fromFile(filePath).open()
    let container = await Container.open(config)
    let {host, port} = config
    let app = express()
    app.use(allOriginMiddleware())
    app.use(
        serviceContainerMiddleware(container)
    )
    app.use(requestLogMiddleware)
    app.use(controller)
    app.use(errorHandleMiddleware)
    app.use(routerNotFoundMiddleware)
    app.listen(
        port.value, host,
        () => log.info(`online http://${host}:${port.value}`)
    )
}

module.exports = {
    startFromConfigurationFile
}
