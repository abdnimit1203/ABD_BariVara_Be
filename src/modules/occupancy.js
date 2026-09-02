/**
 * Occupancy Domain Module
 * Encapsulates room occupancy invariants, tenant lifecycle, and due adjustments.
 */

/**
 * Returns the currently active tenant in a room, or null if vacant.
 * A tenant is active if they are at leaseholder[0] and their rentTo is null/undefined.
 */
function getActiveTenant(room) {
  if (!room || !Array.isArray(room.leaseholder) || room.leaseholder.length === 0) {
    return null;
  }
  const current = room.leaseholder[0];
  if (!current || !current.name) {
    return null;
  }
  if (current.rentTo) {
    return null; // Room was vacated
  }
  return current;
}

/**
 * Determines whether a room is currently occupied.
 */
function isRoomOccupied(room) {
  return getActiveTenant(room) !== null;
}

/**
 * Formats a new tenant object with required defaults.
 */
function createTenantRecord(data) {
  if (!data || !data.name) {
    throw new Error("Tenant name is required");
  }
  return {
    name: String(data.name).trim(),
    phoneNumber: data.phoneNumber ? String(data.phoneNumber).trim() : "",
    advance: Number(data.advance) || 0,
    rentFrom: data.rentFrom ? new Date(data.rentFrom) : new Date(),
    due: Number(data.due) || 0,
    rentTo: null,
    hasWasteBill: data.hasWasteBill !== false,
  };
}

/**
 * Prepares the room state when a new tenant occupies it.
 * If a previous active tenant existed without rentTo, sets their rentTo to the new rentFrom date.
 */
function applyNewTenant(existingLeaseholders = [], newTenantData) {
  const newTenant = createTenantRecord(newTenantData);
  const updatedList = Array.isArray(existingLeaseholders) ? [...existingLeaseholders] : [];

  // If the previous occupant didn't have rentTo set, set it to the new tenant's arrival date
  if (updatedList.length > 0 && !updatedList[0].rentTo) {
    updatedList[0] = {
      ...updatedList[0],
      rentTo: newTenant.rentFrom,
    };
  }

  // Prepend new active tenant to index 0
  updatedList.unshift(newTenant);
  return updatedList;
}

/**
 * Updates an existing tenant record by ID while preserving other fields.
 */
function applyTenantUpdate(leaseholders = [], tenantId, updateData) {
  if (!Array.isArray(leaseholders)) return [];
  const targetIdStr = String(tenantId);

  return leaseholders.map((tenant) => {
    const currentIdStr = tenant._id ? String(tenant._id) : "";
    if (currentIdStr === targetIdStr) {
      return {
        ...tenant,
        ...updateData,
        advance: updateData.advance !== undefined ? Number(updateData.advance) : tenant.advance,
        due: updateData.due !== undefined ? Number(updateData.due) : tenant.due,
        rentFrom: updateData.rentFrom ? new Date(updateData.rentFrom) : tenant.rentFrom,
        rentTo: updateData.rentTo ? new Date(updateData.rentTo) : tenant.rentTo,
      };
    }
    return tenant;
  });
}

/**
 * Marks an active tenant as vacated by recording their departure date.
 */
function applyVacateTenant(leaseholders = [], tenantId, vacateDate = new Date()) {
  if (!Array.isArray(leaseholders) || leaseholders.length === 0) return [];
  const targetIdStr = tenantId ? String(tenantId) : null;

  return leaseholders.map((tenant, index) => {
    const currentIdStr = tenant._id ? String(tenant._id) : null;
    const isTarget = targetIdStr ? currentIdStr === targetIdStr : index === 0;

    if (isTarget && !tenant.rentTo) {
      return {
        ...tenant,
        rentTo: new Date(vacateDate),
      };
    }
    return tenant;
  });
}

/**
 * Adjusts a tenant's due balance safely.
 */
function applyDueAdjustment(leaseholders = [], tenantId, newDueAmount) {
  if (!Array.isArray(leaseholders)) return [];
  const targetIdStr = String(tenantId);
  const validatedDue = Number(newDueAmount);

  if (isNaN(validatedDue)) {
    throw new Error("Invalid due amount");
  }

  return leaseholders.map((tenant) => {
    const currentIdStr = tenant._id ? String(tenant._id) : "";
    if (currentIdStr === targetIdStr) {
      return {
        ...tenant,
        due: validatedDue,
      };
    }
    return tenant;
  });
}

module.exports = {
  getActiveTenant,
  isRoomOccupied,
  createTenantRecord,
  applyNewTenant,
  applyTenantUpdate,
  applyVacateTenant,
  applyDueAdjustment,
};
