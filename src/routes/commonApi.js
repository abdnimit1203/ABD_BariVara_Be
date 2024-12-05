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
  const AuthVarification = require('../middlewares/authVarification')

const router = express.Router();

 // Category
 router.post('/categories', AuthVarification, createCategory);
 router.get('/categories/:id', getOneCategory);
 router.get('/categories',  AuthVarification,getAllCategories);
 router.put('/categories/:id',AuthVarification, updateCategory);
 router.delete('/categories/:id',AuthVarification, deleteCategory);

// // Create a new room
 router.post('/rooms',AuthVarification, createRoom);
 router.get('/rooms', getAllRooms);
 router.get('/rooms/:id', getRoomById);
 router.put('/rooms/:id',AuthVarification, updateRoom);
 router.delete('/rooms/:id',AuthVarification, deleteRoom);
 router.post('/rooms/:id/leaseholder',AuthVarification, addLeaseholder);
 router.put('/rooms/:id/leaseholder/:leaseholderId', AuthVarification, updateLeaseholder);
 router.delete('/rooms/:id/leaseholder/:leaseholderId', AuthVarification, deleteLeaseholder);



//monthly meter data
 router.post('/monthlyData',AuthVarification, addMonthlyMeterData);
 router.get('/monthlyData',  AuthVarification,getMonthlyData);
 router.put('/meterReadings/:id', AuthVarification, updateMeterReadingById);
 router.delete('/meterReadings/:id', AuthVarification, deleteMeterReadingById);

// // Cost
 router.post('/cost',AuthVarification, createCost);
 router.get('/cost', getAllCosts);
 router.get('/cost/:id', getOneCost);
 router.put('/cost/:id',AuthVarification, updateCost);
 router.delete('/cost/:id',AuthVarification, deleteCost);
 router.get('/totalMonthlyCost', totalMonthlyCost);

// // User
 router.post('/login', logIn);
 router.post('/register', register);
 router.post('/changePassword',AuthVarification, changePassword);

//monthly bill
 router.post('/monthlyBill', AuthVarification,createMonthlyBill);
 router.get('/monthlyBill/:id', readMonthlyBill);
 router.get('/monthlyBill', readAllMonthlyBills);
 router.put('/monthlyBill/:id', AuthVarification,updateMonthlyBill);
 router.get('/monthlyBillSummary', calculateMonthlyBills);
 
module.exports = router;