const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false }, quantity: { type: Number, required: false }
        }
    ],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Cart', cartSchema);