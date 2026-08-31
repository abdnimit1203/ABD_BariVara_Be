const Category = require("../models/categoriesModel");
const MonthlyMeterData = require("../models/monthlyMeterDataModel");
const Room = require("../models/roomsModel");
const Cost = require("../models/costModel");
const User = require("../models/userModel");
const MonthlyBill = require("../models/monthlyBillModel");
const { hashPass, comparePass } = require("../utils/bcryptPassword");
const CreateToken = require("../utils/createToken");
const mongoose = require("mongoose");
const {
  applyNewTenant,
  applyTenantUpdate,
  applyVacateTenant,
  applyDueAdjustment,
} = require("../modules/occupancy");

//categories
exports.createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res
      .status(201)
      .json({ message: "Category created successfully", category });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating category", error: error.message });
  }
};

exports.getOneCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (category) {
      res.status(200).json(category);
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching category", error: error.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching categories", error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const result = await Category.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    if (result) {
      res
        .status(200)
        .json({ message: "Category updated successfully", category: result });
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating category", error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Category.findByIdAndDelete(id);
    if (result) {
      res.status(200).json({ message: "Category deleted successfully" });
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting category", error: error.message });
  }
};

//Rooms
exports.createRoom = async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json({ message: "Room created successfully", room });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating room", error: error.message });
  }
};

