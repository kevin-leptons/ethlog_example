'use strict'

const {Router} = require('express')

/* eslint-disable-next-line new-cap */
let router = Router()
router.use('/', require('./api_specification'))
router.use('/pool_event', require('./pool_event'))

module.exports = router
