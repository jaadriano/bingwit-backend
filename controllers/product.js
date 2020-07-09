'use strict'

const ProductAuction    = require('../models/index').Product_auction;
const ProductType       = require('../models/index').Product_type;
const Product           = require('../models/index').Product;
const User              = require('../models/index').User;
const Area              = require('../models/index').Area;
const Sequelize         = require('sequelize');
const Op                = Sequelize.Op;

/* Get all products */
exports.get_all_product = async (req, res) => {
    
    let err, product;
    
    [ err, product ] = await to(Product.findAndCountAll({
        attributes: [ 'id', 'name', 'image_url', 'stock', 'initial_stock', 'price_per_kilo', 'createdAt'],
        include: [{
            model: User,
            attributes : [ 'id', 'full_name', 'image_url' ],
            include: [{ 
                model: Area, 
                attributes: ['area_address']
            }]
        },{
            model: ProductType,
            attributes: ['id', 'name' ]
        }],
        where: { 
            deletedAt: {[ Op.eq ]: null },
            /* Compares the price of the product, if its null it means that the product is in auction */
            price_per_kilo: {[ Op.not ]: null}
        },
        order: [[ 'createdAt', 'DESC' ]]
    }));
    if (err) return ReE(res,{ err, message: 'Internal Server Error' }, 500)
    if  (!product) return ReE(res,{ message: 'Products not found' }, 404)   
    return ReS(res, { product, message: 'Ok' }, 200)    
}

/* Get one product */
exports.get_product = async (req, res) => {

    let [ err, product ] = await to(Product.find({
        attributes: ['id', 'name', 'image_url', 'stock', 'initial_stock', 'price_per_kilo', 'createdAt'],
        include: [{
            model: User,
            attributes : [ 'id', 'full_name', 'image_url' ],
            include: [{ 
                model: Area, 
                attributes: ['area_address']
            }]
        },{
            model: ProductType,
            attributes: ['id', 'name' ]
        }],
        where: { 
            id: {[ Op.eq ]: req.params.id }},
            deletedAt: {[ Op.eq ]: null }
    }));
    if (err) return ReE(res, { err, message: 'Internal Server Error' }, 500)
    if (!product) return ReE(res, { message: 'Product not found'}, 404)
    return ReS(res, { product, message: 'Ok' }, 200)
}

/* Get all the products of a producer */
exports.get_all_producer_product = async (req, res) => {

    let err, product;

    [ err, product ] = await to(Product.findAndCountAll({

        attributes: ['id', 'name', 'image_url', 'stock', 'price_per_kilo'],
        include: [{
            model: User,
            attributes : [ 'id', 'full_name', 'image_url' ],
            include: [{ 
                model: Area, 
                attributes: ['area_address']
            }]
        },{
            model: ProductType,
            attributes: ['id', 'name' ]
        }],
        where: {
            producer_user_id: {[ Op.eq]: req.params.id },
            /* Compares the price of the product, if its null it means that the product is in auction */
            price_per_kilo: {[ Op.not ]: null },
            deletedAt: {[ Op.eq ]: null }
        }, 
        order: [[ 'createdAt', 'DESC' ]]
    }));
    if (err) return ReE(res, { err, message: 'Internal Server Error' }, 500)
    if (!product) return ReE(res, {message: 'Products not found' }, 400)
    return ReS(res, { product, message: 'Ok' }, 200)
}

/* Get all auction products */
exports.get_all_auction_product = async (req, res) => {

    let err, product;

    [ err, product ] = await to(ProductAuction.findAndCountAll({
        attributes: [ 'id', 'product_id', 'min_price', 'max_price', 'start', 'end' ],
        include: {
            model: Product,
            attributes: [ 'id', 'name', 'image_url', 'stock' ],
            include: [{
                model: ProductType,
                attributes: ['id', 'name' ]
            }, {
                model: User,
                attributes: ['id', 'full_name', 'area_id'],
                include: {
                    model: Area,
                        attributes: [ 'area_address' ]
                }
            }]
        },  
        where: { deletedAt: {[ Op.eq ]: null }},
        order: [[ 'start', 'ASC' ]]
    }));
    if (err) return ReE(res,{ err, message: 'Internal Server Error' }, 500)   
    if (!product) return ReE(res,{ message: 'Products not found' }, 404)
    return ReS(res, { product, message: 'Ok' }, 200)    
}

