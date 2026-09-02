/**
 * Billing Domain Module
 * Pure utility-rate calculations, kept independent of DB/HTTP so the exact
 * formulas — and their order of operations — are directly unit-testable.
 * See implementation_plan.md section 2 for the locked spec these implement.
 */

function calculateElectricityBill(currentReading, previousReading, electricityPerUnitCost) {
  return (currentReading - previousReading) * electricityPerUnitCost;
}

function calculateWaterBill(currentWaterReading, previousWaterReading, waterSharingDivisor, electricityPerUnitCost) {
  // Order matters: floor the shared usage BEFORE multiplying by the rate.
  const waterUsage = Math.floor((currentWaterReading - previousWaterReading) / waterSharingDivisor);
  return waterUsage * electricityPerUnitCost;
}

function calculateWasteBill(hasWasteBill, defaultWasteCost) {
  return hasWasteBill ? defaultWasteCost : 0;
}

module.exports = {
  calculateElectricityBill,
  calculateWaterBill,
  calculateWasteBill,
};
