const Webhook = require('../models/webhook.model');

//TODO Implement validation and sanitize inputs
exports.logger = (webhookEvent) => {
    console.log('Logging new webhook event...');
    console.log('Here is the request body received:');
    console.log(req.body);
    return true;
};

exports.generic = (req, res) => {
    console.log('Event Received: ', req.body['event']);
    res.status(200).end();

    /*********** COMMENTED OUT, USE IF YOU EMPLOY AND CONNECT MONGODB
    let newEvent = new Webhook(req.body);
    newEvent.save((err) => {
        if(err) {
            console.error('ERROR: Webhook event did not save to the database');
            res.status(500).end(err);
        }
        console.log(`New generic webhook saved to DB!`);
        res.status(200).end();
    });
    */

    /**
      * Call specific event type handlers here based on incoming `event` matches
    **/
};
exports.deauthorization = (req, res) => {
    console.log('Deauthorization Event Received');
    res.status(200).end();

    // TODO Invalidate request using Verification Token
    // TODO Process deauthorization event to handle customer data as directed, then call Zoom Data Compliance API

    // Save event to DB
    /*********** COMMENTED OUT, USE IF YOU EMPLOY AND CONNECT MONGODB
    let newEvent = new Webhook(req.body);
    newEvent.save((err) => {
        if(err) {
            console.error('ERROR: Webhook event did not save to the database');
            res.status(500).end(err);
        }
        console.log(`Deauthorization webhook saved to DB!`);
        console.log('Signature: ', req.body.payload.signature);
        // TODO Call Data Compliance API
        res.status(200).end();
    });
    */
};
