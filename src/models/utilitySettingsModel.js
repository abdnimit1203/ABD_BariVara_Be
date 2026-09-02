const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Single global settings document (see AUTH_IMPLEMENTATION_PLAN.md / implementation_plan.md
// for the locked "Dynamic Utility & Rate Settings" spec this implements).
const utilitySettingsSchema = new Schema({
  electricityPerUnitCost: { type: Number, default: 10 },
  waterSharingDivisor: { type: Number, default: 3 },
  defaultWasteCost: { type: Number, default: 60 },
  defaultGasBill: { type: Number, default: 0 },
  updatedBy: { type: String, default: 'Super Admin' },
  updatedAt: { type: Date, default: Date.now },
}, { versionKey: false });

module.exports = mongoose.model('utilitySettings', utilitySettingsSchema);
