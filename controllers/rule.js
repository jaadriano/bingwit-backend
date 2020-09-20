'use strict';

const Sequelize = require('sequelize');
const Rule = require('../models/index').Rule;

//RULES
//view all and count
exports.view_count = async (req, res)=>{
    
    let err, rule, offset, limit;

    if(req.query.offset) offset = parseInt(req.query.offset);
    if(req.query.limit) limit = parseInt(req.query.limit);
    [err, rule] = await to(Rule.findAndCountAll({
        attributes: [
            'id', 
            'description', 
            'createdAt'
        ],
        where:{
            deletedAt: null
        },
        order: [
            ['createdAt', 'ASC']
        ],
        offset,
        limit
    }));
    if (err){
        return ReE(res, err, 500);
    }
    if (!err){
        return ReS(res, {rule}, 201);
    }
};
    
//add
exports.add = async (req, res)=>{
    let err, rule;
    [err, rule] = await to(Rule.create({
        description: req.body.description
    }));
    if (err){
        return ReE(res, err, 500);
    }
    if (!err){
        return ReS(res, {rule}, 201);
    }
};


//edit
exports.edit = async (req, res)=>{
    let err, rule, update;
    [err, rule] = await to(Rule.findOne({
        where:{
            id: req.params.id
        }
    }));
    if (err) return ReE(res, err, 500);
    if (!rule) return ReE(res, {message: 'Rule not found'} , 404);
    
    update = {
        description: req.body.description,
        updatedAt: Sequelize.literal('CURRENT_TIMESTAMP'),
        deletedAt: null
    }

    try {
        await rule.update(update);
        return ReS(res, {rule}, 201);

    } 
    catch (err) {
        return ReE(res, err, 500);
    }
};

//delete
exports.delete = async (req, res)=>{
    let err, rule, remove;
    [err, rule] = await to(Rule.findOne({
        where:{
            id: req.params.id
        }
    }));
    if (err) return ReE(res, err, 500);
    if (!rule) return ReE(res, {message: 'Rule not found'}, 404);

    remove = {
        deletedAt: Sequelize.literal('CURRENT_TIMESTAMP')
    }

    try {
        await rule.update(remove);
        return ReS(res, {rule}, 200);
    } 
    catch (err) {
        return ReE(res, err, 500);
    }
};

