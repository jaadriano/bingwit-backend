'use strict';

const Sequelize = require('sequelize');
const Product_type = require('../models/index').Product_type;
const Product_type_alias = require('../models/index').Product_type_alias;

//PRODUCT_TYPE
//view all and count
exports.view_count = async (req, res)=>{
    let err, product_type, offset, limit;

    if(req.query.offset) offset = parseInt(req.query.offset);
    if(req.query.limit) limit = parseInt(req.query.limit);

    [err, product_type] = await to(Product_type.findAndCountAll({
        distinct: true,
        where: {
            deletedAt: null
        },
        include: [{
            model: Product_type_alias, as: 'product_type_alias',
            attributes: [
                'id',
                'alias' 
            ],
            where: {
                deletedAt: null
            },
            group: ['product_typeId'],
            required: false
        }],
        order: [
            ['createdAt', 'ASC']
        ],
        offset,
        limit
    }));
    
    if (err) return ReE(res, err, 500);
    return ReS(res, {product_type}, 200);

};

//view one
exports.view_id = async (req, res)=>{
    let err, product_type;
    [err, product_type] = await to(Product_type.findOne({
        attributes: [ 
            'name', 
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
    if (!product_type) return ReE(res, {message: 'Product not found'}, 404);
    return ReS(res, {product_type}, 200);
};
    
//add
exports.add = async (req, res)=>{
    let err, product_type;
    [err, product_type] = await to(Product_type.create({
        name: req.body.name
    }));
    if (err) return ReE(res, err, 500);
    return ReS(res, {product_type}, 200);
};
    
    
//edit
exports.edit = async (req, res)=>{
    let err, product_type, update;
    [err, product_type] = await to(Product_type.findOne({
        where:{
            id: req.params.id
        }
    }));
    if (err) return ReE(res, err, 500);
    if (!product_type) return ReE(res, {message: 'Product type not found.'}, 404);

    update = {
        name: req.body.name,
        updatedAt: Sequelize.literal('CURRENT_TIMESTAMP'),
        deletedAt: null
    }

    try {
        await product_type.update(update);
        return ReS(res, {product_type}, 201);
    } 
    catch (err) {
        return ReE(res, err, 500);
    }
};

//delete
exports.delete = async (req, res)=>{ 
    let err, product_type, remove;
    [err, product_type] = await to(Product_type.findOne({
        where:{
            id: req.params.id
        }
    }));
    if (err) return ReE(res, err, 500);

    remove = {
        deletedAt: Sequelize.literal('CURRENT_TIMESTAMP')
    }

    try {
        await Product_type.update(remove,{where:{id: req.params.id}});
        return ReS(res, {product_type}, 201);
    } 
    catch (err) {
        return ReE(res, err, 500);
    }
};

