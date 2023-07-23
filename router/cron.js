// cron.js
const cron = require('node-cron');
const mongoose = require('mongoose');
const SureWin = require('../model/surewinScema');



// Function to calculate the daily interest and update the deposit amount
const calculateDailyInterest = async () => {
  console.log('Hi')
};

// Schedule the daily interest calculation every day at 00:00 (midnight)
cron.schedule('* * * * *', () => {
  console.log('Calculating daily interest...');
  calculateDailyInterest();
});