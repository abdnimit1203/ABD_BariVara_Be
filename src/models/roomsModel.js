const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomsSchema = new Schema({
    roomNo: {type: String, required: true},
    position: { type: String, required: true },
    category: { type: String, required: true },
    hasMeter: { type: Boolean, default: false },
    meterNo: { type: Number, default: null },
    hasWaterBill: { type: Boolean, default: false },
    hasGasBill: { type: Boolean, default: false },
    leaseholder: {
        type: [
            {
                name: { type: String, required: true },
                phoneNumber: { type: String, required: true },
                advance: { type: Number, default: null },
                rentFrom: { type: Date, required: true },
                due: { type: Number, default: 0 },
                rentTo: { type: Date, default: null },
                hasWasteBill: { type: Boolean, default: true },
            }
        ],
        default: null
    },
    rent: { type: Number, required: true },
    // Forward-compat seam for future household room ownership. `null` currently
    // means "not yet assigned to a household" only — no authorization logic
    // reads this field yet.
    ownerId: { type: Schema.Types.ObjectId, ref: 'users', default: null }
}, { versionKey: false });

module.exports = mongoose.model('rooms', roomsSchema);
