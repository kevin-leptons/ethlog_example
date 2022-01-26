'use strict'

const Router = require('@trop/async_router')

let router = new Router()
router.get('/', (req, res) => {
    res.json('ok')
})

module.exports = router.express
