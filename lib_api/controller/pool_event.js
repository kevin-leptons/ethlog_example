'use strict'

const Router = require('@trop/async_router')
const {
    GetPoolEventRequest,
    GetPoolEventResponse
} = require('../type/get_pool_event')

let router = new Router()
/**
 * Retrieve lastest page of pool events.
 */
router.get('/', async(req, res) => {
    let r1 = GetPoolEventRequest.fromRequest(req)
    if (r1.error) {
        res.status(400).json({error: r1.error.message})
        return
    }
    let {data: validRequest} = r1
    let events = await req.container.dbPoolEvent.find(validRequest.page)
    let validResponse = GetPoolEventResponse.fromEvents(events).open()
    res.json(validResponse.value)
})

module.exports = router.express
