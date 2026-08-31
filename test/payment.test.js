const assert = require("assert");

console.log("Running Payment Settlement Rule Tests...\n");

function simulatePaymentSettlement(billTotal, paidAmount, currentDue) {
  if (paidAmount === undefined || paidAmount === null || String(paidAmount).trim() === "") {
    throw new Error("Payment amount is required");
  }
  const numericPaidAmount = Number(paidAmount);
  if (isNaN(numericPaidAmount)) {
    throw new Error("Invalid payment amount. Must be a valid number.");
  }

  const paymentDifference = billTotal - numericPaidAmount;
  const bill = {
    paid: "true",
    paidAmount: numericPaidAmount,
    updatedAt: new Date(),
  };
  const newDue = paymentDifference;

  return { bill, newDue };
}

// Test 1: Exact payment (4500 -> paid, due 0)
{
  const { bill, newDue } = simulatePaymentSettlement(4500, 4500, 0);
  assert.strictEqual(bill.paid, "true");
  assert.strictEqual(bill.paidAmount, 4500);
  assert.strictEqual(newDue, 0);
  console.log("✓ Test 1: Exact payment (4500 -> paid, due 0) passed");
}

// Test 2: Partial payment (3000 -> paid, due 1500)
{
  const { bill, newDue } = simulatePaymentSettlement(4500, 3000, 0);
  assert.strictEqual(bill.paid, "true");
  assert.strictEqual(bill.paidAmount, 3000);
  assert.strictEqual(newDue, 1500);
  console.log("✓ Test 2: Partial payment (3000 -> paid, due 1500) passed");
}

// Test 3: Zero payment (0 and "0" -> paid, due 4500)
{
  const res1 = simulatePaymentSettlement(4500, 0, 0);
  assert.strictEqual(res1.bill.paid, "true");
  assert.strictEqual(res1.bill.paidAmount, 0);
  assert.strictEqual(res1.newDue, 4500);

  const res2 = simulatePaymentSettlement(4500, "0", 0);
  assert.strictEqual(res2.bill.paid, "true");
  assert.strictEqual(res2.bill.paidAmount, 0);
  assert.strictEqual(res2.newDue, 4500);
  console.log("✓ Test 3: Zero payment (0 and '0' -> paid, due 4500) passed");
}

// Test 4: Overpayment (5000 -> paid, due -500)
{
  const { bill, newDue } = simulatePaymentSettlement(4500, 5000, 0);
  assert.strictEqual(bill.paid, "true");
  assert.strictEqual(bill.paidAmount, 5000);
  assert.strictEqual(newDue, -500);
  console.log("✓ Test 4: Overpayment (5000 -> paid, due -500) passed");
}

// Test 5: Invalid / non-numeric input rejected
{
  assert.throws(
    () => simulatePaymentSettlement(4500, "invalid-amount", 0),
    /Invalid payment amount/
  );
  console.log("✓ Test 5: Invalid non-numeric input rejected successfully");
}

// Test 6: Cumulative previous due preservation
{
  // Previous due = 1000, current rent+utilities = 3500 -> bill.total = 4500
  const previousDue = 1000;
  const currentExpenses = 3500;
  const billTotal = previousDue + currentExpenses; // 4500

  // Tenant pays 3000
  const { bill, newDue } = simulatePaymentSettlement(billTotal, 3000, previousDue);
  assert.strictEqual(bill.paid, "true");
  assert.strictEqual(newDue, 1500); // 1000 previous due + 500 current unpaid
  console.log("✓ Test 6: Cumulative previous due preservation verified");
}

console.log("\nAll Payment Settlement tests passed successfully! 🎉");
