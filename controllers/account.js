'use strict';

const bcrypt                = require('bcryptjs');
const jwt                   = require('jsonwebtoken');
const uuidv4                = require('uuid/v4');
const messageBird           = require('../helpers/messageBird');
const User                  = require('../models/index').User;
const Op                    = require('sequelize').Op
const config                = require('../config/configuration');

/* Login method */
exports.login =  async (req, res) => {

    if(!req.body.username || !req.body.password) 
        return ReE(res, 'Invalid username or password', 400);

    let username = req.body.username;
    let password = req.body.password;

    let user, err, bool;

    [err, user] = await to(User.findOne({where:{username}}));
    if (err) return ReE(res, err, 500);
    if (!user) return ReE(res, 'Invalid username.', 400);
    if (user.status === 'suspended') 
        return ReE(res, 'Cannot login. Your account has been suspended.', 400);

    [err, bool] = await to(bcrypt.compare(password, user.password));
    if (err) return ReE(res, err, 500);
    if (!bool) return ReE(res, 'Invalid password.', 400); 

    let payload =  {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        type: user.type,
        status: user.status
    };

    jwt.sign(payload, config.jwt.secret, (err, token) => {
        if (err) return ReE(res, err, 500);
        let data = {token, id: payload.id};
        return ReS(res, data, 200);
    });

}

/* logout method */
exports.logout = (req, res) => {
    return ReS(res, {message: 'Ok'}, 200);
}

/* register new user method */
exports.register = async (req, res) => {
    
    /* set code expiry to 5 minutes */
    let password = req.body.password;
    let expiry_offset = new Date(Date.now());

    expiry_offset.setMinutes(expiry_offset.getMinutes() + 5);
    
    let err, salt, hash, user, users;

    [err, salt] = await to(bcrypt.genSalt(10));
    if (err) return ReE(res, err, 500);
    
    [err, hash] = await to(bcrypt.hash(password, salt));
    if (err) return ReE(res, err, 500);

    let list = {
        type: req.body.type,
        full_name: req.body.full_name,
        address: req.body.address,
        username: req.body.username,
        contact_number: req.body.contact_number,
        password: hash,
        image_url: null,
        status: 'inactive',
        verification_code: Math.floor(1000 + Math.random() * 9000),
        code_expiry: null
    };
    /* Check if username or phone number already exists */
    [err, users] = await to(User.findAll({
        where: {
            username: list.username
        }
    }));
    if (err) return ReE(res, err, 500);
    if (users.length > 0) return ReE(res, 'Username already exists.', 400);

    [err, users] = await to(User.findAll({
        where: {
            contact_number: list.contact_number
        }
    }));

    if (err) return ReE(res, err, 500);
    if (users.length > 0) return ReE(res, 'Phone number already exists.', 400);

    [err, user] = await to(User.create(list));
    if (err) return ReE(res, err, 500);

    return messageBird.sendSmsVerificationCode(user.contact_number, 
        user.verification_code, 'Verification Code', res);

}

/* resend updated attributes */
exports.resend_verification_code = async (req, res) => {

    let err, user, id, update;

    id = res.locals.data.id; 

    
    [err, user] = await to(User.findOne({where:{id}}));
    if (err) return ReE(res, err, 500);
    if (!user) return ReE(res, 'User not found.', 400);
    
    update = {
        verification_code: Math.floor(1000 + Math.random() * 9000), /* update code */
    }

    try {
        await user.update(update,{where:{id}});
        return messageBird.sendSmsVerificationCode(user.contact_number,
            user.verification_code, 'Verification Code', res);
    } 
    catch (err) {
        return ReE(res, err, 500);
    }
    
}

/* verify users */
exports.verify = async (req, res) => {

    /* Check if there is a verification code */
    if (!req.body.verification_code) 
        return ReE(res, 'Invalid verification code.', 400);

    let err, data, user, result;
    data = res.locals.data;

    [err, user] = await to(User.findOne({where:{
        id: data.id
    }}));

    if (err) return ReE(res, err, 500);
    if (!user) return ReE(res, 'Invalid user', 400);

    /* Reject if user already verified */
    if (user.status !== "inactive") 
        return ReE(res, 'Already verified', 400);

    /* Check if verification code matches */
    if (user.verification_code == req.body.verification_code) {
        [err, result] = await to(user.update({status: 'active', verification_code: null}));
        if (err) return ReE(res, err, 500);
        return ReS(res, {message: 'Verified'}, 200);
    }
    else return ReE(res, 'Invalid verification code', 400);

}

