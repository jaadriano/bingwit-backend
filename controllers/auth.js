'use strict';

const jwt               = require('jsonwebtoken');
const config            = require('../config/configuration');
const User				= require('../models/index').User;

/* Verify jwt middleware */
exports.verifyToken = async (req, res, next) => {
    let err, user;
    let bearerHeader = req.headers['authorization'];
    /* Get auth header value */
    if (typeof bearerHeader === 'undefined') 
        return ReE(res, 'Forbidden.', 403);
    
    /* jwt verify inside try-catch */
    try {
        let token = bearerHeader.split(' ')[1];
        /* set res.locals.data equal to payload */
        res.locals.data = await jwt.verify(token, config.jwt.secret);
        
        [err, user] = await to(User.findOne({
            where:{
                id: res.locals.data.id
            },
        }));		
        if (err) return ReE(res, err, 500);
        if (user.status ===  'suspended')
            return ReE(res, 'Invalid action. Account suspended.', 403);   

        next();
    } catch (error) {
        console.log(error)
        return ReE(res, 'Invalid token.', 400);
    }
};

/* Admin-specific authorization */
exports.verifyAdmin = async (req, res, next) => {
    let err, user;
    let bearerHeader = req.headers['authorization'];
    /* Get auth header value */
    if (typeof bearerHeader === 'undefined') 
        return ReE(res, 'Forbidden.', 403);
    
    /* jwt verify inside try-catch */
    try {
        let token = bearerHeader.split(' ')[1];
        /* set res.locals.data equal to payload */
        res.locals.data = await jwt.verify(token, config.jwt.secret);
        if (res.locals.data.type !== 'admin') 
            return ReE(res, 'Forbidden.', 403);
        
        [err, user] = await to(User.findOne({
            where:{
                id: res.locals.data.id
            },
        }));		
        if (err) return ReE(res, err, 500);
        if (user.status ===  'suspended')
            return ReE(res, 'Invalid action. Account suspended.', 403);   

        next();
    } catch (error) {
        console.log(error)
        return ReE(res, 'Invalid token.', 400);
    }
};

/* Producer-specific authorization */
exports.verifyProducer = async (req, res, next) => {
    let err, user;
    let bearerHeader = req.headers['authorization'];
    /* Get auth header value */
    if (typeof bearerHeader === 'undefined') 
        return ReE(res, 'Forbidden.', 403);
    
    /* jwt verify inside try-catch */
    try {
        let token = bearerHeader.split(' ')[1];
        /* set res.locals.data equal to payload */
        res.locals.data = await jwt.verify(token, config.jwt.secret);
        if (res.locals.data.type !== 'producer') 
            return ReE(res, 'Forbidden.', 403);
        
        [err, user] = await to(User.findOne({
            where:{
                id: res.locals.data.id
            },
        }));		
        if (err) return ReE(res, err, 500);
        if (user.status ===  'suspended')
            return ReE(res, 'Invalid action. Account suspended.', 403);   

        next();
    } catch (error) {
        console.log(error)
        return ReE(res, 'Invalid token.', 400);
    }
};

/* Consumer-specific authorization */
exports.verifyConsumer = async (req, res, next) => {
    let err, user;
    let bearerHeader = req.headers['authorization'];
    /* Get auth header value */
    if (typeof bearerHeader === 'undefined') 
        return ReE(res, 'Forbidden.', 403);
    
    /* jwt verify inside try-catch */
    try {
        let token = bearerHeader.split(' ')[1];
        /* set res.locals.data equal to payload */
        res.locals.data = await jwt.verify(token, config.jwt.secret);
        if (res.locals.data.type !== 'consumer') 
            return ReE(res, 'Forbidden.', 403);
        
        [err, user] = await to(User.findOne({
            where:{
                id: res.locals.data.id
            },
        }));		
        if (err) return ReE(res, err, 500);
        if (user.status ===  'suspended')
            return ReE(res, 'Invalid action. Account suspended.', 403);   

        next();
    } catch (error) {
        console.log(error)
        return ReE(res, 'Invalid token.', 400);
    }
};