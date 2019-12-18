"use strict";

/**
 * Zoom OAuth2 Router.
 *
 * An Express.js Router module used to obtain, refresh, and revoke tokens for the Zoom API
 *
 * @link https://devdocs.zoom.us/docs/authorization/oauth-with-zoom
 * @file http://expressjs.com/en/4x/api.html#router
 * @author Benjamin Dean <ben.dean@zoom.us>
 * @since 0.1.0
 * @requires moment
 * @requires router
 * @requires request
 * @requires querystring
 * @requires ../models/auth.model
 */

const moment        = require('moment');
const router        = require('express').Router();
const request       = require('request');
const querystring   = require('querystring');
const Auth          = require('../models/auth.model');

/**
 * getZoomAuthBase.
 *
 * @private
 *
 * @return {string} Appropriate URL for either Development or Production Auth Endpoint
 */
const getZoomAuthBase = () => {
    let zoomAuthBaseURL = ('production' === process.env.NODE_ENV)
        ? process.env.ZOOM_AUTH_BASE_URL
        : process.env.ZOOM_AUTH_BASE_URL
        //: process.env.ZOOM_DEV_AUTH_BASE_URL
        ;
    return zoomAuthBaseURL;
};

/**
 * refreshToken.
 *
 * OAuth2 Refresh Flow Handler
 *
 * @private
 *
 * @param       {string} refresh_token    Active refresh_token
 * @param       {string} client_id        Client ID for the respective app
 * @param       {string} client_secret    Client Secret for the respective app
 * @param       {string} redirect_uri     The redirect URI for the app
 * @callback    {function} cb          Uses CJS format args: err, body (err === null, is a successful callback), body is described in "@return" below
 * @return      {object} Zoom API Tokens The access_token used to make ZOOM API requests, and the refresh_token to obtain new access_tokens
 * @todo        Improve to use Promises instead of callback
 * @todo        Remove console.logs before publishing
 * @todo        Refactor to use DB and store/cache tokens for use/reference/update accordingly
 * @todo        Build a static utility method/module and implement `checkExpiration()` which should be called prior to executing any API request (and to queue that request if the token is actively being refreshed or is within the expiration-refresh-threshold)
 * @todo        Create a Worker Process to handle calling refreshToken(...) when needed (show developers best practices for refresh token strategies)
 * @todo        Handle errors accordingly and notify users when there are errors which will impact their experience or their data (give them action items and contact info if they have questions)
 * @todo        DRY this out (phase-two and refreshToken have nearly identical implementations)
 */
const refreshToken = (refresh_token, redirect_uri, client_id = process.env.ZOOM_CLIENT_ID, client_secret = process.env.ZOOM_CLIENT_SECRET, cb) => {
    const zoomAuthBaseURL = getZoomAuthBase();
    const zoomTokenEndpoint = `${zoomAuthBaseURL}/oauth/token`; // Note: Refresh uses the same route as the 2nd phase of Authorization Flow to obtain an access_token

    let accessToken;
    let basicAuthKeys = clientId + ':' + clientSecret;
    let authBuf = Buffer.from(basicAuthKeys, 'ascii');
    let basicAuthHeaderString = `Basic ${authBuf.toString('base64')}`;
    // Only for instructional purposes, do not use the following in production, refresh tokens should be retrieved for a specific user/account from DB.installations
    let activeRefreshToken = req.app.refresh_token; // We cached this in phase-two of the Authorization Flow for demonstration purposes
    //console.log('Basic Auth Header String: ', basicAuthHeaderString);
    let requestOpts = {
        method: 'POST',
        url: `${zoomTokenEndpoint}`,
        headers: {
            Authorization: basicAuthHeaderString,
            Accept: `application/json`
        },
        qs: {
            grant_type: `refresh_token`,
            refresh_token: `${activeRefreshToken}`,
            redirect_uri: `https://${req.headers.host}/oauth/phase-two`
        },
        useQuerystring: true,
        json: true
    };

    // we have our authorization code, now make a request to exchange it for a valid access_token.
    console.log(`Requesting a refreshed access_token`);
    request(requestOpts, function(error, response, body) {
        if (error) {
            console.error(`\nRefresh Flow failure: ${error}`);
            //return res.status(500).send(error);
            cb(error, body); // TODO Improve this and handle these errors accordingly (retry the refresh, notify user, etc...)
        } else {
            // we should have an access and refresh token. store them securely
            console.log('Refresh Token Response Body: ', body);

            // TODO DELETE THIS ONCE DEVELOPMENT IS COMPLETE
            console.log(`\nAccess token: ${body.access_token}`);
            console.log(`\nAccess token type: ${body.token_type}`);
            console.log(`\nRefresh token: ${body.refresh_token}`);
            console.log(`\nAccess token expires_in: ${body.expires_in}`);
            console.log(`\nAccess token scope: ${body.scope}`);

            // TODO Refactor, just a placeholder for now...needs to store data in DB
            console.log(`access_token has been refreshed, ready to access the API!!!`);
            cb(null, body); // Update auth data for this installation (user/account) accordingly in DB.authHistory
        }
    });
};

