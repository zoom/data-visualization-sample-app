const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let AuthSchema = new Schema({
    "access_token": {
        type: String,
        required: true
    },
    "token_type": {
        type: String,
        required: true,
        default: "Bearer"
    },
    "refresh_after": {
        type: String,
        required: true
    },
    "expires_in": {
        type: Number,
        required: true
    },
    "refresh_token": {
        type: String,
        required: true
    },
    "scope": {
        type: [String],
        default: undefined
    }
});

module.exports = mongoose.model('Auth', AuthSchema); 
