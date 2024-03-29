const mongoose = require('mongoose');
const bcryptjs = require ('bcryptjs') 
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.users_create_signup = (req,res,next) => {
    User.find({email: req.body.email})
    .exec()
    .then(user => {
        if(user.length >= 1){
            return res.status(409).json({
                message: "Email exists."
            });
        }else{
             //create hashed password
        bcryptjs.hash(req.body.email, 10, (err, hash) => {
        if (err){
            return res.status(500).json({
                error: err        
            });
        }else{
            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                email: req.body.email,
                password: hash
                });
                user
                .save()
                .then(result => {
                    console.log(result);
                    res.status(201).json({
                        message: "User Created."
                    })
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });    
            }
   
        })  
        }
    })
}

exports.users_delete_user = (req, res, next) => {
    User.remove({_id: req.params.id})
    .exec()
    .then(result => {
        res.status(200).json({
            message : "User Deleted."
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
}

exports.users_login = (req, res, next) => {
    User.find({email: req.body.email})
    .exec() 
    .then(user => {

        if (user.length < 1){
            return res.status(401).json({
                message: "Auth Failed"
            });
        }
        bcryptjs.compare(req.body.password, user[0].password, (err, result) => {
            if(err){
                return res.status(401).json({
                    message: "Auth Failed"
                });
            }
            if (result){
                
                const token =  jwt.sign({
                    email: req.body.email,
                    userId: user[0]._id
                }, "secret", //should get secret key from ENV config
                {
                    expiresIn: "1h"
                });

                return res.status(200).json({
                    message: "Auth Successful",
                    token: token
                });
            }

            res.status(401).json({
                message: "Auth Failed"
            });
        })

    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
}