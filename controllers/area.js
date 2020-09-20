'use strict';

const Sequelize = require('sequelize');
const Area = require('../models/index').Area;

//RULES
//view all and count
exports.view_count = async (req, res)=>{
    
    let err, area, offset, limit;

    if(req.query.offset) offset = parseInt(req.query.offset);
    if(req.query.limit) limit = parseInt(req.query.limit);
    [err, area] = await to(Area.findAndCountAll({
        attributes: [
            'id', 
            'area_address', 
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
        return ReS(res, {area}, 201);
    }
};

exports.view_id = async (req, res)=>{
    let err, area;
    [err, area] = await to(Area.findOne({
        attributes: [ 
            'area_address', 
            'createdAt'
        ],
        where:{
            id: req.params.id,
            deletedAt: null
        },
        order: [
            ['createdAt', 'ASC']
        ]
    }));
    if (err) return ReE(res, err, 500);
    if (!area) return ReE(res, {message: 'Area not found'}, 404);
    return ReS(res, {area}, 200);
};
    
//add
exports.add = async (req, res)=>{
    let err, area;
    [err, area] = await to(Area.create({
        area_address: req.body.area_address
    }));
    if (err){
        return ReE(res, err, 500);
    }
    if (!err){
        return ReS(res, {area}, 201);
    }
};


//edit
exports.edit = async (req, res)=>{
    let err, area, update;
    [err, area] = await to(Area.findOne({
        where:{
            id: req.params.id
        }
    }));
    if (err){
        return ReE(res, err, 500);
    }
    
    update = {
        area_address: req.body.area_address,
        updatedAt: Sequelize.literal('CURRENT_TIMESTAMP'),
        deletedAt: null
    }

    try {
        await Area.update(update,{where:{id: req.params.id}});
        if (!err){
            return ReS(res, {area}, 201);
        }
    } 
    catch (err) {
        return ReE(res, err, 500);
    }
};

//delete
exports.delete = async (req, res)=>{
    let err, area, remove;
    [err, area] = await to(Area.findOne({
        where:{
            id: req.params.id
        }
    }));
    if (err) return ReE(res, err, 500);
    
    remove = {
        deletedAt: Sequelize.literal('CURRENT_TIMESTAMP')
    }

    try {
        await Area.update(remove,{where:{id: req.params.id}});

        return ReS(res, {area}, 201);
    } 
    catch (err) {
        return ReE(res, err, 500);
    }
};

