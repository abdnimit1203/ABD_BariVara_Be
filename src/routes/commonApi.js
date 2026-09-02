const express = require('express');
const {
    createCategory,
    getOneCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
    createRoom,
    getAllRooms,
    getRoomById,
    updateRoom,
    deleteRoom,
    addLeaseholder,
    updateLeaseholder,
    vacateLeaseholder,
    deleteLeaseholder,
    addMonthlyMeterData,
    getMonthlyData,
    updateMeterReadingById,
    deleteMeterReadingById,
    createCost,
    getAllCosts,
    getOneCost,
    updateCost,
    deleteCost,
    totalMonthlyCost,
    logIn,
    register,
    changePassword,
    createMonthlyBill,
    readMonthlyBill,
    readAllMonthlyBills,
    updateMonthlyBill,
    calculateMonthlyBills
  } = require('../controllers/common');
  const {
    getMe,
    updateMyProfile,
    listUsers,
    updateUserRole,
    updateAccountStatus,
  } = require('../controllers/users');
  const {
    getUtilitySettings,
    updateUtilitySettings,
  } = require('../controllers/utilitySettings');
  const AuthVarification = require('../middlewares/authVarification') // legacy bcrypt/JWT flow — kept for /changePassword only, unwired from the new frontend
  const verifyFirebaseToken = require('../middlewares/verifyFirebaseToken');
  const optionalAuth = require('../middlewares/optionalAuth');
  const requireRole = require('../middlewares/requireRole');

const router = express.Router();

// The existing apartment/room management system (categories, rooms, leaseholders,
// meter data, costs, monthly bills) is Super Admin/Admin-only staff tooling.
// verifyFirebaseToken only proves identity — staffOnly additionally proves role,
// so an authenticated `household`/`tenant` account can't call these directly.
const staffOnly = [verifyFirebaseToken, requireRole('superadmin', 'admin')];

 // Category
 router.post('/categories', ...staffOnly, createCategory);
 router.get('/categories/:id', getOneCategory);
 router.get('/categories', ...staffOnly, getAllCategories);
 router.put('/categories/:id', ...staffOnly, updateCategory);
 router.delete('/categories/:id', ...staffOnly, deleteCategory);

// // Create a new room
 router.post('/rooms', ...staffOnly, createRoom);
 router.get('/rooms', optionalAuth, getAllRooms); // public to-let browsing; response shaped by role, see common.js
 router.get('/rooms/:id', optionalAuth, getRoomById);
 router.put('/rooms/:id', ...staffOnly, updateRoom);
 router.delete('/rooms/:id', ...staffOnly, deleteRoom);
 router.post('/rooms/:id/leaseholder', ...staffOnly, addLeaseholder);
 router.put('/rooms/:id/leaseholder/:leaseholderId', ...staffOnly, updateLeaseholder);
 router.put('/rooms/:id/leaseholder/:leaseholderId/vacate', ...staffOnly, vacateLeaseholder);
 router.delete('/rooms/:id/leaseholder/:leaseholderId', ...staffOnly, deleteLeaseholder);



//monthly meter data
 router.post('/monthlyData', ...staffOnly, addMonthlyMeterData);
 router.get('/monthlyData', ...staffOnly, getMonthlyData);
 router.put('/meterReadings/:id', ...staffOnly, updateMeterReadingById);
 router.delete('/meterReadings/:id', ...staffOnly, deleteMeterReadingById);

// // Cost
 router.post('/cost', ...staffOnly, createCost);
 router.get('/cost', getAllCosts);
 router.get('/cost/:id', getOneCost);
 router.put('/cost/:id', ...staffOnly, updateCost);
 router.delete('/cost/:id', ...staffOnly, deleteCost);
 router.get('/totalMonthlyCost', totalMonthlyCost);

// // User (legacy bcrypt flow — kept in code, unwired from the new frontend)
 router.post('/login', logIn);
 router.post('/register', register);
 router.post('/changePassword',AuthVarification, changePassword);

// // User (Firebase-backed accounts)
 router.get('/users/me', verifyFirebaseToken, getMe);
 router.put('/users/me', verifyFirebaseToken, updateMyProfile);
 router.get('/users', verifyFirebaseToken, requireRole('superadmin'), listUsers);
 router.put('/users/:id/role', verifyFirebaseToken, requireRole('superadmin'), updateUserRole);
 router.put('/users/:id/status', verifyFirebaseToken, requireRole('superadmin'), updateAccountStatus);

// // Utility & Rate Settings (implementation_plan.md) — staff can view, only Super Admin can change
 router.get('/utilitySettings', ...staffOnly, getUtilitySettings);
 router.put('/utilitySettings', verifyFirebaseToken, requireRole('superadmin'), updateUtilitySettings);

//monthly bill
 router.post('/monthlyBill', ...staffOnly, createMonthlyBill);
 router.get('/monthlyBill/:id', ...staffOnly, readMonthlyBill);
 router.get('/monthlyBill', ...staffOnly, readAllMonthlyBills);
 router.put('/monthlyBill/:id', ...staffOnly, updateMonthlyBill);
 router.get('/monthlyBillSummary', ...staffOnly, calculateMonthlyBills);

module.exports = router;