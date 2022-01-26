'use strict'

/**
 * Start HTTP API server.
 *
 * @file
 */

const {log} = require('stdio_log')
const {LoadingError} = require('@trop/seed')
const {startFromConfigurationFile} = require('../lib_api')

async function main() {
    let filePath = getConfigurationFile()
    try {
        await startFromConfigurationFile(filePath)
    }
    catch (error) {
        if (error instanceof LoadingError) {
            log.error(
                'load configuration file:',
                error.message + '; ',
                JSON.stringify(error.labels) + '; ',
                error.filePath || ''
            )
            return
        }
        throw error
    }
}

/**
 *
 * @return {string | undefined} - Path to configuration file.
 */
function getConfigurationFile() {
    if (process.argv.length <= 3) {
        return process.argv[2]
    }
    log.error(`bad command, hint: ${process.argv[1]} [CONFIG_FILE]`)
    process.exit(1)
}

main().catch(error => {
    log.error(error)
    process.exit(1)
})
