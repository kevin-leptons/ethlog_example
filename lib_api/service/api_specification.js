'use strict'

const path = require('path')
const SwaggerParser = require('swagger-parser')
const npmPackage = require('../../package.json')

class ApiSpecification {
    /**
     * @return {object}
     */
    get openApiV3() {
        return this._specification
    }

    /**
     * Initialize by {@link ApiSpecification.open}.
     *
     * @param {object} specification
     */
    constructor(specification) {
        this._specification = specification
    }

    /**
     * @return {Promise<ApiSpecification>}
     */
    static async open() {
        let filePath = path.join(
            __dirname, '..', 'api_specification', 'index.json'
        )
        let specification = await SwaggerParser.validate(filePath, {
            parse: {
                json: true
            }
        })
        specification.info.title = npmPackage.name
        specification.info.version = npmPackage.version
        specification.info.description = npmPackage.description
        return new ApiSpecification(specification)
    }
}

module.exports = {
    ApiSpecification
}
