"use strict";

/**
 * Zoom Client.
 *
 * Module used to send/receive requests with the Zoom API
 *
 * Copyright (c) 2018 Zoom Video Communications
 * @link https://devdocs.zoom.us/api-reference/zoom-api
 * @author Benjamin Dean <ben.dean@zoom.us>
 * @since 0.1.0
 * @requires querystring
 * @requires request
 */

const clone         = require('lodash.clone');
const helpers       = require('./helpers');
const isPlainObject = require('lodash.isplainobject');
const request       = require('request');
const querystring   = require('querystring');
const version       = require('../package.json').version;
const ZoomAuth      = require('./zoomAuth');

const ZoomClient {
	/**
	 * Constuctor of Zoom Client object
	 * @constructor
	 * @param {ZoomAuth|Object} options.auth - Instance of Zoom Auth or object used to initialise Zoom Auth Object
	 * @param {string} options.origin - endpoint to send api requests to
	 * @param {Object} options.headers - heads to merge onto all requests
	 */
    constructor (options) {
        const authOptions = (options && options.auth) || {};

        // Use Zoom Auth instance if applicable
        if(authOptions instanceOf ZoomAuth) {
            this.AuthClient = authOptions;
        } else {
            try {
                this.AuthClient = new ZoomAuth(authOptions);
            } catch (e) {
                console.error(e);
                throw e;
            }
        }
    }

    this.version = version;
    this.origin = options.origin || options.restEndpoint || ZoomClient.getZoomApiEndpoint();
    this.defaultHeaders = Object.assign(
        {
            'User-Agent':   `node-zoom/${this.version}`,
            'Content-Type': `application/json`,
            'Accept':       `application/json`
        },
        options.headers
    );

	/**
     * apiRequest.
     *
	 * Method that makes the api request
     *
	 * @param {Object} options - request modules options. see https://github.com/request/request#requestoptions-callback
	 * @param {boolean} options.auth.force - force the retrieval of a new access token
	 * @param {Object} options.retry - object of headers to add to this individual request
	 * @param {function} callback - callback to give results to. if not specified promise will be returned
	 * @returns {?Promise}
	 */
	apiRequest(options, callback) {
        if(!isPlainObject(options)) {
            throw new TypeError('options argument is required');
        }

        if('function' === typeof callback) {
            return this._processRequest(options, callback);
        }

        return new Promise((resolve, reject) => {
            this._processRequest(options, (err, response) => {
                if(err) {
                    return reject(err);
                }
                resolve(response);
            });
        });
    }

    _processRequest(options, callback) {
        this.AuthClient.getAccessToken(clone(options.auth))
            .then(tokenInfo => {
                if(!tokenInfo.accessToken) {
                    let error = new Error('No access token');
                    error.res = tokenInfo;

                    return Promise.reject(error);
                }
                return tokenInfo;
            })
            .then(tokenInfo => {
                let retry = options.retry || false;
                const consolidatedOpts  = {};
                const authOptions       = clone(options.auth);
                const headers           = options.headers;

                options.uri = helpers.resolveUri(this.origin, options.uri);
                options.headers = Object.assign({}, this.defaultHeaders, options.headers, {
                    // During retry, auth header is removed, this only adds passed in if it is not a retry
                    Authorization: (headers && headers.Authorization) || `Bearer ${tokenInfo.accessToken}`
                });

                delete options.retry;
                delete options.auth;

                consolidatedOpts.req            = options;
                consolidatedOpts.auth           = authOptions;
                consolidatedOpts.accessToken    = tokenInfo.accessToken;
                consolidatedOpts.retry          = retry;

                this._makeRequest(consolidatedOpts, callback);
            })
            .catch(e => {
                callback(err, null);
            });
    }

    _makeRequest(consolidatedOpts, callback) {
        const requestOpts = consolidatedOpts.req;

        request(requestOpts, (error, response, body) => {
            let parsedBody;
            let isResponseJson;

            if(error) {
                callback(err, null);
                return;
            }

            // Check if we should retry the request
            if(helpers.isValid401(res) && consolidatedOpts.retry) {
                this.AuthClient.invalidateToken(consolidatedOpts.accessToken);
                const retryOpts = Object.assign({}, requestOptions, {
                    auth: consolidatedOpts.auth,
                    retry: false,
                    headers: Object.assign({}, requestOptions.headers, {
                        Authorization: null
                    })
                });
                this.apiRequest(retryOptions, callback);
                return;
            }

            isResponseJson = 
                response.headers['content-type'] &&
                'application/json' === response.headers['content-type'].split(';')[0].toLowerCase();

            if(!isResponseJson) {
                callback(new Error('API did not return JSON'), null);
                return;
            }

            // Attempt to parse body
            try {
                parsedBody = JSON.parse(body);
            } catch(e) {
                parsedBody = body;
            }

            callback(null, {
                res: response,
                body: parsedBody
            });
        });
    }

	/**
	 * Method that makes the GET api request
	 * @param {Object} options - request modules options. see https://github.com/request/request#requestoptions-callback
	 * @param {Object} options.auth - force the retrieval of a new access token
	 * @param {boolean} options.auth.force - force the retrieval of a new access token
	 * @param {boolean} [options.retry=true] - force a retry if request fails due to token expiration
	 * @param {function} callback - callback to give results to. if not specified promise will be returned
	 * @returns {?Promise}
	 */
	get(options, callback) {
		options.method = 'GET';
		options.retry = true;

		return this.apiRequest(options, callback);
	}
	/**
	 * Method that makes the POST api request
	 * @param {Object} options - request modules options. see https://github.com/request/request#requestoptions-callback
	 * @param {boolean} options.auth.force - force the retrieval of a new access token
	 * @param {boolean} [options.retry=true] - force a retry if request fails due to token expiration
	 * @param {function} callback - callback to give results to. if not specified promise will be returned
	 * @returns {?Promise}
	 */
	post(options, callback) {
		options.method = 'POST';
		options.retry = true;

		return this.apiRequest(options, callback);
	}
	/**
	 * Method that makes the PUT api request
	 * @param {Object} options - request modules options. see https://github.com/request/request#requestoptions-callback
	 * @param {boolean} options.auth.force - force the retrieval of a new access token
	 * @param {boolean} [options.retry=true] - force a retry if request fails due to token expiration
	 * @param {function} callback - callback to give results to. if not specified promise will be returned
	 * @returns {?Promise}
	 */
	put(options, callback) {
		options.method = 'PUT';
		options.retry = true;

		return this.apiRequest(options, callback);
	}
	/**
	 * Method that makes the PATCH api request
	 * @param {Object} options - request modules options. see https://github.com/request/request#requestoptions-callback
	 * @param {boolean} options.auth.force - force the retrieval of a new access token
	 * @param {boolean} [options.retry=true] - force a retry if request fails due to token expiration
	 * @param {function} callback - callback to give results to. if not specified promise will be returned
	 * @returns {?Promise}
	 */
	patch(options, callback) {
		options.method = 'PATCH';
		options.retry = true;

		return this.apiRequest(options, callback);
	}
	/**
	 * Method that makes the DELETE api request
	 * @param {Object} options - request modules options. see https://github.com/request/request#requestoptions-callback
	 * @param {boolean} options.auth.force - force the retrieval of a new access token
	 * @param {boolean} [options.retry=true] - force a retry if request fails due to token expiration
	 * @param {function} callback - callback to give results to. if not specified promise will be returned
	 * @returns {?Promise}
	 */
	delete(options, callback) {
		options.method = 'DELETE';
		options.retry = true;

		return this.apiRequest(options, callback);
	}

    static getZoomApiEndpoint () {
        let zoomApiEndpoint = ('production' === process.env.NODE_ENV)
            ? process.env.ZOOM_PROD_API_ENDPOINT
            : process.env.ZOOM_DEV_API_ENDPOINT
            ;
        return zoomApiEndpoint;
    }
}

module.exports = ZoomClient;
