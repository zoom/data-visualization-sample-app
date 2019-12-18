const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');
const dailyReportController = require('../controllers/dailyReport.controller');

// ##################### STATIC PAGES #############################
/* GET Zoom Integration Support Page. */
router.get('/support', function(req, res, next) {
    res.render('support', {
        serviceProvider: process.env.ZOOM_DISPLAY_NAME,
        appDisplayName: process.env.APP_DISPLAY_NAME
    });
});

/* GET Zoom Privacy and Legal Docs Page. */
router.get('/privacy', function(req, res, next) {
    res.redirect(process.env.PRIVACY_URL);
});

// ##################### DYNAMIC PAGES ###########################
/* GET App Main Page. */
router.get('/', function(req, res, next) {
    // TODO Verify JWT data, user, and account
    // TODO Fetch operational data from the DB
    // NOTE This is NOT real time (would need refactored for streaming data)
    let operationalData = {}; // Will be equal to ^^^ once setup
    res.render('dashboard', operationalData);
});

/* GET App Configuration Page. */
router.get('/configure', function(req, res, next) {
    // TODO Require JWT or fail
    // TODO Verify JWT data, user, and account
    // TODO Fetch configuration state information from the DB
    //let currentConfiguration = {}; // Will be equal to ^^^ once setup
    let configurationOptionsByScope = [
        {dataId: `newUsers`, displayName: `New Users`},
        {dataId: `meetings`, displayName: `Meetings`},
        {dataId: `participants`, displayName: `Participants`},
        {dataId: `meetingMinutes`, displayName: `Meeting Minutes`}
    ]
    res.render('configure', {configurationOptionsByScope});
});

// #################### CONTROLLER MAPPING #####################
router.get('/report/daily/test', dailyReportController.test);

// #################### WEBHOOKS #################################
/* POST Zoom Webhook Event Handler */
router.post('/webhooks', function(req, res, next) {
/* CURRENT ERRORS...
New Webhook Event
Logging new webhook event...
POST /zoom/webhooks 500 15.204 ms - 2180
*/
    console.log('New Webhook Event');
    
    let error = false;
    // MAY NOT NEED THIS, NEED TO SEE IF EXPRESS.JS BLOCKS ALL OTHER METHOD CALLS TO THIS ROUTE
    if(`POST` !== req.method) {
        console.log('Webhooks must use HTTP POST verb for method');
        error = true;
        res.status(405).end();
    }
    if(!process.env.WEBHOOK_VERIFICATION_TOKEN) {
        console.error('Environment variable is NOT set for Webhook Verification Token');
        error = true;
        res.status(500).end();
    }
    if(process.env.WEBHOOK_VERIFICATION_TOKEN !== req.headers.authorization) {
        console.error('Webhook Verification Token does not match the request Authorization header as expected');
        error = true;
        res.status(417).end();
    }
    if(!req.body || !req.body[`event`] || !req.body[`payload`]) {
        console.error('Invalid payload, missing required `body`, or one of its required properties');
        error = true;
        res.status(400).end();
    }

    // TODO Map req.param.evt to the controller methods
    if(false === error) {
        console.log('PASSED BASIC TESTS, PROCESSING WEBHOOK... \n');
        if('deauthorization' === req.params.evt) {
            console.log('Deauthorization event received...');
            console.log(req.body);
            webhookController.deauthorization(req, res);
        } else {
            console.log('New Event received...');
            console.log(req.body);
            webhookController.generic(req, res);
        }
    }
    // NOTE Later, can move above code into the controller and direct to correct handlers by req.body.type (type of event)
});

module.exports = router;
