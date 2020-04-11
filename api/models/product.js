const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true},
    price: {type: Number, required: true},
    productImage: {type: String, required: true},
    color: {type: String, required: true},
    wireless: {type: Boolean, required: true},
    size: {type: String, required: true},
    stock: {type: Number, required: true}
});

module.exports = mongoose.model('Product', productSchema);