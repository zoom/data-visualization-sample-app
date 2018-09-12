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
    let clientId = options.client_id || process.env.ZOOM_CLIENT_ID;
    let secretKey = options.secret_key || process.env.ZOOM_CLIENT_SECRET;

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

        next();
    };
};

module.exports = ZoomMiddleware;
