const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },

    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

const Product = require('../models/product');

router.get('/', (req, res, next) => {
    console.log(req.query);
    let query = {};
    if (req.query.color) {
        query.color = req.query.color;
    }
    if (req.query.size) {
        query.size = req.query.size;
    }
    if (req.query.wireless) {
        query.wireless = req.query.wireless;
    }
    console.log(query);
    Product.find({ ...query, price: { $lte: req.query.priceMax || 1000000000, $gte: req.query.priceMin || 0 } })

        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs
            }
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post('/', checkAuth, upload.single('productImage'), (req, res, next) => {
    if (req.userData.isAdmin) {
        const product = new Product({
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            price: req.body.price,
            productImage: `${process.env.SERVER_PUBLIC_IP}/${req.file.path}`, 
            color: req.body.color,
            wireless: req.body.wireless,
            size: req.body.size,
            stock: req.body.stock
        });
        product
            .save()
            .then(result => {
                console.log(result);
                res.status(201).json({
                    message: 'Created product successfully',
                    createdProduct: result
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ error: err });
            });
    } else {
        console.log('***Non-admin attemtped to create product***');
        return res.status(403).json({
            message: 'You must be admin to perform this action.'
        });
    }
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .exec()
        .then(doc => {
            console.log("From database", doc);
            if (doc) {
                res.status(200).json(doc);
            } else {
                res.status(404).json({
                    message: "No valid entry found for provided ID"
                });
            }

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

router.delete("/:productId", (req, res, next) => {
    const id = req.params.productId;
    Product.remove({ _id: id }).exec()
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.patch("/:productId", (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json(result);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

module.exports = router;