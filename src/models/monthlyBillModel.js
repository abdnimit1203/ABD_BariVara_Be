// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const monthlyBillSchema = new Schema({
//   roomNo: { type: String, required: true },
//   month: { type: String, required: true },
//   rent: { type: Number, required: true },
//   due: { type: Number, required: true },
//   currentReading:{ type: Number, required: false },
//   previousReading:{ type: Number, required: false },
//   billingMonth:{ type: String, required: false },
//   billingYear:{ type: Number, required: false },
//   waterBill: { type: Number, required: false, default: 0 },
//   gasBill: { type: Number, required: false, default: 0 },
//   currentBill: { type: Number, required: false, default: 0 },
//   total: { type: Number, required: true },
//   paidAmount: { type: Number, default: 0 },
//   paid: { type: String, default: false },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
// }, { versionKey: false });


// module.exports = mongoose.model('monthlyBillsData', monthlyBillSchema);

// WILL EDIT TOMMOROW

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for monthly bills data
const monthlyBillSchema = new Schema({
  billingMonth: { type: String, required: false },
  billingYear: { type: Number, required: false },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  bills: [{
    roomNo: { type: String, required: true },
    rent: { type: Number, required: true },
    due: { type: Number, required: true },
    currentReading: { type: Number, required: false },
    previousReading: { type: Number, required: false },
    billingMonth: { type: String, required: false },
    billingYear: { type: Number, required: false },
    waterBill: { type: Number, required: false, default: 0 },
    gasBill: { type: Number, required: false, default: 0 },
    currentBill: { type: Number, required: false, default: 0 },
    total: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    paid: { type: String, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  }], // Array of individual bill entries
}, { versionKey: false });

module.exports = mongoose.model('monthlyBillsData', monthlyBillSchema);
