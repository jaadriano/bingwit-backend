'use strict';

const User              = require('../models/index').User;
const Feedback          = require('../models/index').Feedback;
const Sequelize         = require('../models/index').Sequelize;
const Op                = Sequelize.Op;
/* test */

/* Get all feedbacks */
exports.get_all_feedback = async (req, res) => {
    
    let err, feedback, offset, limit;

    if(req.query.offset) offset = parseInt(req.query.offset);
    if(req.query.limit) limit = parseInt(req.query.limit);
    [ err, feedback ] = await to(Feedback.findAndCountAll({    
        attributes: [ 'id', 'feedback', 'createdAt'], 
        where: { 
            deletedAt: {[ Op.eq ]: null }            
        }, 
        include: [{ 
            model: User,                     
            attributes: [ 'full_name', 'image_url' ],
            required: true 
        }], 
        where: { deletedAt: {[ Op.eq ]: null }},
        limit,
        offset,
        order: [[ 'createdAt', 'DESC' ]]
    }));
    if (err) return ReE(res, { err, message: 'Internal Server Error' }, 500);
    if (!feedback) return ReE(res, { feedback, message: 'No feedbacks found!' }, 404);
    return ReS(res, { feedback, message: 'Ok' }, 200);
}

/* Get user feedback */
exports.get_user_feedback = async (req, res) => {

    let err, feedback;
    
    [ err, feedback ] = await to(Feedback.findAndCountAll({
        attributes: [ 'id', 'feedback', 'createdAt' ],
        where: {
            user_id: req.params.id,
            deletedAt: {[ Op.eq ]: null },
        }, 
        include: [{
            model: User,
            attributes: [ 'full_name','image_url' ],
            required: true
        }]
    }));
    if (err) return ReE(res, { err, message: 'Internal Server Error' }, 500)
    if (!feedback) return ReE(res, { feedback, message: 'User has no feedback yet' }, 404)
    return ReS(res,{ feedback, message: 'Ok' }, 200) 
} 

exports.add = async (req, res)=>{
    
    let user_id = res.locals.data.id;
    let err, feedback;
    [err, feedback] = await to(Feedback.create({
        feedback: req.body.feedback,
        user_id: user_id
    }));
    if (!err){
        return ReS(res, {feedback}, 200);
    }
    if (err){
        return ReE(res, err, 500);
    }
};

/* Delete feedbacks */
exports.delete_feedback = async (req, res) => {
    
    let err, feedback;

    [ err, feedback ] = await to(Feedback.findOne({ where: { id: req.params.id }}));
    if (err) return ReE(res, { err, message: 'Internal Server Error' }, 500);
    if (!feedback) return ReE(res, { feedback, message: 'Feedback not found' }, 404);

    let del = { deletedAt: Sequelize.fn('NOW') }

    try {
        await feedback.update(del);
        return ReS(res, { feedback, message: 'Ok'}, 200);
    } catch (err) {
        return ReE(res, { err, message: 'Internal Server Error' }, 500);
    }
}
