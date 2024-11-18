const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const monthlyMeterDataSchema = new Schema({
    month: {type: String, required: true},
    year: {type: Number, required: true},
    meterReadings:[{
        roomNo: {type: String, required: true},
        meterNumber: {type: Number, required: true },
        createdAt: {type: Date, default: Date.now}
    }]
},{versionKey: false});

module.exports = mongoose.model('monthlyMeterData', monthlyMeterDataSchema);