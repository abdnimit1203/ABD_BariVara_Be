const assert = require("assert");
const {
  calculateElectricityBill,
  calculateWaterBill,
  calculateWasteBill,
  calculateBillTotal,
} = require("../src/modules/billing");

console.log("Running Billing Module Unit Tests...\n");

// Test 1: Electricity bill = (current - previous) * rate
{
  const bill = calculateElectricityBill(150, 100, 10);
  assert.strictEqual(bill, 500);
  console.log("✓ Test 1: calculateElectricityBill computes usage * rate");
}

// Test 2: Water bill floors usage BEFORE multiplying by rate (implementation_plan.md order of operations)
{
  // (110 - 100) / 3 = 3.33 -> floor = 3; 3 * 10 = 30
  const bill = calculateWaterBill(110, 100, 3, 10);
  assert.strictEqual(bill, 30);
  console.log("✓ Test 2: calculateWaterBill floors usage before multiplying by rate");
}

// Test 3: Water bill order-of-operations regression guard — must NOT equal (diff * rate) / divisor
{
  const correct = calculateWaterBill(110, 100, 3, 10); // 30
  const wrongOrder = ((110 - 100) * 10) / 3; // 33.33 — the forbidden calculation
  assert.notStrictEqual(correct, wrongOrder);
  assert.strictEqual(correct, 30);
  console.log("✓ Test 3: water bill does not match the forbidden (diff * rate) / divisor formula");
}

// Test 4: Waste bill ON uses the configured rate
{
  assert.strictEqual(calculateWasteBill(true, 60), 60);
  console.log("✓ Test 4: calculateWasteBill charges the default rate when enabled");
}

// Test 5: Waste bill OFF is always zero, regardless of rate
{
  assert.strictEqual(calculateWasteBill(false, 60), 0);
  console.log("✓ Test 5: calculateWasteBill charges nothing when disabled");
}

// Test 6: Bill total sums all six resolved charge components (create-path shape)
{
  const total = calculateBillTotal({
    rent: 3500,
    due: 1000,
    waterBill: 150,
    gasBill: 0,
    wasteBill: 0,
    currentBill: 500,
  });
  assert.strictEqual(total, 5150);
  console.log("✓ Test 6: calculateBillTotal sums rent+due+water+gas+waste+current");
}

// Test 7: Bill total is a dumb sum — it does NOT gate on room flags itself.
// Gating (e.g. zeroing waterBill when a room has no water bill) is the caller's
// job, resolved before calling this function.
{
  const gated = calculateBillTotal({
    rent: 3000, due: 0, waterBill: 0, gasBill: 0, wasteBill: 0, currentBill: 400,
  }); // caller already zeroed waterBill because room.hasWaterBill was false
  const ungated = calculateBillTotal({
    rent: 3000, due: 0, waterBill: 90, gasBill: 0, wasteBill: 0, currentBill: 400,
  }); // caller passed the raw computed waterBill through unchanged
  assert.strictEqual(gated, 3400);
  assert.strictEqual(ungated, 3490);
  console.log("✓ Test 7: calculateBillTotal has no gating logic of its own — it trusts its inputs");
}

console.log("\nAll Billing unit tests passed successfully! 🎉");
