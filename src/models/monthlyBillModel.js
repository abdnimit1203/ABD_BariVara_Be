const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const monthlyBillSchema = new Schema({
  roomNo: { type: String, required: true },
  waterBill: { type: Number, required: false, default: 0 },
  gasBill: { type: Number, required: false, default: 0 },
  currentBill: { type: Number, required: false, default: 0 },
  paid: {type: Boolean, default: false},
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

module.exports = mongoose.model('monthlyBillsData', monthlyBillSchema);
