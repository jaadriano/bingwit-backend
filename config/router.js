'use strict';

const importer  = require('anytv-node-importer');
const __        = importer.dirloadSync(__dirname + '/../controllers');

module.exports = (router) => {

    router.get('/', (req, res) => { return ReS(res, {message: 'Welcome to the Bingwit REST API.'}, 200) });
    
    /* Account controller */
	router.post('/users/register',                                                          __.account.register);
    router.post('/users/login',                                                             __.account.login);
    router.post('/users/logout',                                                            __.account.logout);
    router.post('/users/verify',                                    __.auth.verifyToken,    __.account.verify);
    router.put('/users/resendVerificationCode',                     __.auth.verifyToken,    __.account.resend_verification_code);
    router.put('/users/changePassword',                             __.auth.verifyToken,    __.account.change_password);
    router.put('/users/sendPasswordResetCode',                                              __.account.send_password_reset_code);
    router.put('/users/:id/suspend',                                __.auth.verifyAdmin,    __.account.suspend);
    router.post('/users/resetPassword/:resetLink',                                          __.account.reset_password);
    router.post('/users/enterPasswordResetCode',                                            __.account.enter_password_reset_code);
    

    /* User controller */
    router.get('/users/',                                           __.auth.verifyAdmin,    __.user.get_users);
    router.get('/users/suspended',                                  __.auth.verifyAdmin,    __.user.get_suspended_users);
    router.get('/users/:id',                                        __.auth.verifyToken,    __.user.get_user);
    router.put('/users/:id',                                        __.auth.verifyToken,    __.user.update_user);
    router.post('/users/getUserType',                                                       __.user.get_user_type);

    /* Feedback controller */
    router.get('/feedbacks',                                        __.auth.verifyAdmin,    __.feedback.get_all_feedback);
    router.get('/users/:id/feedbacks',                              __.auth.verifyAdmin,    __.feedback.get_user_feedback);
    router.post('/feedbacks',                                       __.auth.verifyToken,    __.feedback.add);
    router.delete('/feedbacks/:id',                                 __.auth.verifyAdmin,    __.feedback.delete_feedback);
    
    /* Report controller*/
    router.get('/reports',                                          __.auth.verifyAdmin,    __.report.get_all_report);
    router.post('/reports',                                         __.auth.verifyConsumer, __.report.add);
    router.delete('/reports/:id',                                   __.auth.verifyAdmin,    __.report.delete_report);
    
    /* Storage controller */
    router.post('/storage/upload',                                  __.auth.verifyToken,    __.storage.upload);

    /* Rules controller */
    router.get('/rules',                                            __.auth.verifyAdmin,    __.rule.view_count);
    router.post('/rules',                                           __.auth.verifyAdmin,    __.rule.add);
    router.put('/rules/:id',                                        __.auth.verifyAdmin,    __.rule.edit);
    router.delete('/rules/:id',                                     __.auth.verifyAdmin,    __.rule.delete);

    /* Cart controller */
    router.get('/cart/products',                                    __.auth.verifyConsumer, __.transaction.get_cart_items);
    router.post('/cart',                                            __.auth.verifyConsumer, __.transaction.add_cart_item);
    router.delete('/cart/products/:transaction_product_id',         __.auth.verifyConsumer, __.transaction.remove_cart_item);
    router.delete('/cart',                                          __.auth.verifyConsumer, __.transaction.clear_cart_items);

    /* Transaction controller */
    router.get('/users/:id/transactions/:transaction_id',           __.auth.verifyToken,    __.transaction.get_transaction);
    router.get('/users/:id/transactions',                           __.auth.verifyToken,    __.transaction.get_transactions);
    router.get('/users/:id/transactions/:transaction_id/products',  __.auth.verifyToken,    __.transaction.get_transaction_items);
    router.post('/transactions',                                    __.auth.verifyConsumer, __.transaction.add_transaction);
    router.put('/transactions/:transaction_id',                     __.auth.verifyProducer, __.transaction.update_producer_transaction);
    router.put('/transactions/:transaction_id/products/:transaction_product_id',            __.auth.verifyConsumer, __.transaction.update_consumer_transaction_item);
    router.post('/transactions/auction/:product_id',                __.auth.verifyConsumer, __.transaction.add_auction_transaction);

    /* Product Type */
    router.get('/product_types',                                                            __.product_type.view_count);
    router.get('/product_types/:id',                                                        __.product_type.view_id);
    router.post('/product_types',                                   __.auth.verifyAdmin,    __.product_type.add);
    router.put('/product_types/:id',                                __.auth.verifyAdmin,    __.product_type.edit);
    router.delete('/product_types/:id',                             __.auth.verifyAdmin,    __.product_type.delete);

    /* Product Auction */
    router.get('/products/auctions',                                                        __.product.get_all_auction_product);
    router.get('/products/auctions/:id',                                                    __.product.get_auction_product);
    router.get('/users/:id/products/auctions',                                              __.product.get_all_producer_auction_product);
    router.post('/products/auctions',                               __.auth.verifyProducer, __.product.add_auction_product); 
    router.put('/products/auctions/:auction_id',                     __.auth.verifyProducer, __.product.update_auction_product);
    router.put('/products/auctions/:auction_id/bought',              __.auth.verifyProducer, __.product.update_auction_product_bought);
    router.delete('/products/auctions/:auction_id',                  __.auth.verifyProducer, __.product.delete_auction_product);
    

    /* Fixed Product */
    router.get('/products',                                                                 __.product.get_all_product);
    router.get('/products/:id',                                                             __.product.get_product);
    router.get('/users/:id/products',                                                       __.product.get_all_producer_product);
    router.post('/products',                                        __.auth.verifyProducer, __.product.add_product);
    router.put('/products/:product_id',                             __.auth.verifyProducer, __.product.edit_product);
    router.put('/products/:product_id/auctions',                    __.auth.verifyProducer, __.product.edit_fix_to_auction);
    router.put('/products/:product_id/auctions/:id',                __.auth.verifyProducer, __.product.edit_auction_to_fix);
    router.delete('/products/:product_id',                          __.auth.verifyProducer, __.product.delete_product);

    /* Product Alias */
    router.get('/product_types/:id/alias',                          __.auth.verifyAdmin,    __.product_alias.get_aliases_by_type);
    router.get('/product_types/:type_id/alias/:id',                 __.auth.verifyAdmin,    __.product_alias.get_alias);
    router.post('/product_types/:id/alias',                         __.auth.verifyAdmin,    __.product_alias.add_alias);
    router.put('/product_types/:type_id/alias/:id',                 __.auth.verifyAdmin,    __.product_alias.update_alias);
    router.delete('/product_types/:type_id/alias/:id',              __.auth.verifyAdmin,    __.product_alias.delete_alias);

    /* Area controller */
    router.get('/area',                                            __.auth.verifyToken,    __.area.view_count);
    router.get('/area/:id',                                        __.auth.verifyToken,    __.area.view_id);
    router.post('/area',                                           __.auth.verifyAdmin,    __.area.add);
    router.put('/area/:id',                                        __.auth.verifyAdmin,    __.area.edit);
    router.delete('/area/:id',                                     __.auth.verifyAdmin,    __.area.delete);


    return router;
}