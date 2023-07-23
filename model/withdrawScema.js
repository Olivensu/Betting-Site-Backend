const mongoose = require('mongoose');

const withdrawSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    withdraw: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    request: {
        type: String,
        required: true
    }
})

const WithdrawHistory = mongoose.model('withdraw-history', withdrawSchema);

module.exports = WithdrawHistory;