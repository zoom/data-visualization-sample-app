const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let WebhookSchema = new Schema({
    "event": {
        type: String,
        required: true
    },
    "payload": {
        any: {}
    }
});

module.exports = mongoose.model('Webhook', WebhookSchema); 
