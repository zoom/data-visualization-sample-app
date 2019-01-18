const express = require('express');
const router = express.Router();
//const webhooks = require('../webhooks');
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

// #################### SYSTEM #################################
/* POST Zoom Webhook Event Handler */
router.post('/webhooks/:evt', function(req, res, next) {
    // TODO Use this with a Controller to handle all incoming requests???
    // TODO Only accept POST requests to these URLs???
    // TODO Verify the request source is Zoom using the Verification Token
    if('deauthorization' === req.param.evt) {
        console.log('Deauthorization event received...');
        console.log(req.body);
        // TODO Invalidate request using Verification Token
        // TODO Handle deauthorization event
    } else {
        console.log('New Webhook event received...');
        console.log(req.body);
    }

    res.send(200, 'Event received');
});

module.exports = router;
