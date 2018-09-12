"use strict";

var crypto = require('crypto');

let Utility = {};

/**
 * Helper function to validate Hmac
 * @param hmac
 * @param compareString
 * @param key
 * @returns {boolean}
 */
Utility.validateHmac = function(hmac, compareString, key) {
    console.log('Validating the HMAC');
    let digest = this.generateHmac(compareString, key);
    return (digest == hmac);
};

/**
 * Helper function to generate Hmac
 * @param string
 * @param key
 * @returns {*}
 */
Utility.generateHmac = function(string, key) {
    console.log('Generating HMAC');
    let crypt = crypto.createHmac('sha256', new Buffer(key, 'utf-8'));
    crypt.update(string);
    return crypt.digest('hex');
};

/**
 * Helper function to generate OAuth Authorization Flow "State"
 * @returns {string}
 */
Utility.generateAuthState = function() {
    console.log('Generating OAuth Phase One State...');
    let generatedState = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return generatedState;
};

module.exports = Utility;
