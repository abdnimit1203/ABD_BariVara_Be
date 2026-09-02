const User = require('../models/userModel');

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Self-service profile edit — deliberately excludes `role` and `accountStatus`,
// which only Super Admin can change (see updateUserRole/updateAccountStatus).
exports.updateMyProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name } },
      { new: true, runValidators: true }
    );
    res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: users });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!User.ROLES.includes(role)) {
      return res.status(400).json({ status: 'fail', message: `role must be one of: ${User.ROLES.join(', ')}` });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { role } },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.updateAccountStatus = async (req, res) => {
  try {
    const { accountStatus } = req.body;
    if (!['active', 'disabled'].includes(accountStatus)) {
      return res.status(400).json({ status: 'fail', message: 'accountStatus must be "active" or "disabled"' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { accountStatus } },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
