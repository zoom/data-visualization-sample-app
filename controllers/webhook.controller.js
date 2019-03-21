const Webhook = require('../models/webhook.model');

//TODO Implement validation and sanitize inputs
exports.test = (req, res) => {
    res.send('Test Daily Report Controller');
};

exports.generic = (req, res) => {
    console.log('Event Received: ', req.body['event']);
    let newEvent = new Webhook(req.body);
    newEvent.save((err) => {
        if(err) {
            console.error('ERROR: Webhook event did not save to the database');
            res.status(500).end(err);
        }
        console.log(`New generic webhook saved to DB!`);
        res.status(200);
    });
};
exports.deauthorization = (req, res) => {
    console.log('Deauthorization Event Received');

    // TODO Invalidate request using Verification Token
    // TODO Process deauthorization event to handle customer data as directed, then call Zoom Data Compliance API

    // Save event to DB
    let newEvent = new Webhook(req.body);
    newEvent.save((err) => {
        if(err) {
            console.error('ERROR: Webhook event did not save to the database');
            res.status(500).end(err);
        }
        console.log(`Deauthorization webhook saved to DB!`);
        console.log('Signature: ', req.body.payload.signature);
        // TODO Call Data Compliance API
        res.status(200);
    });
};
