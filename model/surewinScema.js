const mongoose = require('mongoose');

const sureWinSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true
    },
    deposite: {
        type: Number,
        required: true
    },
    winmoney: {
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
    lastInterestCalculationDate: { type: Date, required: true },
})

const SureWin = mongoose.model('SureWin', sureWinSchema);

module.exports = SureWin;