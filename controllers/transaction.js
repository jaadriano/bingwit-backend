 'use strict';

const Transaction            = require('../models/index').Transaction;
const Transaction_product    = require('../models/index').Transaction_product;
const Product                = require('../models/index').Product;
const User                   = require('../models/index').User;
const uuidv4                 = require('uuid/v4');
const Sequelize              = require('../models/index').Sequelize;
const Op                     = Sequelize.Op;

function extend(obj, src) {
        Object.keys(src).forEach(function(key) { obj[key] = src[key]; });
        return obj;
}

/* Add cart item method */
exports.add_cart_item = async (req, res) => {
    let consumer_user_id     = res.locals.data.id;
    let product_id           = req.body.product_id;
    let quantity             = req.body.quantity;
    let transaction, product, transaction_product, err, update;

    if (!product_id) return ReE(res, {message: 'Product ID not found.'}, 400);
    if (!quantity) return ReE(res, {message: 'Quantity not found.'}, 400);

    /* get product with product_ID */
    [err, product] = await to(Product.findOne({where:{id: product_id, deletedAt: null }}));
    if (err) return ReE(res, err, 400);
    if (!product) return ReE(res, {Success: 'false', message: 'Product not found.'}, 400);
    if(product.stock < quantity) return ReE(res, {Success: 'false', message:'Out of stock.'}, 400);

    /* find current cart by user id */
    [err, transaction] = await to(Transaction.findOne({
        where:{
            consumer_user_id: consumer_user_id, 
            tracking_number: null,
            status: 'cart',
            deletedAt: null
        }
    }));
    if (err) return ReE(res, {err}, 400);

    /* create new transaction cart */
    if (!transaction) {
        let list = {
            consumer_user_id: consumer_user_id,
            producer_user_id: product.producer_user_id,
            address: null,
            status: 'cart',
            tracking_number: null,
            total_amount: product.stock * product.price_per_kilo,
            rating: null,
            comment: null
        };
        [err, transaction] = await to(Transaction.create(list));
        if (err) return ReE(res, {err}, 400);
        if(!transaction) return ReE(res, {Success: 'false', message:'Transaction creation failed.'}, 400);
    }

    /* find existing transaction product for update */
    let condition = {where: {transaction_id: transaction.id, product_id: product.id, deletedAt: null}};
    [err, transaction_product] = await to(Transaction_product.findOne(condition));
    if (err) return ReE(res, {err}, 400);

    if (transaction_product){
        let condition = {where: {transaction_id: transaction.id, product_id: product.id}};
        let update = {quantity: quantity, amount: quantity * product.price_per_kilo};
        [err, transaction_product] = await to(transaction_product.update(update, condition));
        if (!transaction_product) return ReE(res, {Success: 'false', message: 'Transaction Product update failed.'}, 400);
        return ReS(res, {transaction_product}, 201);
    }else{
    /* create transaction product */
        let list = {
            transaction_id: transaction.id, 
            product_id: product.id, 
            quantity: quantity, 
            amount: quantity * product.price_per_kilo
        };        
        [err, transaction_product] = await to(Transaction_product.create(list));

        if (!transaction_product) return ReE(res, {Success: 'false', message:'Transaction product creation failed.'}, 400);        
        return ReS(res, {transaction_product}, 201);
    }
    if(err) return ReE(res, {err}, 400);
}

/* Remove cart item method */
exports.remove_cart_item = async (req, res) => {
    let consumer_user_id       = res.locals.data.id;
    let transaction_product_id = req.params.transaction_product_id;
    let transaction_product, transaction, err, update;
    
    if (!transaction_product_id) return ReE(res, {Success: 'false', message: 'Field validation error'}, 400);
    
    if (res.locals.data.type !== 'consumer') return ReE(res, {message: 'Forbidden'}, 400);

    /* get current transaction cart */
    [err, transaction] = await to(Transaction.findOne({
        where:{
            status: 'cart',
            tracking_number: null,
            deletedAt: null,
            consumer_user_id: consumer_user_id
        }
    }));
    if (!transaction) return ReE(res, {Success: 'false', message: 'Transaction not found.'}, 400);

    /* get transaction product with transaction_product_ID */
    [err, transaction_product] = await to(Transaction_product.findOne({where:{id: transaction_product_id, deletedAt: null}}));
    if (err) return ReE(res, {err}, 400);
    if (!transaction_product) return ReE(res, {Success: 'false', message: 'Transaction Product not found.'}, 400);

    update = {deletedAt: new Date(Date.now())};

    if (transaction_product) {
        [err, transaction_product] = await to(transaction_product.update(update));
        if (err) return ReE(res, {err}, 400);
        if (!transaction_product) return ReE(res, {Success: 'false', message: 'Transaction update failed.'}, 400);
        return ReS(res, {transaction_product}, 201);
    }

    update = {total_amount: transaction.total_amount - (transaction_product.quantity * transaction_product.amount)};

    [err, transaction] = await to(transaction.update(update));
    if (err) return ReE(res, {err}, 400);
    if (!transaction) return ReE(res, {Success: 'false', message: 'Transaction update failed.'}, 400);
    return ReS(res, {transaction_product}, 201);
}

