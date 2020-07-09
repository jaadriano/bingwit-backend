'use strict'

const Report            = require('../models/index').Report;
const User              = require('../models/index').User;
const Sequelize         = require('../models/index').Sequelize;
const Op                = Sequelize.Op;

/* Get all reports */
exports.get_all_report = async (req, res) => {

    let err, report, offset, limit;

    if(req.query.offset) offset = parseInt(req.query.offset);
    if(req.query.limit) limit = parseInt(req.query.limit);

    [ err, report ] = await to(Report.findAndCountAll({
        attributes: [ 'id', 'feedback', 'createdAt'],
        where : {
            deletedAt: {[ Op.eq ]: null }
        },
        include: [{
                model: User,
                as: 'producer',
                attributes: ['id', 'full_name', 'image_url' ],
            }, {
                model: User, 
                as: 'consumer',
                attributes: [ 'id', 'full_name', 'image_url' ],
            }
        ],
        offset,
        limit,
        order: [[ 'createdAt', 'DESC' ]]
    }));
    if (err) return ReE(res, { err, message: 'Internal Server Error' }, 500)
    if (!report) return ReE(res, { message: 'No reports found!' }, 404)
    return ReS(res, { report, message: 'Ok' }, 200)       
}

/* Get user report */
exports.get_user_report = async (req, res) => {

    let err, report;

    [ err, report ] = await to(Report.findAndCountAll({
        attributes: [ 'id', 'feedback', 'createdAt' ],
        where: {
            consumer_id: req.params.id,
            deletedAt: {[ Op.eq ]: null }
        },
        include: [{
                model: User,
                as: 'producer',
                attributes: ['id', 'full_name', 'image_url' ],
            }, {
                model: User, 
                as: 'consumer',
                attributes: [ 'id', 'full_name', 'image_url' ],
            }
        ]
    }));
    if (err) return ReE(res, { err, message: 'Internal Server Error' }, 500)
    if (!report) return ReE(res, { message: 'No reports found!' }, 404)
    return ReS(res, { report, message: 'Ok' }, 200)       
}

exports.add = async (req, res)=>{

    let consumer_id = res.locals.data.id;
    let err, producer_id, report;
    [err, producer_id] = await to(User.findOne({
        where:{
            id: req.body.producer_id
        }
    }));
    if (err){
        return ReE(res, err, 500);
    }

    [err, report] = await to(Report.create({
        feedback: req.body.feedback,
        producer_id: req.body.producer_id,
        consumer_id: consumer_id
    }));
    if (!err){
        return ReS(res, {report}, 200);
    }
    if (err){
        return ReE(res, err, 500);
    }
};

/* Delete report */
exports.delete_report = async (req, res) => {
    
    let err, report;

    [ err, report ] = await to(Report.findOne({ where: { id: req.params.id }}));
    if (err) return ReE(res, { err, message: 'Internal Server Error' }, 500);
    if (!report) return ReE(res, { report, message: 'Report not found' }, 404);

    let del = { deletedAt: Sequelize.fn('NOW') }

    try {
        await report.update(del);
        return ReS(res, { report, message: 'Ok'}, 200);
    } catch (err) {
        return ReE(res, { err, message: 'Internal Server Error' }, 500);
    }
}
