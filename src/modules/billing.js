/**
 * Billing Domain Module
 * Pure billing calculations — utility rates, and the bill total assembled
 * from them — kept independent of DB/HTTP so the exact formulas, and their
 * order of operations, are directly unit-testable.
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

// Sums the six already-resolved charge components into a bill total. Deliberately
// a plain sum with no gating/defaulting inside — callers resolve each component
// (e.g. zeroing waterBill when a room has no water bill, or falling back to 0 for
// a field that may not exist yet) before calling, exactly as they did before this
// was extracted, so behavior for existing data is unchanged.
function calculateBillTotal({ rent, due, waterBill, gasBill, wasteBill, currentBill }) {
  return rent + due + waterBill + gasBill + wasteBill + currentBill;
}

module.exports = {
  calculateElectricityBill,
  calculateWaterBill,
  calculateWasteBill,
  calculateBillTotal,
};