/* Clear cart items method */
exports.clear_cart_items = async (req, res) => {
    let consumer_user_id       = res.locals.data.id;
    let transaction, transaction_product, err, update;

    if(res.locals.data.type !== 'consumer')return ReE(res, {message: 'Forbidden'}, 400);

    /* select user's transaction cart */
    [err, transaction] = await to(Transaction.findOne({
        where:{
            consumer_user_id: consumer_user_id, 
            status: 'cart',
            tracking_number: null,
            deletedAt: null
        }
    }));
    if (!transaction) return ReE(res, {err}, 400);

    /* update deletedAt from all transaction products associated with the transaction id */
    [err, transaction_product] = await to(Transaction_product.update(
        {deletedAt: new Date(Date.now())},
        {where: {transaction_id: transaction.id}}
    ));
    if (err) return ReE(res, {err}, 400);
    if (!transaction_product) return ReE(res, {Success: 'false', message: 'Clear cart failed.'}, 400);
    
    update = {total_amount: 0};
    if (transaction){
        [err, transaction] = await to(transaction.update(update));
        if (err) return ReE(res, {err}, 400);
        return ReS(res, {Success: 'true', message: 'Cart cleared.'}, 201);
    }
    return ReE(res, {Success: 'false', message: 'Transaction update failed.'}, 400);
}

/* Get cart items method */
exports.get_cart_items = async (req, res) => {
    let consumer_user_id     = res.locals.data.id;
    let product, transaction, transaction_product, out_of_stock_transaction_products, offset, limit, err;

    if (res.locals.data.type !== 'consumer') return ReE(res, {message: 'Forbidden'}, 400);

    if (req.query.offset) offset = parseInt(req.query.offset);
    if (req.query.limit)  limit  = parseInt(req.query.limit);

    [err, transaction] = await to(Transaction.findOne({
    where:{
        consumer_user_id: consumer_user_id, 
        tracking_number: null,
        status: 'cart',
        deletedAt: null
    }
    }));

    if (err) return ReE(res, err, 400);
    if (!transaction) return ReE(res, {Success: 'false', message: 'Get transaction failed.'}, 400);
    if (!transaction.id) return ReS(res, {Success: 'true', message: 'Empty Cart.'}, 201);

    if (transaction.id){
        /* get transaction products with transaction_product_ID */
        [err, transaction_product] = await to(Transaction_product.findAndCountAll(
            {
                where:{transaction_id: transaction.id, deletedAt: null}, 
                include: [{ 
                    model: Product,                     
                    attributes: ['image_url', 'name']
                }],
                offset, 
                limit
            }
        ));

        /* Check for out of stock products - begin */
        /* if out of stock ang product, add status: Out of stock */
        for(let index in transaction_product.rows){
            let product_id = transaction_product.rows[index].product_id;
            [err, product] = await to(Product.findOne({where: {id: product_id}}));
            if (err) return ReE(res, err, 400);

            if (product.deletedAt){
                transaction_product.rows[index].dataValues = extend(transaction_product.rows[index].dataValues,{out_of_stock: 'true'});
            }
        }
        /* Check for out of stock products - end */

        if (err) return ReE(res, err, 400);
        if (!transaction_product) return ReE(res, {Success: 'false', message: 'Transaction Product/s not found.'}, 400);
        if (transaction_product) return ReS(res, {transaction_product}, 201);
    }
}