/* Get an auction product */
exports.get_auction_product = async (req, res) => {
    
    let err, product;

    [ err, product ] = await to(ProductAuction.findOne({
        attributes: [ 'id', 'product_id', 'min_price', 'max_price', 'start', 'end' ],
        include: {
            model: Product,
            attributes: [ 'id', 'name', 'image_url', 'stock' ],
            include: [{
                model: ProductType,
                attributes: ['id', 'name' ]
            }, {
                model: User,
                attributes: ['id', 'full_name', 'area_id'],
                include: {
                    model: Area,
                        attributes: [ 'area_address' ]
                }
            }]
        }, 
        where: {
            id: req.params.id,
            deletedAt: {[ Op.eq ]: null }
        }
    }));
    if (err) return ReE(res,{ err, message: 'Internal Server Error' }, 500); 
    if (!product) return ReE(res,{ message: 'Product not found' }, 404);
    return ReS(res, { product, message: 'Ok' }, 200);    
}

/* Get all auction products of a producer */
exports.get_all_producer_auction_product = async (req, res) => {

    let err, product;

    [ err, product ] = await to(ProductAuction.findAndCountAll({
        attributes: [ 'id', 'product_id', 'min_price', 'max_price', 'start', 'end' ],
        include: {
            model: Product,
            attributes: [ 'id', 'name', 'image_url', 'stock' ],
            include: [{
                model: ProductType,
                attributes: ['id', 'name' ]
            }, {
                model: User,
                attributes: ['id', 'full_name', 'area_id'],
                include: {
                    model: Area,
                        attributes: [ 'area_address' ]
                }
            }],
            where: { producer_user_id: {[ Op.eq ]: req.params.id }}
        }, 
        order: [[ 'start', 'ASC' ]],
        where: { deletedAt: {[ Op.eq ]: null }}   
        
    }));
    if (err) return ReE(res,{ err, message: 'Internal Server Error' }, 500); 
    if (!product) return ReE(res,{ message: 'Product not found' }, 404);
    return ReS(res, { product, message: 'Ok' }, 200);    
}

/* Add an auctioned product*/ 
exports.add_auction_product = async (req, res) => {

    // checkers
    if(!req.body.name || req.body.name == '')                       return ReE(res, {message: 'Name missing'}, 400);
    if(!req.body.stock || req.body.stock == '')                     return ReE(res, {message: 'Stock is missing'}, 400);
    if(!req.body.product_type_id || req.body.product_type_id == '') return ReE(res, {message: 'Product type is missing'}, 400);
    if(!req.body.min_price || req.body.min_price == '')             return ReE(res, {message: 'Minimum price is missing'}, 400);
    if(!req.body.max_price || req.body.max_price == '')             return ReE(res, {message: 'Maximum price is missing'}, 400);
    if(!req.body.start || req.body.start == '')                     return ReE(res, {message: 'Auction start time and date missing'}, 400);
    if(!req.body.end || req.body.end == '')                         return ReE(res, {message: 'Auction end time and date missing'}, 400);
    if(new Date(req.body.start) > new Date(req.body.end))           return ReE(res, {message: 'End time of auction must be later than start time'}, 400);

    let err, product_auction, product;
    
    // Add to products first then add to product auction with the id of the created product as product_id

    [err, product] = await to(Product.create({
        name: req.body.name,
        image_url: req.body.image_url,
        stock: req.body.stock,
        initial_stock: req.body.stock,
        price_per_kilo: null,
        producer_user_id: res.locals.data.id,
        product_type_id: req.body.product_type_id
    }));

    if(err) return ReE(res, {err}, 500);
    if(!product) return ReE(res, {message: 'Product creation failed'}, 400); 

    [err, product_auction] = await to(ProductAuction.create({
        product_id: product.id,
        min_price: req.body.min_price,
        max_price: req.body.max_price,
        start: req.body.start,
        end: req.body.end
    }));

    if(err) return ReE(res, {err, message: 'Internal Server Error'}, 500);
    if(!product_auction) return ReE(res, {err, message: 'Auctioned product creation failed'}, 400);

    return ReS(res, {product_auction}, 200);

}

