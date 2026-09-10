const User = require('../models/user.model');

const create = (data) => User.create(data);
const findByEmail = (email) => User.findOne({ email });
const findById = (id) => User.findById(id).select('-password');
const updateById = (id, data) => User.findByIdAndUpdate(id, data, { new: true }).select('-password');

module.exports = { create, findByEmail, findById, updateById };