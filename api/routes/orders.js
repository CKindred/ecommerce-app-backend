const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const checkAuth = require('../middleware/check-auth');

const Order = require('../models/order');
const Cart = require('../models/cart');

router.post('/', checkAuth, (req, res, next) => {
    let cart;
    Cart.findOne({ 'user': req.userData.userId }).then(result => {
        if (!result) {
            console.log('CART NOT FOUND');
            console.log('USER ID:', req.userData.userId);
            return res.status(404).json({
                message: "Cart not found",
                cart: cart
            });
        }
        cart = result._id;
        console.log('Got cart:', cart);
        console.log('COUNTRY:', req.body.country);
        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            address: req.body.address,
            postcode: req.body.postcode,
            town: req.body.town,
            county: req.body.county,
            country: req.body.country,
            cart: cart,
            user: req.userData.userId
        });

        return order.save()
            .then(result => {
                res.status(201).json(result);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                })
            });

    })
        .catch(err => {
            console.log('Cart.findone error', err);
        });


});

router.get('/', checkAuth, (req, res, next) => {
    if (req.userData.isAdmin === true) {
        Order.find()
            .populate({
                path: 'cart',
                model: 'Cart'
            })
            .then(result => {
                return res.status(200).json(result);
            });
    } else {
        console.log('***Non-admin attemtped to view orders***');
        return res.status(403).json({
            message: 'You must be admin to perform this action.'
        });
    }
});

module.exports = router;