/* Delete an auctioned product */
exports.delete_auction_product = async (req, res) => {

    let err, auction, deleted_auction, deleted_product;

    // Check first if the auctioned product to be deleted is existing in the database
    [err, auction] = await to(ProductAuction.findOne({

		where: {
			id: req.params.auction_id,
			deletedAt: null
		}
    }));
    
    if(err) return ReE(res, {err}, 500);
    if(!auction) return ReE(res, {message: 'Auction product not found'}, 400);

    const updated = {
        deletedAt: Sequelize.literal('CURRENT_TIMESTAMP')
    };

    [err, deleted_auction] = await to(auction.update(updated));

    if(err) return ReE(res, {err}, 500);
    if(!deleted_auction) return ReE(res, {message: 'Product auction delete failed'}, 400);
    
    [err, deleted_product] = await to(Product.update(updated, {
        where: {
            id: auction.product_id,
            deletedAt: null
        }
    }));

    if(err) return ReE(res, {err}, 500);
    if(!deleted_product) return ReE(res, {message: 'Product delete failed'}, 400);
    return ReS(res, {deleted_product, message: "Ok"}, 200);
}
/* Update the info of an auction product */
exports.update_auction_product = async (req, res) => {

    // checkers
    if(!req.body.name || req.body.name == '')                       return ReE(res, {message: 'Name missing'}, 400);
    if(!req.body.stock || req.body.stock == '')                     return ReE(res, {message: 'Stock is missing'}, 400);
    if(!req.body.product_type_id || req.body.product_type_id == '') return ReE(res, {message: 'Product type is missing'}, 400);
    if(!req.body.min_price || req.body.min_price == '')             return ReE(res, {message: 'Minimum price is missing'}, 400);
    if(!req.body.max_price || req.body.max_price == '')             return ReE(res, {message: 'Maximum price is missing'}, 400);
    if(!req.body.start || req.body.start == '')                     return ReE(res, {message: 'Auction start time and date missing'}, 400);
    if(!req.body.end || req.body.end == '')                         return ReE(res, {message: 'Auction end time and date missing'}, 400);
    if(req.body.start > req.body.end)                               return ReE(res, {message: 'End time of auction must be later than start time'}, 400);

    let err, auctioned_product, result_product, result_auction;

    [err, auctioned_product] = await to(ProductAuction.findOne({
        where: {
            id: req.params.auction_id,
            deletedAt: null
        }
    }));

    if(err) return ReE(res, {err}, 500);
    if(auctioned_product == null) return ReE(res, {message: 'Error in fetching auctioned product to be updated'}, 400);

    // Cannot edit product when auction already started
    if(auctioned_product.start <= Date.now()) return ReE(res, {message: 'Cannot edit auctioned product when auction already started'}, 500);

    if(auctioned_product) {

        const updated_product = {
            name: req.body.name,
            image_url: req.body.image_url,
            stock: req.body.stock,
            initial_stock: req.body.stock,
            price_per_kilo: null,
            producer_user_id: res.locals.data.id,
            product_type_id: req.body.product_type_id
        };
    
        [err, result_product] = await to(Product.update(updated_product, {
            where: {
                id: auctioned_product.product_id,
                deletedAt: null
            }
        }));
    
        if(err) return ReE(res, {err}, 500);
        if(!result_product) return ReE(res, {message: 'Failed to update product'}, 400);
    
        if(result_product) {
    
            const updated_auction = {
                product_id: result_product.id,
                min_price: req.body.min_price,
                max_price: req.body.max_price,
                start: req.body.start,
                end: req.body.end
            };
    
            [err, result_auction] = await to(auctioned_product.update(updated_auction));
    
            if(err) return ReE(res, {err}, 500);
            if(!result_auction) return ReE(res, {message: 'Failed to update auction'}, 400);
    
            return ReS(res, {result_auction}, 200);
        }
    }
}