/* Add transaction method */
exports.add_transaction = async (req, res) => {
    let transaction, transaction_product, transaction_products, total_amount, product, user, err, condition, update, shipping_address;
    let consumer_user_id     = res.locals.data.id;
    total_amount           = 0;
    shipping_address         = req.body.shipping_address;

    if (res.locals.data.type !== 'consumer') return ReE(res, {message: 'Forbidden'}, 400);

    if (!shipping_address) return ReE(res, {message: 'Shipping address not found.'}, 400);

    [err, transaction] = await to(Transaction.findOne({
    where:{
        consumer_user_id: consumer_user_id, 
        tracking_number: null,
        status: 'cart',
        deletedAt: null
    }
    }));

    [err, user] = await to(User.findOne({where:{id:consumer_user_id, deletedAt: null}}));
    if (err) return ReE(res, {err}, 500);
    if (!user) return ReE(res, {Success: 'false', message: 'Invalid username.'}, 400);
    shipping_address = user.address;

    if (err) return ReE(res, err, 400);
    if (!transaction) return ReE(res, {Success: 'false', message: 'Get transaction failed.'}, 400);
    if (!transaction.id) return ReS(res, {Success: 'true', message: 'Empty Cart.'}, 201);

    if (transaction.id){
        /* get transaction products with transaction_product_ID */
        [err, transaction_products] = await to(Transaction_product.findAndCountAll({where:{transaction_id: transaction.id, deletedAt: null}}));
        if (err) return ReE(res, {err}, 400);
        if (!transaction_products) return ReE(res, {Success: 'false', message: 'Transaction Product/s not found.'}, 400);

        /* update total amount for checkout */
        /* update product stock */
        /* if out of stock ang product, do not include product na ubos na, add status: Out of stock */
        /* puedeng i-zero ang amount */
        for(let index in transaction_products.rows){
            let product_id = transaction_products.rows[index].product_id;

            condition = {where: {id: product_id, deletedAt: null }};

            [err, product] = await to(Product.findOne(condition));
            if (err) return ReE(res, err, 400);
            if (!product){
                transaction_products.rows[index].dataValues = extend(transaction_products.rows[index].dataValues, {missing_product: 'true'});   
            }else{
                if (product.stock >= transaction_products.rows[index].quantity){
                    /* update transaction total_amount */
                    total_amount = total_amount + transaction_products.rows[index].amount
                    update = {stock: product.stock - transaction_products.rows[index].quantity};
                    /* soft delete if product is now out of stock */
                    if(product.stock - transaction_products.rows[index].quantity == 0){
                        update = {stock: product.stock - transaction_products.rows[index].quantity,
                                    deletedAt: Sequelize.fn('NOW')};
                    }
                    /* update product */
                    [err, product] = await to(product.update(update, condition));
                    if (err)transaction_products.rows[index].dataValues = extend(transaction_products.rows[index].dataValues, {update_error: 'true'});
                    if (!product){
                        transaction_products.rows[index].dataValues = extend(transaction_products.rows[index].dataValues, {product_update: 'false'});
                    }
                }else if(product.stock < transaction_products.rows[index].quantity){
                    /* update transaction product */
                    condition = {where: {id: transaction_products.rows[index].id, deletedAt: null }};
                    update = {quantity: 0, amount: 0};

                    [err, transaction_product] = await to(transaction_products.rows[index].update(update, condition));
                    if (err)transaction_product = extend(transaction_product, {transaction_update_error: 'true'});
                    if (!transaction_product){
                        transaction_product = extend(transaction_product, {transaction_product_update: 'false'});
                    }

                    transaction_products.rows[index].dataValues = extend(transaction_products.rows[index].dataValues, {out_of_stock: 'true'});
                }
            }
        }

        /* update transaction */
        [err, transaction] = await to(transaction.update({
            address: shipping_address,
            status:'order placed',
            tracking_number: uuidv4(),
            total_amount: total_amount
        }));
        if (err) return ReE(res, {err}, 400);
        if (!transaction) return ReE(res, {Success: 'false', message: 'Transaction update failed.'}, 400);
        return ReS(res, {transaction, transaction_products}, 201);
    }
}

