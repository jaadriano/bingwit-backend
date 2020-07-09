'use strict';

const Sequelize = require('sequelize');
const Product_type_alias = require('../models/index').Product_type_alias;

exports.add_alias = async (req, res) => {

	const aliases = (req.body.aliases).split(',');
	const alias_array = [];
	let err, alias;

	// creates an array of object containing the alias and the product type id
	// as a parameter for bulkCreate function
	const populate = aliases.forEach(async alias => {

		let alias_object = {};
		alias_object['alias'] = alias;
		alias_object['product_typeId'] = req.params.id;

		alias_array.push(alias_object);
	});
	
	[err, alias] = await to(Product_type_alias.bulkCreate(alias_array));

	if(err) return ReE(res, {err}, 500);
	
	return ReS(res, {alias}, 200);
}

exports.get_aliases_by_type = async (req, res) => {
	
	let err, aliases;

	[err, aliases] = await to(Product_type_alias.findAll({

		where: {
			product_typeId: req.params.id,
			deletedAt: null
		}
	}));

	if (err) return ReE(res, {err}, 500);
    return ReS(res, {aliases}, 201);
}

exports.get_alias = async (req, res) => {

	let err, alias;

	[err, alias] = await to(Product_type_alias.findOne({

		where: {
			product_typeId: req.params.type_id,
			id: req.params.id,
			deletedAt: null
		}
	}));

	if(err) return ReE(res, {err}, 500);
	if(!alias) return ReS(res, {message: "Cannot find alias"}, 400);

	return ReS(res, {alias}, 201);
}

exports.update_alias = async (req, res) => {

	let err, alias, updated_alias;

	[err, alias] = await to(Product_type_alias.findOne({

		where: {
			product_typeId: req.params.type_id,
			id: req.params.id,
			deletedAt: null
		}
	}));

	if(err) return ReE(res, {err}, 500);
	if(!alias) return ReS(res, {message: "Cannot find alias"}, 400);

	const updated = {

		alias: req.body.alias
	};

	[err, updated_alias] = await to(alias.update(updated));
	if(err) return ReE(res, {err}, 500);
	return ReS(res, {updated_alias}, 201);
}

exports.delete_alias = async (req, res) => {

	let err, alias, deleted_alias;

	[err, alias] = await to(Product_type_alias.findOne({

		where: {
			id: req.params.id,
			deletedAt: null
		}
	}));

	if(err) return ReE(res, {err}, 500);
	if(!alias) return ReE(res, {message: 'Invalid Alias ID'}, 400);

	const updated = {
		deletedAt: Sequelize.literal('CURRENT_TIMESTAMP')
	};

	[err, deleted_alias] = await to(Product_type_alias.update(updated, {

		where: {
			id: req.params.id,
			deletedAt: null
		}
	}));

	if(err) return ReE(res, {err}, 500);
	return ReS(res, {deleted_alias}, 201);
}