/* Update auction set now to end if bought */
exports.update_auction_product_bought = async (req, res) => {   

    let err, auctioned_product, updated_auction;

    [err, auctioned_product] = await to(ProductAuction.findOne({
        where: {
            id: req.params.auction_id,
            deletedAt: null
        }
    }));

    if(err) return ReE(res, {err}, 500);
    if(auctioned_product == null) return ReE(res, {message: 'Failed to fetch auctioned product'});

    if(auctioned_product) {

        [err, updated_auction] = await to(auctioned_product.update( {end: Date.now()}));

        if(err) return ReE(res, {err}, 500);
        if(updated_auction == null) return ReE(res, {message: 'Failed to update auction product'}, 400);

        return ReS(res, {updated_auction, message: 'Product auction bought'}, 200);
    }
}

/* Add producer fixed price product */
exports.add_product = async (req, res) => {

    let err, product,
        user_id = res.locals.data.id;

    if (!req.body.name)             return ReE(res, { message: 'name field not found' },             404);
    if (!req.body.stock)            return ReE(res, { message: 'stock field not found' },            404);
    if (!req.body.price_per_kilo)   return ReE(res, { message: 'price_per_kilo field not found' },   404);
    if (!req.body.product_type_id)  return ReE(res, { message: 'product_type_id field not found' },  404);

    [ err, product ] = await to(Product.create({
        name: req.body.name,
        image_url: req.body.image_url,
        stock: req.body.stock,
        initial_stock: req.body.stock,
        price_per_kilo: req.body.price_per_kilo,
        producer_user_id: user_id,

        product_type_id: req.body.product_type_id
    }));
    if (err) return ReE(res, { err, message: 'Internal Server Error' }, 500)
    if (!product) return ReE(res, { message: 'Product failed to add' }, 400)
    return ReS(res, { product, message: 'Ok' }, 200)
}

/* Edit product */
exports.edit_product = async (req, res) => {

    let err, product, update, 
        user_id = res.locals.data.id,
        product_id = req.params.product_id;

    if (!req.body.name)             return ReE(res, { message: 'name field not found' },            404);
    if (!req.body.price_per_kilo)   return ReE(res, { message: 'price_per_kilo field not found' },  404);

    [ err, product ] = await to(Product.findOne({ 
        where: { 
            id: product_id,
            producer_user_id: {[ Op.eq ]: user_id },
            deletedAt: {[ Op.eq ]: null }
        }
    }));
    if (err) return ReE(res, { err, message: 'Internal Server Error' }, 500);
    if (!product) return ReE(res, { message: 'Product not found' }, 404);
    
    update = {
        name: req.body.name,
        image_url: req.body.image_url,
        price_per_kilo: req.body.price_per_kilo
    }

    try {
        await product.update(update);    
        return ReS(res, { product, message: 'Ok' }, 200);
    } catch (err) {
        return ReE(res, { err, message: 'Internal Server Error' }, 500);
    }
}

/* Edit product from auction to fixed price */
exports.edit_auction_to_fix = async (req, res) => {

    let err, auction_product, product, 
        delete_auction_product, update_to_fixed;
        
    let user_id = res.locals.data.id,
        auction_id = req.params.id,
        product_id = req.params.product_id;

    /* Find product if it's already in auction */
    [ err, product] = await to(Product.findOne({
        where: {
            id: product_id,
            price_per_kilo: {[ Op.eq ]: null},
            producer_user_id:{[ Op.eq ]: user_id },
            deletedAt: {[ Op.eq ]: null}
        }
    }));
    if (err) return ReE(res, { err, message: 'Internal Server Error' }, 500);
    if (!product) return ReE(res, { message: 'Forbidden / Product is already fixed price' }, 403);

    update_to_fixed = { price_per_kilo: req.body.price_per_kilo }
    delete_auction_product = { deletedAt: Sequelize.fn('NOW') } 

    /* If the product is in auction then it will be soft-deleted */
    if(product) {

        /* Required field validator for fix price field */
        if (!req.body.price_per_kilo || req.body.price_per_kilo == '') return ReE(res, { message: 'price_per_kilo not found' }, 403);

        /* Find the auctioned product to be soft-deleted */
        [ err, auction_product ] = await to(ProductAuction.findOne({ 
            where: { 
                id: auction_id,
                product_id: product_id,
                deletedAt: {[ Op.eq ]: null}
            }
        }));
        if (err) return ReE(res, { err, message: 'Internal Server Error' }, 500);
        if (!auction_product) return ReE(res, { message: 'Product auction not found' }, 404);

        /* It will ask for price per kilo to update the product for fixed pricing */
        try {
            await auction_product.update(delete_auction_product);
            await product.update(update_to_fixed);
            return ReS(res, { auction_product, product, message: 'Ok' }, 200);
        } catch (err) {
            return ReE(res, { err, message: 'Internal Server Error'}, 500);
        }
    } 
}