/**
 * revokeToken.
 *
 * OAuth2 Revoke Token Handler
 *
 * @private
 *
 * @param       {string} token      The token to revoke
 * @callback    {function} cb       Uses CJS format args: err, body (err === null, is a successful callback), body is described in "@return" below
 * @return      {object} Zoom API Tokens The access_token used to make ZOOM API requests, and the refresh_token to obtain new access_tokens
 * @todo        Improve to use Promises instead of callback
 * @todo        Remove console.logs before publishing
 * @todo        Refactor to use DB and update accordingly
 * @todo        Handle errors accordingly and notify users when there are errors which will impact their experience or their data (give them action items and contact info if they have questions)
 */
const revokeToken = (token, cb) => {
    // Sanity check
    if(!token) {
        console.error('Missing required parameter `token`');
        throw new Error('Missing required parameter `token`');
    }

    let revokeTokenURI = `${getZoomAuthBase()}/oauth/revoke`; 
    let revokeTokenPayload = `token=${token}`;
    let requestOpts = {
        uri: revokeTokenURI,
        method: 'POST',
        headers: {
            "Content-Type": 'application/x-www-form-urlencoded',
            Accept: 'application/json'
        },
        body: revokeTokenPayload,
        auth: {
            user: process.env.ZOOM_CLIENT_ID,
            pass: process.env.ZOOM_CLIENT_SECRET 
        }
    };
    request(requestOpts, function(error, response, body) {
        if(!error && 200 === response.statusCode) {
            console.log('Revoke Token Response Body: ', body);
            return cb(null, body);
        } else {
            console.log(error);
            return cb(error, body);
        }
    });
};

/**
 * Initial OAuth2 Authorization Flow endpoint handler
 *
 * @public
 *
 * @param req {Express Request Object}
 * @param res {Express Response Object}
 */
router.get('/phase-one', function(req, res) {
    console.log(`\nPhase one of redirect has been initiated\n`);
    console.log(req);

    const zoomAuthBaseURL = getZoomAuthBase();
    const zoomAuthorizeURL = `${zoomAuthBaseURL}/oauth/authorize`;
    const oauthState = process.env.AUTH_STATE;
    let clientId = req.app.clientId;
    let clientSecret = req.app.clientSecret;

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

    /* Not used in Zoom API V2, but common in some API Auth flows, here in case this is implemented in the future
    if(req.query.version) {
        redirectUrl += `&version=${req.query.version}`;
    }
    */
    console.log('Redirecting to...: ', redirectUrl);

    res.redirect(redirectUrl);
});

/**
 * Secondary OAuth2 Authorization Flow endpoint handler
 *
 * @public
 *
 * @param req {Express Request Object}
 * @param res {Express Response Object}
 */
router.get('/phase-two', function(req, res, next) {
    console.log(`\nPhase two of redirect has been initiated\n`);
    //console.log(req);

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
    //console.log('Basic Auth Header String: ', basicAuthHeaderString);
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

            let refreshAt = body.refresh_after = moment().add(59, 'minutes');
            console.log('refresh at: ', refreshAt);

            // TODO: Store in DB (only should hit this if we're installing the app)
            /*********** COMMENTED OUT FOR NOW, YOU CAN USE THIS WITH MONGODB
            let auth = new Auth(body);
            auth.save((err) => {
                if(err) throw err;
                console.log(`New auth saved to DB!`);
                // Usually, you would be creating an account here or authenticating this user exists in your system.
                // Since this app is meant to run 1:1, then it isn't a big deal
            });
            */

            // TODO DELETE THIS ONCE DEVELOPMENT IS COMPLETE
            console.log(`\nAccess token: ${body.access_token}`);
            console.log(`\nAccess token type: ${body.token_type}`);
            console.log(`\nRefresh token: ${body.refresh_token}`);
            console.log(`\nAccess token expires_in: ${body.expires_in}`);
            console.log(`\nAccess token scope: ${body.scope}`);

            console.log(`Now we are ready to access the API!!!`);
            // TODO Need to complete this or refactor it, just a placeholder for now...
            console.log('Rendering the response');
            res.render('configure', {
                appDisplayName: process.env.APP_DISPLAY_NAME,
                configurationOptionsByScope: [
                    {dataId: `newUsers`, displayName: `New Users`},
                    {dataId: `meetings`, displayName: `Meetings`},
                    {dataId: `participants`, displayName: `Participants`},
                    {dataId: `meetingMinutes`, displayName: `Meeting Minutes`}
                ]
            });
        }
    });
});

/**
 * @type Express.Router
 */
module.exports = router;
