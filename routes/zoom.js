let express = require('express');
let router = express.Router();
//let webhooks = require('../webhooks');

/* GET App Main Page. */
router.get('/', function(req, res, next) {
    // TODO Verify JWT data, user, and account
    // TODO Fetch operational data from the DB
    // NOTE This is NOT real time (would need refactored for streaming data)
    let operationalData = {}; // Will be equal to ^^^ once setup
    res.render('dashboard', operationalData);
});

/* GET OAuth */
router.get('/auth/redirect', function(req, res, next) {
    let authorizationCode = req.query.code;
    if(!authorizationCode || '' === authorizationCode) {
        let errMsg = 'Authorization code query param is required';
        console.error(errMsg);
        res.send(400, errMsg);
    }
    // TODO Handle authorization request and exchange for valid access_token
});

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

/* GET App Configuration Page. */
router.get('/configure', function(req, res, next) {
    // TODO Verify JWT data, user, and account
    // TODO Fetch configuration state information from the DB
    let currentConfiguration = {}; // Will be equal to ^^^ once setup
    res.render('configure', currentConfigurationData);
});

/* POST Zoom Webhook Event Handler */
router.post('/webhooks/:evt', function(req, res, next) {
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