/* Edit product from fix to auction */
exports.edit_fix_to_auction = async (req, res) => {

    let err, auction_product, product, 
        update_to_auction, create_auction;
        
    let user_id = res.locals.data.id,
        product_id = req.params.product_id;

    /* Required field validators for auction fields */
    if(new Date(req.body.start) > new Date(req.body.end)) return ReE(res, { message: 'End time of auction must be later than start time' }, 400);    
    if(!req.body.end || req.body.end === '')               return ReE(res, { message: 'Auction end and start time and date is missing' }, 400);
    if(!req.body.start || req.body.start === '')           return ReE(res, { message: 'Auction start time and date missing' }, 400);
    if(!req.body.min_price || req.body.min_price === '')   return ReE(res, { message: 'Minimum price is missing' }, 400);
    if(!req.body.max_price || req.body.max_price === '')   return ReE(res, { message: 'Maximum price is missing' }, 400);

    /* Find product if it's already fixed price */
    [ err, product ] = await to(Product.findOne({ 
        where: { 
            id: product_id,
            price_per_kilo: {[ Op.not ]: null},
            producer_user_id: {[ Op.eq ]: user_id },
            deletedAt: {[ Op.eq ]: null}
        }
    }));
    if (err) return ReE(res, { err, message: 'Internal Server Error' }, 500);
    if (!product) return ReE(res, { message: 'Product is already in auction' }, 400);

    create_auction = {
        product_id: req.params.product_id,
        min_price: req.body.min_price,
        max_price: req.body.max_price,
        start: req.body.start,
        end: req.body.end,
        product_type_id: req.body.product_type_id,
    }

    update_to_auction = { price_per_kilo: null }

    /* If the product is fixed price then it will set its price to null */
    if (product) {

        /* This will create another entry in poruct auction */
        [ err, auction_product] = await to(ProductAuction.create(create_auction, {
            where: { product_id: {[ Op.not]: product_id }}
        }));
        if (err) return ReE(res, { err, message: 'Internal Server Error' }, 500);
        if (!auction_product) return ReE(res, { message: 'Product edit failed' }, 403);
        
        /* It will ask for auction field attributes */
        try {
            await product.update(update_to_auction);
            return ReS(res, { product, auction_product, message: 'Ok' }, 200);
        } catch (err) {
            return ReE(res, { err, message: 'Internal Server Error' }, 500);
        }
    } 
}

/* Delete product */
exports.delete_product = async (req, res) => {

    let err, product, delete_product,
        user_id = res.locals.data.id,
        product_id = req.params.product_id;

    [ err, product ] = await to(Product.findOne({ 
        where: { 
            id: product_id,
            producer_user_id: user_id,
            deletedAt: null
        }
    }));
    if (err) return ReE(res, { err, message: 'Internal Server Error' }, 500);
    if (!product) return ReE(res, { message: 'Product not found' }, 404);

    delete_product = { deletedAt: Sequelize.fn('NOW') }

    try {
        await product.update(delete_product);
        return ReS(res, { product, message: 'Ok' }, 200);
    } catch (err) {
        return ReE(res, { err, message: 'Internal Server Error'}, 500);
    }
}