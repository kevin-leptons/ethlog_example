'use strict'

/* eslint-disable no-unused-vars */

const {log} = require('stdio_log')
const cors = require('cors')
const {Container} = require('./container')

/**
 *
 * @param {object} req
 * @param {object} res
 * @param {Function} next
 */
function requestLogMiddleware(req, res, next) {
    log.info(req.method, req.path)
    next()
}

/**
 *
 * @param {Container} serviceContainer
 * @return {Function}
 */
function serviceContainerMiddleware(serviceContainer) {
    return function(req, _res, next) {
        req.container = serviceContainer
        next()
    }
}

/**
 * Create a middleware that allows accessing frol all origins.
 *
 * @return {Function}
 */
function allOriginMiddleware() {
    return cors({
        origin: '*'
    })
}

/**
 *
 * @param {any} err
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @return {undefined}
 */
function errorHandleMiddleware(err, req, res, next) {
    log.error(err)
    res.status(500).json({
        message: 'internal error'
    })
}

/**
 *
 * @param {object} req
 * @param {object} res
 * @param {Function} next
 */
function routerNotFoundMiddleware(req, res, next) {
    res.status(404).json({
        message: 'no matched resource'
    })
}

module.exports = {
    requestLogMiddleware,
    serviceContainerMiddleware,
    allOriginMiddleware,
    errorHandleMiddleware,
    routerNotFoundMiddleware
}
