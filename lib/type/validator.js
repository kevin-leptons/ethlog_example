'use strict'

const mongodb = require('mongodb')
const {Result, validateInstance} = require('minitype')

/**
 *
 * @param {any} value
 * @return {boolean}
 */
function isBigNumber(value) {
    return value && value.constructor.name === 'BigNumber'
}

/**
 *
 * @param {mongodb.Binary} value
 * @return {Result<TypeError, undefined>}
 */
function validateMongodbBinaryByteArray(value) {
    let r1 = validateInstance(value, mongodb.Binary)
    if (r1.error) {
        return r1
    }
    if (value.sub_type !== mongodb.Binary.SUBTYPE_BYTE_ARRAY) {
        return Result.typeError('expect mongodb SUBTYPE_BYTE_ARRAY')
    }
    return Result.ok()
}

module.exports = {
    isBigNumber,
    validateMongodbBinaryByteArray
}
