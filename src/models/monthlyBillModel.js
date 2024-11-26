const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const monthlyBillSchema = new Schema({
  roomNo: { type: String, required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  waterBill: { type: Number, required: false, default: 0 },
  gasBill: { type: Number, required: false, default: 0 },
  currentBill: { type: Number, required: false, default: 0 },
  total: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  paid: { type: String, enum: ['false', 'partial', 'true'], default: 'false' },
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });


module.exports = mongoose.model('monthlyBillsData', monthlyBillSchema);
