const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const costSchema = new Schema({
    name: { type: String, required: true},
    month: {type: String, required: true},
    year: {type: Number, required: true},
    amount: { type: Number, required: true},
    createdAt: {type: Date, default: Date.now}
},{versionKey: false});

module.exports = mongoose.model('costs', costSchema);