"use strict";

const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const request = require('request');
const querystring = require('querystring');

const getZoomAuthBase = () => {
    let zoomAuthBaseURL = ('production' === process.env.NODE_ENV)
        ? process.env.ZOOM_AUTH_BASE_URL
        : process.env.ZOOM_DEV_AUTH_BASE_URL
        ;
    return zoomAuthBaseURL;
};

/**
 * Initial OAuth endpoint as specified in Zoom Marketplace -> Manage -> {{App}}
 */
router.get('/phase-one', function(req, res) {
    console.log(`\nPhase one of redirect has been initiated\n`);

    const zoomAuthBaseURL = getZoomAuthBase();
    const zoomAuthorizeURL = `${zoomAuthBaseURL}/oauth/authorize`;
    const clientId = req.app.clientId;
    const clientSecret = req.app.clientSecret;
    const oauthState = process.env.AUTH_STATE;

    // if we've reached this point, that means we're set. make a request to start the authorization process
    let phaseTwoLink = `https://${req.headers.host}/oauth/phase-two`;
    let callbackParams = {
        client_id: clientId,
        redirect_uri: phaseTwoLink,
        response_type: 'code',
        state: oauthState
    };
    let paramsString = querystring.stringify(callbackParams);
    let redirectUrl = `${zoomAuthorizeURL}?${paramsString}`;

    /*
    if(req.query.version) {
        redirectUrl += `&version=${req.query.version}`;
    }
    */

    res.redirect(redirectUrl);
});

/**
 * Secondary OAuth endpoint as specified by `phaseTwoLink` in the phase one endpoint
 */
router.get('/phase-two', function(req, res, next) {
    console.log(`\nPhase two of redirect has been initiated\n`);

    // Make certain we are receiving requests from valid sources
    if(!req.query.state || req.query.state !== process.env.AUTH_STATE) {
        console.log('request did not originate from our server');
        return res.status(401).send('Cannot verify request origin, will not proceed');
    }

    // Make certain we have what we need to proceed
    if(!req.query.code) {
        console.log('Missing required `code` query param');
        return res.status(400).send('Missing required `code` query param');
    }

    const zoomAuthBaseURL = getZoomAuthBase();
    const zoomTokenEndpoint = `${zoomAuthBaseURL}/oauth/token`;
    const clientId = req.app.clientId;
    const clientSecret = req.app.clientSecret;
    const authorizationCode = req.query.code;

    let accessToken;
    let basicAuthKeys = clientId + ':' + clientSecret;
    let authBuf = Buffer.from(basicAuthKeys, 'ascii');
    let basicAuthHeaderString = `Basic ${authBuf.toString('base64')}`;
    console.log('Basic Auth Header String: ', basicAuthHeaderString);
    let requestOpts = {
        method: 'POST',
        url: `${zoomTokenEndpoint}`,
        headers: {
            Authorization: basicAuthHeaderString,
            Accept: `application/json`
        },
        qs: {
            grant_type: `authorization_code`,
            code: `${authorizationCode}`,
            redirect_uri: `https://${req.headers.host}/oauth/phase-two`
        },
        useQuerystring: true,
        json: true
    };

    // we have our authorization code, now make a request to exchange it for a valid access_token.
    // TODO Improve this to use promises
    console.log(`Requesting the access_token`);
    request(requestOpts, function(error, response, body) {
        if (error) {
            console.error(`\nPhase two failure: ${error}`);
            return res.status(500).send(error);
        } else {
            // we should have an access and refresh token. store them securely
            console.log('Token Response Body: ', body);

            // TODO This is only temporary and SHOULD NOT be used in a production environment, these should be stored in the DB.installations
            req.app.token = body.access_token;
            req.app.tokenType = body.token_type;
            req.app.refresh = body.refresh_token;
            req.app.expiresIn = body.expires_in;
            req.app.tokenScope = body.scope;

            // TODO DELETE THIS ONCE DEVELOPMENT IS COMPLETE
            console.log(`\nAccess token: ${body.access_token}`);
            console.log(`\nAccess token type: ${body.token_type}`);
            console.log(`\nRefresh token: ${body.refresh_token}`);
            console.log(`\nAccess token expires_in: ${body.expires_in}`);
            console.log(`\nAccess token scope: ${body.scope}`);

            console.log(`Now we are ready to access the API!!!`);
            // TODO Need to complete this or refactor it, just a placeholder for now...
            res.render('configure', {
                appDisplayName: process.env.APP_DISPLAY_NAME
            });
        }
    });
});

/**
 * @type Express.Router
 */
module.exports = router;
