const mongoose = require('mongoose');

// Define the Bet schema
const betSchema = new mongoose.Schema({
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
    enum: ['red', 'green', 'blue'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});


const countdownSchema = new mongoose.Schema({
  countdownId: {
  type: Number,
  required: true,
},
secondsLeft: {
  type: Number,
  required: true,
},
  winningColor: { type: String, default: '', },
  status: { type: String, default: 'running' },
  redBetAmount: { type: Number, default: 0 },
  greenBetAmount: { type: Number, default: 0 },
  blueBetAmount: { type: Number, default: 0 },
  bets: [betSchema],
});

// Create the models
const Countdown = mongoose.model('Countdown', countdownSchema);
const Bet = mongoose.model('Bet', betSchema);

module.exports = { Countdown, Bet };