const mongoose = require('mongoose');

const countdownSchema = new mongoose.Schema({
  countdownId: { type: String, required: true },
  secondsLeft: { type: Number, required: true },
  winningColor: { type: String, default: null },
  status: { type: String, default: 'running' },
  redBetAmount: { type: Number, default: 0 },
  greenBetAmount: { type: Number, default: 0 },
  blueBetAmount: { type: Number, default: 0 },
});

const Countdown = mongoose.model('Countdown', countdownSchema);

module.exports = Countdown;