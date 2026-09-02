const assert = require("assert");

console.log("Running Monthly Bill Component Edit Tests...\n");

function simulateUpdateMonthlyBill(initialBill, updates, initialLeaseholderDue) {
  const bill = { ...initialBill };
  let leaseholderDue = initialLeaseholderDue;
  let hasChargeComponentUpdated = false;

  const { rent, currentBill, waterBill, gasBill, wasteBill, paidAmount } = updates;

  if (rent !== undefined) {
    const num = Number(rent);
    if (isNaN(num) || num < 0) throw new Error("Invalid rent amount");
    bill.rent = num;
    hasChargeComponentUpdated = true;
  }
  if (currentBill !== undefined) {
    const num = Number(currentBill);
    if (isNaN(num) || num < 0) throw new Error("Invalid electric bill amount");
    bill.currentBill = num;
    hasChargeComponentUpdated = true;
  }
  if (waterBill !== undefined) {
    const num = Number(waterBill);
    if (isNaN(num) || num < 0) throw new Error("Invalid water bill amount");
    bill.waterBill = num;
    hasChargeComponentUpdated = true;
  }
  if (gasBill !== undefined) {
    const num = Number(gasBill);
    if (isNaN(num) || num < 0) throw new Error("Invalid gas bill amount");
    bill.gasBill = num;
    hasChargeComponentUpdated = true;
  }
  if (wasteBill !== undefined) {
    const num = Number(wasteBill);
    if (isNaN(num) || num < 0) throw new Error("Invalid waste bill amount");
    bill.wasteBill = num;
    hasChargeComponentUpdated = true;
  }

  if (hasChargeComponentUpdated) {
    bill.total =
      (bill.rent || 0) +
      (bill.due || 0) +
      (bill.waterBill || 0) +
      (bill.gasBill || 0) +
      (bill.wasteBill || 0) +
      (bill.currentBill || 0);
    bill.updatedAt = new Date();
  }

  if (paidAmount !== undefined && paidAmount !== null && String(paidAmount).trim() !== "") {
    const numericPaidAmount = Number(paidAmount);
    if (isNaN(numericPaidAmount)) throw new Error("Invalid payment amount");
    bill.paid = "true";
    bill.paidAmount = numericPaidAmount;
    bill.updatedAt = new Date();
    leaseholderDue = bill.total - numericPaidAmount;
  } else if (hasChargeComponentUpdated && bill.paid === "true") {
    leaseholderDue = bill.total - (bill.paidAmount || 0);
  }

  return { bill, leaseholderDue };
}

// Test 1: Editing rent and currentBill on an unpaid bill
{
  const initialBill = {
    roomNo: "101",
    rent: 3000,
    due: 1000, // snapshotted previous due
    currentBill: 400,
    waterBill: 100,
    gasBill: 0,
    wasteBill: 0,
    total: 4500,
    paidAmount: 0,
    paid: "false",
  };

  const { bill } = simulateUpdateMonthlyBill(
    initialBill,
    { rent: 3500, currentBill: 500, waterBill: 150 },
    1000
  );

  // Total should be: 3500 (rent) + 1000 (due) + 150 (water) + 0 (gas) + 0 (waste) + 500 (currentBill) = 5150
  assert.strictEqual(bill.rent, 3500);
  assert.strictEqual(bill.currentBill, 500);
  assert.strictEqual(bill.waterBill, 150);
  assert.strictEqual(bill.total, 5150);
  assert.strictEqual(bill.paid, "false");
  console.log("✓ Test 1: Editing charges on unpaid bill recomputes total accurately");
}

// Test 2: Editing charges on an already-paid bill preserves due = total - paidAmount
{
  const initialBill = {
    roomNo: "101",
    rent: 3000,
    due: 1000,
    currentBill: 500,
    waterBill: 0,
    gasBill: 0,
    wasteBill: 0,
    total: 4500,
    paidAmount: 4500,
    paid: "true",
  };

  // Admin corrects rent to 3800 (+800 increase)
  const { bill, leaseholderDue } = simulateUpdateMonthlyBill(
    initialBill,
    { rent: 3800 },
    0
  );

  assert.strictEqual(bill.total, 5300);
  assert.strictEqual(bill.paidAmount, 4500);
  assert.strictEqual(leaseholderDue, 800); // 5300 - 4500 = 800
  console.log("✓ Test 2: Editing charges on paid bill preserves payment settlement invariant");
}

// Test 3: Validation throws on non-numeric charge input
{
  const initialBill = { rent: 3000, due: 0, currentBill: 0, total: 3000, paid: "false" };
  assert.throws(
    () => simulateUpdateMonthlyBill(initialBill, { rent: "not-a-number" }, 0),
    /Invalid rent amount/
  );
  assert.throws(
    () => simulateUpdateMonthlyBill(initialBill, { currentBill: -50 }, 0),
    /Invalid electric bill amount/
  );
  console.log("✓ Test 3: Validation correctly rejects non-numeric and negative values");
}

console.log("\nAll Monthly Bill Edit tests passed successfully! 🎉");