/* Get transaction method */
exports.get_transaction = async (req, res) => {
    let transaction_id, transaction, transaction_products, offset, limit, condition, err;
    let user_id         = res.locals.data.id;
    transaction_id      = req.params.transaction_id;

    if (res.locals.data.type == 'admin'){
        condition = {where:{id: transaction_id, total_amount: {[ Op.not ]: 0}}};
    }

    if (res.locals.data.type == 'consumer'){
        condition = {where:{consumer_user_id: user_id, id: transaction_id, total_amount: {[ Op.not ]: 0}, deletedAt: null}, include: [{ 
            model: User,                     
            attributes: ['full_name']
        }]};
    }

    if (res.locals.data.type == 'producer'){
        condition = {where:{producer_user_id: user_id, id: transaction_id, total_amount: {[ Op.not ]: 0}, deletedAt: null}, include: [{ 
            model: User,                     
            attributes: ['full_name']
        }]};
    }

    if (transaction_id){
        /* Get specific transaction details */
        [err, transaction] = await to(Transaction.findOne(condition));
        if (err) return ReE(res, {err}, 400);
        if (!transaction) return ReE(res, {Success: 'false', message: 'Transaction does not exist.'}, 400);
        return ReS(res, {transaction}, 201);        
    }
}

/* Get transaction method */
exports.get_transactions = async (req, res) => {
    let user_id          = res.locals.data.id;
    let transaction, offset, limit, condition, err;

    if (req.query.offset)offset = parseInt(req.query.offset);
    if (req.query.limit)limit = parseInt(req.query.limit);

    if (res.locals.data.type == 'admin'){
        condition = {offset, limit, order: [[ 'createdAt', 'DESC' ]]};
    }

    if (res.locals.data.type == 'consumer'){
        condition = {where:{consumer_user_id: user_id, total_amount: {[ Op.not ]: 0}}, include: [{ 
            model: User,                     
            attributes: ['full_name']
        }], offset, limit, order: [[ 'createdAt', 'DESC' ]]};
    }

    if (res.locals.data.type == 'producer'){
        condition = {where:{producer_user_id: user_id, total_amount: {[ Op.not ]: 0}}, include: [{ 
            model: User,                     
            attributes: ['full_name']
        }], offset, limit, order: [[ 'createdAt', 'DESC' ]]};
    }

    [err, transaction] = await to(Transaction.findAndCountAll(condition));
    if (err) return ReE(res, err, 400);
    if (!transaction) return ReE(res, {Success: 'false', message: 'Transaction does not exist.'}, 400);
    return ReS(res, {transaction}, 201);
}

/* Get transaction method */
exports.get_transaction_items = async (req, res) => {
    let user_id               = res.locals.data.id;
    let transaction_id, transaction, transaction_products, offset, limit, condition, err;
    transaction_id            = req.params.transaction_id;

    if(req.query.offset)offset = parseInt(req.query.offset);
    if(req.query.limit)limit = parseInt(req.query.limit);

    if(res.locals.data.type == 'admin'){
        condition = {where:{id: transaction_id}, offset, limit, order: [[ 'createdAt', 'DESC' ]]};
    }

    if(res.locals.data.type == 'consumer'){
        condition = {where:{consumer_user_id: user_id, id: transaction_id}, include: [{ 
            model: User,                     
            attributes: ['full_name']
        }], offset, limit, order: [[ 'createdAt', 'DESC' ]]};
    }

    if(res.locals.data.type == 'producer'){
        condition = {where:{producer_user_id: user_id, id: transaction_id}, include: [{ 
            model: User,                     
            attributes: ['full_name']
        }], offset, limit, order: [[ 'createdAt', 'DESC' ]]};
    }

    if (transaction_id){
        /* Get specific transaction details */
        [err, transaction] = await to(Transaction.findOne(condition));
        if (err) return ReE(res, {err}, 400);
        if (!transaction) return ReE(res, {Success: 'false', message: 'Transaction does not exist.'}, 400);
        
        [err, transaction_products] = await to(Transaction_product.findAndCountAll(
        {
            where: {transaction_id: transaction.id, 
            quantity:{[ Op.not ]: 0}},
            include: [{ 
                    model: Product,                     
                    attributes: ['image_url', 'name']
            }],
        }));
        if (err) return ReE(res, {err}, 400);
        if (!transaction_products) return ReE(res, {Success: 'false', message: 'Transaction Products not found.'}, 400);
        return ReS(res, {transaction_products}, 201);
    }
}

