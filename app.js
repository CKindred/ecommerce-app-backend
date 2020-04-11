const express = require('express');
const morgan = require('morgan')
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');
const productRoutes = require('./api/routes/products');
const cartRoutes = require('./api/routes/carts');
const userRoutes = require('./api/routes/users')
const orderRoutes = require('./api/routes/orders');
const wishlistRoutes = require('./api/routes/wishlists');

mongoose.connect(`mongodb+srv://${process.env.MONGO_ATLAS_USER}:${process.env.MONGO_ATLAS_PW}@node-rest-shop-bu5yg.mongodb.net/test?retryWrites=true&w=majority`);


app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'))
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
//forward the requests to their respective handlers
app.use('/products', productRoutes); 
app.use('/carts', cartRoutes);
app.use('/user', userRoutes);
app.use('/orders', orderRoutes);
app.use('/wishlist', wishlistRoutes);
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;