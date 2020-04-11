const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    address: {type: String, required: true},
    town: {type: String, required: true},
    county: {type: String, required: true},
    country: {type: String, required: true},
    postcode: {type: String, requried: true, match: /[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}/g},
    cart: {type: mongoose.Schema.Types.ObjectId, ref: 'Cart', required: true},
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {timestamps: true});

module.exports = mongoose.model('Order', orderSchema);