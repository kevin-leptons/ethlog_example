'use strict'

const {Configuration} = require('../lib/configuration')
const Container = require('./container')

/**
 *
 * @param {string} filePath
 * @return {Promise}
 */
async function startFromConfigurationFile(filePath) {
    let config = Configuration.fromFile(filePath).open()
    let container = await Container.open(config)
    await container.mainService.start()
}

module.exports = {
    startFromConfigurationFile
}
