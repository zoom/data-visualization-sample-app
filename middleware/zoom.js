"use strict";

const express = require('express');

/**
 * Simple middleware which requires ZOOM_CLIENT_ID
 * and ZOOM_SECRET_KEY to be set before continuing
 *
 * @param options
 * @returns {Function}
 * @constructor
 */
let ZoomMiddleware = function(options) {
    let tmpClientID = ('development' === process.env.APP_MODE)
        ? process.env.ZOOM_DEV_CLIENT_ID
        : process.env.ZOOM_CLIENT_ID
        ;
    let tmpClientSecret = ('development' === process.env.APP_MODE)
        ? process.env.ZOOM_DEV_CLIENT_SECRET
        : process.env.ZOOM_CLIENT_SECRET
        ;

    let signature = "Basic " + new Buffer(tmpClientID + ':' + tmpClientSecret).toString('base64');

    let clientId = options.client_id || tmpClientID;
    let secretKey = options.secret_key || tmpClientSecret;

    return function(req, res, next) {
        console.log('inside the Zoom Middelware');
        if (!clientId) {
            throw "Client ID must be defined";
        }

        if (!secretKey) {
            throw "Secret Key must be defined";
        }

        req.app.clientId = clientId;
        req.app.clientSecret = secretKey;
        req.app.signature = signature;

        next();
    };
};

module.exports = ZoomMiddleware;
