const mongoose = require('mongoose');

// Define bet schema

const baccaratBetSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
      },
      countdownId: {
        type: Number,
        required: true,
      },
      color: {
        type: String,
        enum: ['player', 'tie', 'banker'],
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
});

// Define the baccaratCountdown schema

const baccaratCountdownSchema = new mongoose.Schema({
    countdownId:{
        type: Number,
        required: true,
    },
    secondsLeft: {
        type: Number,
        required: true,
    },
    winningColor: {
         type: String,
         default: '',
    },
    status: {
        type: String,
        default: 'running',
    },
    playerBetAmount: {
        type: Number,
        default: 0,
    },
    tieBetAmount: {
        type: Number,
        default: 0,
    },
    bankerBetAmount: {
        type: Number,
        default: 0,
    },
    bets: [baccaratBetSchema],
})

const BaccaratCountdown = mongoose.model('BaccaratCountdown', baccaratCountdownSchema);
const BaccaratBet = mongoose.model('BaccaratBet', baccaratBetSchema);

module.exports = {BaccaratCountdown, BaccaratBet};