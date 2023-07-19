// models/timer.js
const mongoose = require('mongoose');

const timerSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  endTime: {
    type: Number,
    required: true,
  },
});

const Timer = mongoose.model('Timer', timerSchema);

module.exports = Timer;
