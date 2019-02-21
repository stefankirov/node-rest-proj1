//module to verify the client's token
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) =>{

    //TODO remove this
    //disabling auth if you do not pass token
    //using for temporary dev purposes
    if(req.header.authorization === undefined){
        req.userData = true;
        next();
    } else{
        try {
            const token = req.header.authorization.split(" ")[1];
            console.log(token);
            const decoded = jwt.verify(token, "secret"); //should get secret key from ENV
            req.userData = decoded;
            next();
        } catch (error) {
            return res.status(401).json({
                message: "Auth Failed"
            });
        }
    }
};