exports.change_password = async (req, res) => {

    /* If parameters do not exist */
    if (!req.body.password || !req.body.new_password || !req.body.confirm_new_password) 
        return ReE(res, 'Provide old and new password.', 400);

    /* If new password fields do not match */
    if (req.body.confirm_new_password !== req.body.new_password)
        return ReE(res, 'New password does not match', 400);

    /* If old password and new password are the same */
    if (req.body.password === req.body.new_password)
        return ReE(res, 'Old and new passwords must not be the same.', 400);
    
    let err, user, data, password, 
        salt, bool, hash, new_password,
        result;

    data = res.locals.data;
    password = req.body.password;
    new_password = req.body.new_password;

    [err, user] = await to(User.findOne({where:{
        id: data.id
    }}));
    if (err) return ReE(res, err, 500);
    if (!user) return ReE(res, 'User not found.', 400);

    [err, bool] = await to(bcrypt.compare(password, user.password));
    if (err) return ReE(res, err, 500);
    if (!bool) return ReE(res, 'Invalid password.', 400);

    [err, salt] = await to(bcrypt.genSalt(10));
    if (err) return ReE(res, err, 500);
     
    [err, hash] = await to(bcrypt.hash(new_password, salt));
    if (err) return ReE(res, err, 500);

    [err, result] = await to(user.update({password: hash}));
    if (err) return ReE(res, err, 500);

    return ReS(res, {message: 'Password successfully changed.'}, 200);

}

exports.send_password_reset_code = async (req, res) => {
    
    if (!req.body.contact_number) 
        return ReE(res, 'Invalid contact number.', 400);

    let contact_number, user, err, update; 

    contact_number = req.body.contact_number;

    [err, user] = await to(User.findOne({where:{contact_number}}));
    if (err) return ReE(res, err, 500);
    if (!user) return ReE(res, 'Invalid contact number.', 400);

    let expiry_offset = new Date(Date.now());
    expiry_offset.setMinutes(expiry_offset.getMinutes() + 5);

    update = {
        password_reset_code: Math.floor(1000 + Math.random() * 9000),
        code_expiry: expiry_offset
    }

    try {
        await user.update(update);
        return messageBird.sendSmsVerificationCode(contact_number, 
            update.password_reset_code, 'Reset Password Code', res);
    } 
    catch (err) {
        return ReE(res, err, 500);
    }
}

exports.enter_password_reset_code = async (req, res) => {
    if (!req.body.password_reset_code) 
        return ReE(res, 'Invalid password reset code.', 400);

    let err, user;
    let code = req.body.password_reset_code;

    [err, user] = await to(User.findOne({where:{password_reset_code: code}}));
    if (err) return ReE(res, err, 500);
    if (!user) return ReE(res, 'Invalid password reset code.', 400);

    if (user.code_expiry > Date.now()) {
        let link = uuidv4();
        let update = {
            password_reset_link: link,
            code_expiry: null,
            password_reset_code: null
        }
        await user.update(update)
        return ReS(res, {message: 'Ok', link}, 200);
    }

    return ReE(res, 'Code expired.', 400);
}

exports.reset_password = async (req, res) => {
    
    let err, user, link, salt, hash;
    link = req.params.resetLink;

    [err, user] = await to(User.findOne({where:{password_reset_link: link}}));
    if (err) return ReE(res, err, 500);
    if (!user) return ReE(res, 'Invalid password reset link.', 400);

    let password, confirm_password;

    password = req.body.password;
    confirm_password = req.body.confirm_password;

    if(!password || !confirm_password) 
        return ReE(res, 'Enter new password and confirm password.', 400);

    if (password !== confirm_password) 
        return ReE(res, 'Passwords do not match.', 400);

    [err, salt] = await to(bcrypt.genSalt(10));
    if (err) return ReE(res, err, 500);
     
    [err, hash] = await to(bcrypt.hash(password, salt));
    if (err) return ReE(res, err, 500);

    let update = {
        password: hash,
        password_reset_link: null
    }

    try {
        await user.update(update);
        return ReS(res, {message: 'Password successfully changed.'}, 200);
    } catch (err) {
        if (err) return ReE(res, err, 500);
    }
}

exports.suspend = async (req, res) => {
    let id, err, user, update;

    id = req.params.id;
    [err, user] = await to(User.findOne({where:{id}}));
    if (err) return ReE(res, err, 500);
    if (!user) return ReE(res, {message: 'User not found'}, 404);


    try {

        if (user.status === 'inactive') 
            return ReE(res, {message: 'Cannot suspend, user inactive.'}, 400);
        else if ( user.status === 'deactivated') 
            return ReE(res, {message: 'Cannot suspend, user deactivated.'}, 400);
        else if (user.status !== 'suspended') {
            update = {
                status: 'suspended'
            }
            
            await user.update(update);
            return ReS(res, {message: 'User suspended'}, 200);
        }
        else {
            update = {
                status: 'active'
            }
            
            await user.update(update);
            return ReS(res, {message: 'User suspension revoked'}, 200);
        }
            
    }
    catch(err) {
        return ReE(res, err, 500);
    }
    
}