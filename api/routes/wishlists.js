const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const checkAuth = require('../middleware/check-auth');
const Wishlist = require('../models/wishlist');

router.post('/', checkAuth, (req, res, next) => {
    Wishlist.find({ user: req.userData.userId }).then(result => {
        console.log('RESULT', result);
        if (result.length === 0) {
            //create a new wishlist for this user
            const wishlist = new Wishlist({
                _id: mongoose.Types.ObjectId(),
                user: req.userData.userId,
                products: req.body.products
            });
            return wishlist.save()
                .then(doc => {
                    console.log(doc);
                    res.status(201).json(doc);
                })
                .catch(err => {
                    console.log(err),
                        res.status(500).json({
                            error: err
                        });
                })
        } else {
            //update existing wishlist
            console.log('GOT ID:', req.body.products[0].productId);
            Wishlist.update(
                { user: req.userData.userId },
                {
                    $push: {
                        products: [{
                            productId: req.body.products[0].productId
                        }
                        ]
                    }
                }
            )
                .then(doc => {
                    console.log(doc);
                    res.status(201).json(doc);
                })
                .catch(err => {
                    res.status(500).json({
                        error: err
                    });
                });
        }
    });
});

router.get('/', checkAuth, (req, res, next) => {
    Wishlist.findOne({ user: req.userData.userId })
        .populate({
            path: 'products.productId',
            model: 'Product'
        })
        .then(result => {
            console.log(result);
            return res.status(200).json(result)
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({
                error: err
            });
        });
});

module.exports = router;