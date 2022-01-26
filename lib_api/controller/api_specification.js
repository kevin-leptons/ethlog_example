'use strict'

const {Router} = require('express')
const swaggerUiExpress = require('swagger-ui-express')
const npmPackage = require('../../package.json')

/* eslint-disable-next-line new-cap */
let router = Router()
let options = {
    customSiteTitle: npmPackage.name
}
router.use('/', (req, res, next) => {
    req.swaggerDoc = req.container.apiSpecification.openApiV3
    req.swaggerDoc.host = req.get('host')
    next()
})
router.use('/', swaggerUiExpress.serve)
router.get('/', swaggerUiExpress.setup(undefined, options))

module.exports = router

