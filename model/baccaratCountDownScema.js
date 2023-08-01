const mongoose = require('mongoose');

// Define bet schema

const betSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
      },
      color: {
        type: String,
        enum: ['red', 'green', 'blue'],
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
    bets: [betSchema],
})

const BaccaratCountdown = mongoose.model('BaccaratCountdown', baccaratCountdownSchema);
// const Bet