/* Update producer transaction method */
exports.update_producer_transaction = async (req, res) => {
    let user_id            = res.locals.data.id;
    let transaction, transaction_id, status, update, condition, err;
    transaction_id         = req.params.transaction_id;
    status                 = req.body.status;

    if (!status)return ReE(res, {message: 'Status not found.'}, 400);

    if (res.locals.data.type == 'producer'){
        if(status){
            condition = {where:{producer_user_id: user_id, id: transaction_id}};
            update = {status: status};
        }
    }else return ReE(res, {message: 'Forbidden.'}, 400);

    if(transaction_id){
        /* Get specific transaction details */
        [err, transaction] = await to(Transaction.update(update, condition));
        if (err) return ReE(res, {err}, 400);
        if (!transaction) return ReE(res, {Success: 'false', message: 'Transaction update failed.'}, 400);
        return ReS(res, {transaction}, 201);
    }
}

/* Update consumer transaction method */
exports.update_consumer_transaction_item = async (req, res) => {
    let user_id            = res.locals.data.id;
    let transaction_product, transaction_product_id, status, update, condition, err;

    transaction_product_id = req.params.transaction_product_id;
    
    if (!req.body.rating)return ReE(res, {message: 'Rating not found.'}, 400);
    if (!req.body.comment)return ReE(res, {message: 'Comment not found.'}, 400);

   if (res.locals.data.type == 'consumer'){
        condition = {where:{id: transaction_product_id}};
        update = {rating: req.body.rating, comment: req.body.comment};    
    }else return ReE(res, {message: 'Forbidden.'}, 400);

    if (transaction_product_id){
        /* Get specific transaction details */
        [err, transaction_product] = await to(Transaction_product.update(update, condition));
        if (err) return ReE(res, {err}, 400);
        if (!transaction_product) return ReE(res, {Success: 'false', message: 'Transaction update failed.'}, 400);
        return ReS(res, {transaction_product}, 201);
    }
}

/* Add auction transaction method */
exports.add_auction_transaction = async (req, res) => {
    let id, transaction, product, user, shipping_address, bid_price, transaction_product, err, update;
    let consumer_user_id        = res.locals.data.id;
    id                          = req.params.product_id;
    shipping_address            = req.body.shipping_address;
    bid_price                   = req.body.bid_price;
    
    if (res.locals.data.type !== 'consumer')return ReE(res, {message: 'Forbidden'}, 400);

    if (!shipping_address)return ReE(res, {message: 'Shipping address not found.'}, 400);
    if (!bid_price) return ReE(res, {message: 'Bid price not found.'}, 400);

    /* lookup product */
    [err, product] = await to(Product.findOne({where:{id, deletedAt: null}}));
    if (err) return ReE(res, err, 400);
    if (!product) return ReE(res, {Success: 'false', message: 'Product not found.'}, 400);

    [err, user] = await to(User.findOne({where:{id:consumer_user_id, deletedAt: null}}));
    if (err) return ReE(res, err, 500);
    if (!user) return ReE(res, {Success: 'false', message: 'Invalid username.'}, 400);
    shipping_address = user.address;
    /* create new transaction cart */
    let list = {
        consumer_user_id: consumer_user_id,
        producer_user_id: product.producer_user_id,
        address: shipping_address,
        status: 'order placed',
        tracking_number: uuidv4(),
        total_amount: bid_price
    };

    [err, transaction] = await to(Transaction.create(list));
  
    if (err) return ReE(res, {err}, 400);
    if (!transaction) return ReE(res, {Success: 'false', message: 'Transaction creation failed.'}, 400);

    /* create transaction product */
    list = {
        transaction_id: transaction.id,
        product_id: id,
        quantity: product.stock,
        amount: bid_price
    };
    
    [err, transaction_product] = await to(Transaction_product.create(list));
    if (err) return ReE(res, {err}, 400);
    if (!transaction_product) return ReE(res, {Success: 'false', message: 'Transaction product creation failed.'}, 400);
    
    /* update product stock for auction item */
    update = {stock: 0};
    [err, product] = await to(product.update(update));
    if (err) return ReE(res, {err, message: 'Internal Server Error' }, 500);
    if (!product) return ReE(res, {Success: 'false', message: 'Product update failed.' }, 400);
    return ReS(res, {transaction_product}, 201);
}