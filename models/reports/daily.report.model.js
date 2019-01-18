const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let DatesSchema = new Schema({
    "date": {
        type: Date,
        required: true
    },
    "new_users": {
        type: Number,
        required: true
    },
    "meetings": {
        type: Number,
        required: true
    },
    "participants": {
        type: Number,
        required: true
    },
    "meeting_minutes": {
        type: Number,
        required: true
    }
});

let ReportDailySchema = new Schema({
    "year": {
        type: Number,
        required: true
    },
    "month": {
        type: Number,
        required: true
    },
    "dates": {
        type: [DatesSchema],
        default: undefined
    }
});

module.exports = mongoose.model('ReportDaily', ReportDailySchema); 
