const UtilitySettings = require('../models/utilitySettingsModel');

const SINGLETON_FILTER = {};

// Ensures exactly one settings document always exists, seeded with schema
// defaults on first access — used both by the API and by createMonthlyBill.
const getOrCreateSettings = () =>
  UtilitySettings.findOneAndUpdate(
    SINGLETON_FILTER,
    { $setOnInsert: {} },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

exports.getOrCreateSettings = getOrCreateSettings;

exports.getUtilitySettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.status(200).json({ status: 'success', data: settings });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.updateUtilitySettings = async (req, res) => {
  try {
    const { electricityPerUnitCost, waterSharingDivisor, defaultWasteCost, defaultGasBill } = req.body;
    const update = {
      updatedAt: new Date(),
      updatedBy: req.user?.name || req.user?.email || 'Super Admin',
    };
    if (electricityPerUnitCost !== undefined) update.electricityPerUnitCost = electricityPerUnitCost;
    if (waterSharingDivisor !== undefined) update.waterSharingDivisor = waterSharingDivisor;
    if (defaultWasteCost !== undefined) update.defaultWasteCost = defaultWasteCost;
    if (defaultGasBill !== undefined) update.defaultGasBill = defaultGasBill;

    const settings = await UtilitySettings.findOneAndUpdate(
      SINGLETON_FILTER,
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );
    res.status(200).json({ status: 'success', data: settings });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