exports.getAllRooms = async (req, res) => {
  try {
    const { roomNo } = req.query;
    if (roomNo) {
      const room = await Room.findOne({ roomNo: parseInt(roomNo) });
      if (room) {
        res.status(200).json(room);
      } else {
        res.status(404).json({ message: "Room not found" });
      }
    } else {
      const rooms = await Room.find();
      res.status(200).json(rooms);
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching rooms", error: error.message });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);
    if (room) {
      res.status(200).json(room);
    } else {
      res.status(404).json({ message: "Room not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching room", error: error.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const result = await Room.findByIdAndUpdate(id, updatedData, { new: true });
    if (result) {
      res
        .status(200)
        .json({ message: "Room updated successfully", room: result });
    } else {
      res.status(404).json({ message: "Room not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating room", error: error.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Room.findByIdAndDelete(id);
    if (result) {
      res.status(200).json({ message: "Room deleted successfully" });
    } else {
      res.status(404).json({ message: "Room not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting room", error: error.message });
  }
};

exports.addLeaseholder = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    const updatedLeaseholders = applyNewTenant(room.leaseholder, req.body);
    room.leaseholder = updatedLeaseholders;
    const result = await room.save();
    res
      .status(200)
      .json({ message: "Leaseholder added successfully", room: result });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding leaseholder", error: error.message });
  }
};

exports.updateLeaseholder = async (req, res) => {
  try {
    const { id, leaseholderId } = req.params; // Room ID and Leaseholder ID
    const updatedLeaseholder = req.body;

    const result = await Room.findOneAndUpdate(
      { _id: id, "leaseholder._id": leaseholderId }, // Match room and leaseholder
      { $set: { "leaseholder.$": updatedLeaseholder } }, // Update specific leaseholder
      { new: true }
    );

    if (result) {
      res
        .status(200)
        .json({ message: "Leaseholder updated successfully", room: result });
    } else {
      res.status(404).json({ message: "Room or Leaseholder not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating leaseholder", error: error.message });
  }
};

exports.vacateLeaseholder = async (req, res) => {
  try {
    const { id, leaseholderId } = req.params;
    const { vacateDate } = req.body;

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const updatedLeaseholders = applyVacateTenant(
      room.leaseholder,
      leaseholderId,
      vacateDate || new Date()
    );
    room.leaseholder = updatedLeaseholders;
    const result = await room.save();

    res.status(200).json({
      message: "Room marked as vacant successfully",
      room: result,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error vacating room", error: error.message });
  }
};

exports.deleteLeaseholder = async (req, res) => {

  try {
    const { id, leaseholderId } = req.params; // Room ID and Leaseholder ID

    const result = await Room.findByIdAndUpdate(
      id,
      { $pull: { leaseholder: { _id: leaseholderId } } }, // Remove the leaseholder by ID
      { new: true } // Return the updated room
    );

    if (result) {
      res.status(200).json({ message: "Leaseholder deleted successfully" });
    } else {
      res.status(404).json({ message: "Room or Leaseholder not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting leaseholder", error: error.message });
  }
};

//MonthlyMeterData
exports.addMonthlyMeterData = async (req, res) => {
  try {
    const { year, month, roomNo, meterNumber } = req.body;
    const filter = { year, month };
    const existingData = await MonthlyMeterData.findOne(filter);

    if (
      existingData &&
      existingData.meterReadings.some((r) => r.roomNo === roomNo)
    ) {
      return res.status(400).json({
        message: "Meter reading already exists for this room and month",
      });
    }

    const update = {
      $push: { meterReadings: { roomNo, meterNumber, createdAt: new Date() } },
    };
    const options = { upsert: true, new: true };

    const result = await MonthlyMeterData.findOneAndUpdate(
      filter,
      update,
      options
    );
    res
      .status(200)
      .json({ message: "Meter reading saved successfully", data: result });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error saving meter reading", error: error.message });
  }
};

exports.getMonthlyData = async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = {};
    if (month) query.month = month;
    if (year) query.year = parseInt(year);

    const data = await MonthlyMeterData.find(query);
    res.status(200).json(data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching monthly data", error: error.message });
  }
};

exports.updateMeterReadingById = async (req, res) => {
  try {
    const { id } = req.params; // Extract the meterReading _id from params
    const { roomNo, meterNumber, month, year } = req.body; // Extract fields from the request body

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ status: "fail", data: "Invalid MongoDB ID" });
    }

    // Find the parent document that contains the specific meterReading _id
    const parentDoc = await MonthlyMeterData.findOne({
      "meterReadings._id": id,
    });

    if (!parentDoc) {
      return res
        .status(404)
        .json({ status: "fail", data: "MeterReading not found" });
    }

    // Update the specific meterReading entry in the array
    const updatedMeterReadings = parentDoc.meterReadings.map((reading) =>
      reading._id.toString() === id
        ? { ...reading.toObject(), roomNo, meterNumber, createdAt: new Date() }
        : reading
    );

    // Update the parent document with the new data
    parentDoc.meterReadings = updatedMeterReadings;
    parentDoc.month = month;
    parentDoc.year = year;

    // Save the updated document
    const updatedDoc = await parentDoc.save();

    res.status(200).json({
      status: "success",
      message: "Meter reading and document updated successfully",
      data: updatedDoc,
    });
  } catch (error) {
    console.error("Error updating meter reading:", error.message);
    res.status(500).json({
      status: "error",
      message: "Error updating meter reading",
      error: error.message,
    });
  }
};

exports.deleteMeterReadingById = async (req, res) => {
  try {
    const { id } = req.params; // Extract the meterReading _id from params

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ status: "fail", data: "Invalid MongoDB ID" });
    }

    // Find the parent document and remove the specific meterReading
    const result = await MonthlyMeterData.findOneAndUpdate(
      { "meterReadings._id": id }, // Find the document containing the specific meterReading
      { $pull: { meterReadings: { _id: id } } }, // Remove the specific meterReading
      { new: true } // Return the updated document
    );

    // If no document is found
    if (!result) {
      return res
        .status(404)
        .json({ status: "fail", data: "MeterReading not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Meter reading deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting meter reading:", error.message);
    res.status(500).json({
      status: "error",
      message: "Error deleting meter reading",
      error: error.message,
    });
  }
};

//Cost
exports.createCost = async (req, res) => {
  try {
    const cost = new Cost({ ...req.body, createdAt: new Date() });
    await cost.save();
    res.status(201).json({ message: "Cost created successfully", cost });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating cost", error: error.message });
  }
};

exports.getAllCosts = async (req, res) => {
  try {
    const costs = await Cost.find().sort({ createdAt: -1 });
    res.status(200).json(costs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching costs", error: error.message });
  }
};

exports.getOneCost = async (req, res) => {
  try {
    const { id } = req.params;
    const cost = await Cost.findById(id);
    if (cost) {
      res.status(200).json(cost);
    } else {
      res.status(404).json({ message: "Cost not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching cost", error: error.message });
  }
};

exports.updateCost = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const result = await Cost.findByIdAndUpdate(id, updatedData, { new: true });
    if (result) {
      res
        .status(200)
        .json({ message: "Cost updated successfully", cost: result });
    } else {
      res.status(404).json({ message: "Cost not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating cost", error: error.message });
  }
};

exports.deleteCost = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Cost.findByIdAndDelete(id);
    if (result) {
      res.status(200).json({ message: "Cost deleted successfully" });
    } else {
      res.status(404).json({ message: "Cost not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting cost", error: error.message });
  }
};

exports.totalMonthlyCost = async (req, res) => {
  try {
    // Get current month name and year
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString("default", {
      month: "long",
    });
    const currentYear = currentDate.getFullYear();

    // Query costs for the current month (string) and year
    const costs = await Cost.find({ month: currentMonth, year: currentYear });

    // Calculate the total amount
    const totalAmount = costs.reduce((sum, cost) => sum + cost.amount, 0);

    res.status(200).json({
      message: "Total monthly cost calculated successfully",
      totalAmount,
      month: currentMonth,
      year: currentYear,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error calculating total monthly cost",
      error: error.message,
    });
  }
};

//User
exports.register = async (req, res) => {
  try {
    const { name, userName, password } = req.body;

    // Check if the userName already exists
    const existingUser = await User.findOne({ userName });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash the password
    const hashedPassword = await hashPass(password);

    // Create a new user
    const user = new User({ name, userName, password: hashedPassword });
    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, userName: user.userName },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

exports.logIn = async (req, res) => {
  try {
    const { userName, password } = req.body;

    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await comparePass(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate a token for the user
    const token = await CreateToken(user.userName);

    res.status(200).json({
      message: "Login successful",
      user: { id: user._id, name: user.name, userName: user.userName },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find the user by username
    const userName = req.headers["userName"];
    const user = await User.findOne({ userName: userName });

    if (!user) {
      return { status: "fail", data: "User not found" };
    }

    // Compare the current password with the stored hashed password
    const isMatch = await comparePass(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash the new password
    const hashedNewPassword = await hashPass(newPassword);

    // Update the user's password
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error changing password", error: error.message });
  }
};

//monthlyBill
exports.createMonthlyBill = async (req, res) => {
  try {
    const { roomNo, month, waterBill, gasBill, paid, year } = req.body;
    console.log(month, year);

    const filter = { year, month };
    const existingData = await MonthlyBill.findOne(filter);
    if (existingData && existingData.bills.some((r) => r.roomNo === roomNo)) {
      return res.status(400).json({
        message: "Monthly bill already exists for this room and month",
      });
    }
    // Fetch the room details
    const room = await Room.findOne({ roomNo });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    if (room.hasWaterBill) {
      console.log("WATER BILL CONFIRMED");
    } else {
      console.log("NO WATER BILL");
    }
    // Fetch rent from the room schema
    const rent = room.rent;

    // // Get the current and previous month details
    // const now = new Date();
    // const currentMonthDate = new Date(now.getFullYear(), now.getMonth()); // October
    // const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1); // September

    const parsedDate = new Date(`${month} 1, ${year}`); // January 1, 2025
    const parsedMonth = parsedDate.getMonth(); // 0 (January)
    const parsedYear = parsedDate.getFullYear(); // 2025

    // Current and previous month logic
    const currentMonthDate = new Date(parsedYear, parsedMonth); // January 2025
    const previousMonthDate = new Date(parsedYear, parsedMonth - 1); // December 2024

    console.log({
      currentMonthDate: currentMonthDate.toString(), // "Wed Jan 01 2025"
      previousMonthDate: previousMonthDate.toString(), // "Sun Dec 01 2024"
    });

    const currentMonth = currentMonthDate.toLocaleString("default", {
      month: "long",
    });
    const currentYear = currentMonthDate.getFullYear();
    console.log("CURR: ", currentMonth, currentYear);
    const previousMonth = previousMonthDate.toLocaleString("default", {
      month: "long",
    });
    const previousYear = previousMonthDate.getFullYear();
    console.log("Prev: ", previousMonth, previousYear);

    let currentBill = 0;
    let curReading = 0;
    let prevReading = 0;
    let waterUnitCost = 0;
    // Calculate current bill based on meter data
    if (room.hasMeter) {
      // Fetch current meter data
      const currentMeterData = await MonthlyMeterData.findOne({
        month: currentMonth,
        year: currentYear,
      });
      if (!currentMeterData) {
        return res.status(404).json({ error: "Current meter data not found" });
      }

      const currentReading = currentMeterData.meterReadings.find(
        (meter) => meter.roomNo === roomNo
      )?.meterNumber;
      const currentWaterReading = currentMeterData.meterReadings.find(
        (meter) => meter.roomNo === "Water Meter (পানি)"
      )?.meterNumber;
      console.log("WaterReading :", currentWaterReading);
      if (!currentReading) {
        return res
          .status(404)
          .json({ error: "Current meter reading not found" });
      }

      // Fetch previous meter data
      const previousMeterData = await MonthlyMeterData.findOne({
        month: previousMonth,
        year: previousYear,
      });
      // Previous code : Lets create monthly data if it finds no data and sets the previous reading to zero

      // const previousReading =
      //   previousMeterData?.meterReadings.find(
      //     (meter) => meter.roomNo === roomNo
      //   )?.meterNumber || 0;

      const previousReading = previousMeterData?.meterReadings.find(
        (meter) => meter.roomNo === roomNo
      )?.meterNumber;
      const previousWaterReading =
        previousMeterData?.meterReadings.find(
          (meter) => meter.roomNo === "Water Meter (পানি)"
        )?.meterNumber || 0;
      if (!previousReading) {
        return res
          .status(404)
          .json({ error: "Previous meter reading not found" });
      }
      // Ensure readings are valid
      if (currentReading >= previousReading) {
        const usage = currentReading - previousReading;

        currentBill = usage * 10; // Multiplication factor
        // Water Meter Electric Bill calculator
        if (room.hasWaterBill) {
          const waterUsage = Math.floor(
            (currentWaterReading - previousWaterReading) / 3
          );
          waterUnitCost = waterUsage * 10; // Multiplication factor
          console.log("Water Floor : ", waterUsage);
          console.log("waterUnitCost :", waterUnitCost);
        }
        curReading = currentReading;
        prevReading = previousReading;
      } else {
        return res.status(400).json({
          error:
            "Invalid meter readings: current reading is less than previous reading",
        });
      }
    }

    const leaseholder = room.leaseholder[0];
    const due = leaseholder.due;
    // Calculate total bill
    const totalBill =
      rent +
      due +
      (room.hasWaterBill ? waterUnitCost : 0) +
      (room.hasGasBill ? gasBill : 0) +
      currentBill;

    // Update the leaseholder's due if unpaid
    if (!paid) {
      const leaseholder = room.leaseholder[0]; // Assuming one leaseholder per room
      if (leaseholder) {
        leaseholder.due += totalBill;
      }
      await room.save();
    }

    // Create a new monthly bill
    // const newBill = new MonthlyBill({

    // });

    // await newBill.save();
    const newFilter = {
      billingMonth: previousMonth,
      billingYear: previousYear,
      month,
      year,
    };

    const update = {
      $push: {
        bills: {
          roomNo,
          rent,
          due,
          currentReading: curReading,
          previousReading: prevReading,
          billingMonth: previousMonth,
          billingYear: previousYear,
          waterBill: room.hasWaterBill ? waterUnitCost : 0,
          gasBill: room.hasGasBill ? gasBill : 0,
          currentBill,
          total: totalBill || 0,
          paid: paid || false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    };
    const options = { upsert: true, new: true };

    const result = await MonthlyBill.findOneAndUpdate(
      newFilter,
      update,
      options
    );
    res.status(201).json({
      message: "Monthly bill created successfully",
      totalBill,
      paid: paid,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the monthly bill" });
  }
};

exports.readMonthlyBill = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await MonthlyBill.findById(id);
    if (!bill) {
      return res.status(404).json({ error: "Monthly bill not found" });
    }

    res.status(200).json(bill);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the monthly bill" });
  }
};

// exports.readAllMonthlyBills = async (req, res) => {
//   try {
//     const bills = await MonthlyBill.find();
//     res.status(200).json(bills);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while fetching all monthly bills" });
//   }
// };

// EDITED CODE BELOW && PREVIOUS CODE ABOVE

exports.readAllMonthlyBills = async (req, res) => {
  try {
    const { month, year } = req.query; // Get month and year from the request query
    console.log(month, year);
    // Create a filter object to apply only if month and year are provided
    const filter = {};
    if (month) filter.billingMonth = month; // Add month to filter if provided
    if (year) filter.billingYear = year; // Add year to filter if provided

    // Fetch the bills from the database, applying the filter if necessary
    const bills = await MonthlyBill.find(filter);

    // Return the filtered bills
    res.status(200).json(bills);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the monthly bills" });
  }
};

exports.updateMonthlyBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { roomNo, waterBill, gasBill, paid, paidAmount } = req.body;

    // Find the parent document that contains the specific bill _id
    const parentBill = await MonthlyBill.findOne({
      "bills._id": id,
    });

    if (!parentBill) {
      return res.status(404).json({ status: "fail", message: "Bill not found" });
    }
    const bill = parentBill.bills.find((b) => b._id.toString() === id);
    if (!bill) {
      return res
        .status(404)
        .json({ status: "fail", message: "Subdocument not found" });
    }

    // Fetch the associated room
    const room = await Room.findOne({ roomNo: bill.roomNo });
    if (!room) {
      return res
        .status(404)
        .json({ error: "Room associated with this bill not found" });
    }

    // Update waterBill and gasBill if provided
    if (waterBill !== undefined) bill.waterBill = waterBill;
    if (gasBill !== undefined) bill.gasBill = gasBill;

    // Handle payment settlement
    if (paidAmount !== undefined && paidAmount !== null && String(paidAmount).trim() !== "") {
      const numericPaidAmount = Number(paidAmount);
      if (isNaN(numericPaidAmount)) {
        return res.status(400).json({ error: "Invalid payment amount. Must be a valid number." });
      }

      // Calculate unpaid difference: bill.total already includes previous running due
      const paymentDifference = bill.total - numericPaidAmount;

      // Settle the monthly bill as PAID
      bill.paid = "true";
      bill.paidAmount = numericPaidAmount;
      bill.updatedAt = new Date();

      // Update the active tenant's running due balance
      const leaseholder = room.leaseholder && room.leaseholder.length > 0 ? room.leaseholder[0] : null;
      if (leaseholder) {
        leaseholder.due = paymentDifference;
        await room.save();
      }
    } else if (paid !== undefined) {
      bill.paid = String(paid);
      bill.updatedAt = new Date();
    }

    // Save the parent document
    await parentBill.save();

    res
      .status(200)
      .json({ message: "Monthly bill updated successfully", bill });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the monthly bill" });
  }
};

exports.calculateMonthlyBills = async (req, res) => {
  try {
    const { billingMonth, billingYear } = req.body;
    console.log(billingMonth, billingYear);
    const bills = await MonthlyBill.find({ billingMonth, billingYear });

    const newBills = bills;
    console.log(newBills[0]?.total);
    // Calculate total monthly bill, paid, and dues
    // Calculate total monthly bill, paid, and dues
    const totalMonthlyBill = newBills.reduce(
      (sum, bill) => sum + bill.total,
      0
    );

    // Check if the bill is paid or partially paid based on the 'paid' string value
    const totalMonthlyPaid = newBills
      .filter((bill) => !bill.paid === false)
      .reduce((sum, bill) => sum + bill.paidAmount, 0);

    const totalMonthlyDues = totalMonthlyBill - totalMonthlyPaid;

    res.status(200).json({
      message: "Monthly bills calculated successfully",
      totalMonthlyBill,
      totalMonthlyPaid,
      totalMonthlyDues,
      billingMonth: billingMonth,
      billingYear: billingYear,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error calculating monthly bills",
      error: error.message,
    });
  }
};
