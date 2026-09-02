const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ROLES = ['superadmin', 'admin', 'household', 'tenant'];

const userSchema = new Schema({
    name: { type: String, required: true},
    // Legacy bcrypt-based auth fields — optional going forward, kept for existing accounts.
    userName: { type: String },
    password: { type: String },
    // Firebase-backed identity fields.
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    firebaseUid: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ROLES, default: 'tenant' },
    accountStatus: { type: String, enum: ['active', 'disabled'], default: 'active' },
},{versionKey: false, timestamps: true});

const User = mongoose.model('users', userSchema);
User.ROLES = ROLES;

module.exports = User;