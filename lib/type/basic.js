'use strict'

const mongodb = require('mongodb')
const {
    UInt16, UInt64, UInt256, Timestamp, Address, ByteData32
} = require('ethlog')
const {Result, UInt32, PInt, PInt64, validateInstance} = require('minitype')
const {LoadingError} = require('@trop/seed')
const {validateMongodbBinaryByteArray} = require('./validator')

Result.loadingError = function(message, filePath, labels = {}) {
    let error = new LoadingError(message, filePath, labels)
    return Result.error(error)
}
/**
 * @return {mongodb.Long}
 */
UInt16.prototype.toMongodbType = function() {
    return new mongodb.Int32(this._value)
}
/**
 *
 * @param {number} value
 * @return {Result<TypeError, UInt16>}
 */
UInt16.fromMongodbType = function(value) {
    return UInt16.fromNumber(value)
}
/**
 * @return {mongodb.Binary}
 */
UInt64.prototype.toMongodbType = function() {
    let heximal = this._value.toString(16)
    let buffer = Buffer.from(heximal, 'hex')
    return new mongodb.Binary(buffer, mongodb.Binary.SUBTYPE_BYTE_ARRAY)
}
/**
 *
 * @param {mongodb.Binary} value
 * @return {Result<UInt64>}
 */
UInt64.fromMongodbType = function(value) {
    let r1 = validateInstance(value, mongodb.Binary)
    if (r1.error) {
        return r1
    }
    if (value.sub_type !== mongodb.Binary.SUBTYPE_BYTE_ARRAY) {
        return Result.typeError('expect SUBTYPE_BYTE_ARRAY')
    }
    let heximal = '0x' + value.buffer.toString('hex')
    return UInt64.fromHeximal(heximal)
}
/**
 * @return {mongodb.Binary} As `SUBTYPE_BYTE_ARRAY`.
 */
Address.prototype.toMongodbType = function() {
    return new mongodb.Binary(this._value, mongodb.Binary.SUBTYPE_BYTE_ARRAY)
}
/**
 *
 * @param {mongodb.Binary} value
 * @return {Result<TypeError, Address>}
 */
Address.fromMongodbType = function(value) {
    let r1 = validateInstance(value, mongodb.Binary)
    if (r1.error) {
        return r1
    }
    if (value.sub_type !== mongodb.Binary.SUBTYPE_BYTE_ARRAY) {
        return Result.typeError('expect SUBTYPE_BYTE_ARRAY')
    }
    return Address.fromBuffer(value.buffer)
}
/**
 *
 * @return {mongodb.Binary}
 */
ByteData32.prototype.toMongodbType = function() {
    return new mongodb.Binary(this._value, mongodb.Binary.SUBTYPE_BYTE_ARRAY)
}
/**
 * @param {mongodb.Binary} value
 * @return {Result<TypeError, ByteData32>}
 */
ByteData32.fromMongodbType = function(value) {
    let r1 = validateMongodbBinaryByteArray(value)
    if (r1.error) {
        return r1
    }
    return ByteData32.fromBuffer(value.buffer)
}
/**
 * @return {mongodb.Binary}
 */
UInt256.prototype.toMongodbType = function() {
    let heximal = this._value.toString(16)
    let buffer = Buffer.from(heximal, 'hex')
    return new mongodb.Binary(buffer, mongodb.Binary.SUBTYPE_BYTE_ARRAY)
}
/**
 *
 * @param {mongodb.Binary} value
 * @return {Result<TypeError, UInt256>}
 */
UInt256.fromMongodbType = function(value) {
    let r1 = validateMongodbBinaryByteArray(value)
    if (r1.error) {
        return r1
    }
    let heximal = '0x' + value.buffer.toString('hex')
    return UInt256.fromHeximal(heximal)
}

module.exports = {
    Result,
    UInt16,
    UInt32,
    UInt64,
    UInt256,
    PInt,
    PInt64,
    Timestamp,
    Address,
    ByteData32
}
