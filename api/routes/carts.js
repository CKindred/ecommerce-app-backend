const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const checkAuth = require('../middleware/check-auth');
const Cart = require('../models/cart');
const Product = require('../models/product');

router.post('/', checkAuth, (req, res, next) => { 
    req.body.products.map(product => {
        Product.findById(product)
            .then(result => {
                if (!result) {
                    return res.status(404).json({
                        message: "Product not found",
                        product: product
                    });
                }
            });
    });

    const cart = new Cart({
        _id: mongoose.Types.ObjectId(),
        products: req.body.products,
        user: req.userData.userId,
    });
    return cart.save()

        .then(result => {
            console.log(result);
            res.status(201).json(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });

});

router.get('/', (req, res, next) => {
    Cart.find()
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                carts: docs
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

router.get("/single", checkAuth, (req, res, next) => {
    Cart.findOne({ user: req.userData.userId })
        .select('_id products quantity')
        .populate({
            path: 'products.productId',
            model: 'Product'
        })
        .exec()
        .then(cart => {
            res.status(200).json(cart);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

router.delete("/:cartId", (req, res, next) => {
    Cart.remove({ _id: req.params.cartId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Cart deleted'
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

router.patch('/:cartId', checkAuth, (req, res, next) => { //only add one product
    Cart.findById(req.params.cartId)
        .then(result => {
            if (!result) {
                return res.status(404).json({
                    message: "Cart not found",
                    cart: req.params.cartId
                });
            }
        });

    Product.findById(req.body.product)
        .then(result => {
            if (!result) {
                return res.status(404).json({
                    message: "Product not found",
                    product: req.body.product
                });
            }
        });
    console.log('cartId:', req.params.cartId);
    Cart.update({ _id: req.params.cartId },
        {
            $push: {
                products: [
                    {
                        productId: req.body.product,
                        quantity: req.body.quantity
                    }
                ]
            }
        })
        .then(result => {
            Product.update({_id: req.body.product}, {
                $inc: {quantity: -1},
                $push: {
                    in_carts: {
                        quantity: 1, id: req.userData.token, timestamp: new ISODate()
                    }
                }
            })
            res.status(200).json({
                result: result
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

module.exports = router;