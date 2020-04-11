const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        console.log(token);
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.userData = decoded;
        req.userData.token = token;
        User.findOne({_id: req.userData.userId}).then((result) => {
            if (result.isAdmin === true) {
                req.userData.isAdmin = true;
            } else {
                req.userData.isAdmin = false;
            }
            console.log(req.userData);
            next();
        });
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: "Auth Failed"
        });
    } 
}
