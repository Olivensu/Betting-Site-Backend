const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
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
    deposite: {
        type: Number,
        required: true
    },
    txnID: {
        type: String,
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

const DepositHistory = mongoose.model('deposite-history', depositSchema);

module.exports = DepositHistory;