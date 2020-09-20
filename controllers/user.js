'use strict';

const User					= require('../models/index').User;
const Op					= require('sequelize').Op;
const messageBird           = require('../helpers/messageBird');


exports.get_users = async (req, res) => {

	let err, users, q, order, limit, offset;

	q = '';
	if (req.query.q) q = req.query.q;
	if (req.query.limit) limit = parseInt(req.query.limit);
	if (req.query.offset) offset = parseInt(req.query.offset);
	if (req.query.order) {
		order = JSON.parse(req.query.order);
		for(let index in order) order[index] = order[index].split(" ");
	}	

	[err, users] = await to(User.findAndCountAll({
		attributes: [
			'id', 'type', 'full_name', 'username',
			'contact_number', 'address', 'image_url',
			'rating', 'status', 'area_id'	
		],
		where:{
			[Op.or]: [
				{full_name: {[Op.like]: `%${q}%`}},
				{username: {[Op.like]: `%${q}%`}},
				{address: {[Op.like]: `%${q}%`}},
				{rating: {[Op.like]: `%${q}%`}},
				{type: {[Op.like]: `%${q}%`}},
			]
		},
		limit,
		offset,
		order
	}));
	if (err) return ReE(res, err, 500);
	return ReS(res, {users}, 200);
}

exports.get_user = async (req, res) => {

	const data = res.locals.data;
	const type = data.type;

	let err, user;

	if(req.params.id == data.id || type == "admin") {
		
		[err, user] = await to(User.findOne({
			where:{
				id: req.params.id
			},
			// attributes: [
			// 	'id', 'type', 'full_name', 'username',
			// 	'contact_number', 'address', 'image_url',
			// 	'rating', 'status', 'area_id'	
			// ]
		}));		
		
		if(err) return ReE(res, err, 500);
		if(!user) return ReE(res, {message: "User does not exist"}, 400);

		return ReS(res, {user}, 200);

	}

	else return ReE(res, {message: "Forbidden"}, 403);
}

exports.get_user_type = async (req, res) => {

	if(!req.body.username) return ReE(res, {message: "Invalid username"}, 400);

	const data = req.body.username;

	let err, type;

	[err, type] = await to(User.findAll({

		attributes: ['type'],
		where: {
			username: data
		}
	}));

	if(err) return ReE(res, err, 404);

	if(type.length === 0) return ReE(res, {message: "Username does not exist"}, 404);

	type = type[0].dataValues.type;

	if(type) return ReS(res, {type}, 200)
}

exports.get_suspended_users = async (req, res) => {

	let err, users, q, order, limit, offset;

	q = '';
	if (req.query.q) q = req.query.q;
	if (req.query.limit) limit = parseInt(req.query.limit);
	if (req.query.offset) offset = parseInt(req.query.offset);
	if (req.query.order) {
		order = JSON.parse(req.query.order);
		for(let index in order) order[index] = order[index].split(" ");
	}	

	[err, users] = await to(User.findAndCountAll({
		attributes: [
			'id', 'type', 'full_name', 'username',
			'contact_number', 'address', 'image_url',
			'rating', 'status', 'area_id'	
		],
		where:{
			[Op.or]: [
				{full_name: {[Op.like]: `%${q}%`}},
				{username: {[Op.like]: `%${q}%`}},
				{address: {[Op.like]: `%${q}%`}},
				{rating: {[Op.like]: `%${q}%`}},
				{type: {[Op.like]: `%${q}%`}},
			],
			status: 'suspended'
		},
		limit,
		offset,
		order
	}));
	if (err) return ReE(res, err, 500);
	return ReS(res, {users}, 200);
}

exports.update_user = async (req, res) => {
	let err, user, id;

	id = req.params.id;
	if (res.locals.data.id !== id) return ReE(res, 'Forbidden', 403);

	[err, user] = await to(User.findOne({where:{id}}));
	if (err) ReE(res, err, 500);
	if (!user) ReE(res, 'User not found', 400);


	let update = {};
	if (req.body.full_name) update.full_name = req.body.full_name;
	if (req.body.address) update.address = req.body.address;
	if (req.body.image_url) update.image_url = req.body.image_url;
	if (req.body.contact_number) {
		update.contact_number = req.body.contact_number;
		update.status = 'inactive';
        update.verification_code = Math.floor(1000 + Math.random() * 9000);
	}
	
	try {
		await user.update(update,{where:{id}});
		if (req.body.contact_number)
        return messageBird.sendSmsVerificationCode(update.contact_number,
			update.verification_code, 'Verification Code', res);
		return ReS(res, {message: 'Ok'}, 200);
    } 
    catch (err) {
        return ReE(res, err, 500);
    }

}