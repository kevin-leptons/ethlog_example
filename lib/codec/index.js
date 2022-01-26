'use strict'

const {Codec} = require('ethlog')

const pancakePoolV2Codec = new Codec(
    require('./pancake_pool_v2_abi.json')
)

module.exports = {
    pancakePoolV2Codec
}
