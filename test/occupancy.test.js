const assert = require("assert");
const {
  getActiveTenant,
  isRoomOccupied,
  createTenantRecord,
  applyNewTenant,
  applyTenantUpdate,
  applyVacateTenant,
  applyDueAdjustment,
} = require("../src/modules/occupancy");

console.log("Running Occupancy Module Unit Tests...\n");

// Test 1: createTenantRecord
{
  const tenant = createTenantRecord({
    name: " Rahim Uddin ",
    phoneNumber: "01711111111",
    advance: "5000",
    due: "1500",
  });
  assert.strictEqual(tenant.name, "Rahim Uddin");
  assert.strictEqual(tenant.phoneNumber, "01711111111");
  assert.strictEqual(tenant.advance, 5000);
  assert.strictEqual(tenant.due, 1500);
  assert.strictEqual(tenant.rentTo, null);
  console.log("✓ Test 1: createTenantRecord formatted successfully");
}

// Test 2: getActiveTenant and isRoomOccupied
{
  const vacantRoom = { roomNo: "1", leaseholder: [] };
  assert.strictEqual(getActiveTenant(vacantRoom), null);
  assert.strictEqual(isRoomOccupied(vacantRoom), false);

  const occupiedRoom = {
    roomNo: "1",
    leaseholder: [{ name: "Rahim", phoneNumber: "017", due: 0, rentTo: null }],
  };
  assert.strictEqual(getActiveTenant(occupiedRoom).name, "Rahim");
  assert.strictEqual(isRoomOccupied(occupiedRoom), true);

  const vacatedRoom = {
    roomNo: "1",
    leaseholder: [{ name: "Karim", phoneNumber: "018", due: 0, rentTo: new Date() }],
  };
  assert.strictEqual(getActiveTenant(vacatedRoom), null);
  assert.strictEqual(isRoomOccupied(vacatedRoom), false);
  console.log("✓ Test 2: getActiveTenant and isRoomOccupied work correctly");
}

// Test 3: applyNewTenant shifts previous active occupant to history
{
  const initialLeaseholders = [
    { name: "Old Tenant", phoneNumber: "017000", advance: 2000, rentFrom: new Date("2025-01-01"), rentTo: null },
  ];
  const newTenantData = {
    name: "New Tenant",
    phoneNumber: "018000",
    advance: 5000,
    rentFrom: new Date("2026-09-01"),
  };

  const updated = applyNewTenant(initialLeaseholders, newTenantData);
  assert.strictEqual(updated.length, 2);
  assert.strictEqual(updated[0].name, "New Tenant");
  assert.strictEqual(updated[0].rentTo, null);
  assert.strictEqual(updated[1].name, "Old Tenant");
  assert.ok(updated[1].rentTo !== null, "Previous tenant rentTo was set");
  console.log("✓ Test 3: applyNewTenant preserves history and sets previous rentTo");
}

// Test 4: applyVacateTenant
{
  const leaseholders = [
    { _id: "t1", name: "Active Guy", rentTo: null },
    { _id: "t2", name: "Past Guy", rentTo: new Date("2024-01-01") },
  ];
  const vacated = applyVacateTenant(leaseholders, "t1", new Date("2026-08-31"));
  assert.strictEqual(vacated.length, 2);
  assert.ok(vacated[0].rentTo !== null);
  console.log("✓ Test 4: applyVacateTenant sets departure date without deleting record");
}

// Test 5: applyDueAdjustment
{
  const leaseholders = [
    { _id: "t1", name: "Active Guy", due: 1500 },
  ];
  const adjusted = applyDueAdjustment(leaseholders, "t1", 1000);
  assert.strictEqual(adjusted[0].due, 1000);
  console.log("✓ Test 5: applyDueAdjustment updates due correctly");
}

console.log("\nAll Occupancy unit tests passed successfully! 🎉");
