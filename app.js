const dotenv = require("dotenv");
const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express(); 
var cron = require('node-cron');

dotenv.config();

require('./db/conn');
const User = require('./model/userSchema');
const SureWin = require("./model/surewinScema");

app.use(express.json());
app.use(cors());
// app.use(cron());
app.use(cookieParser());
app.use(bodyParser.json());

// we link the router files to make our route easy 
app.use(require('./router/auth'));

const PORT = process.env.PORT;


// app.get('/', (req, res) => {
//     res.cookie("jwt", 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ');
//     res.send(`Hello world from the server app.js`);
// });

const calculateDailyInterest = async () => {
    try {
        const deposites = await SureWin.find();

        for(const deposit of deposites) {
            const currentTime = new Date();
      const lastCalculationTime = new Date(deposit.lastInterestCalculationDate);

      // Calculate the time difference in days
      const timeDifferenceInDays = (currentTime - lastCalculationTime) / (1000 * 60 * 60 * 24);

      if (timeDifferenceInDays >= 1) {
        // Calculate daily interest (5% of the deposit amount)
        const dailyInterest = deposit.winmoney * 0.05;

        // Update the deposit amount with the daily interest
        deposit.winmoney = parseInt(deposit.winmoney + dailyInterest);

        console.log(deposit.winmoney)

        // Update the lastInterestCalculationDate to the current time
        deposit.lastInterestCalculationDate = currentTime;

        // Save the updated deposit to the database
        await deposit.save();
      }
    }
  } catch (error) {
    console.error('Error calculating daily interest:', error);
  }
}
// Schedule the daily interest calculation every day at 00:00 (midnight)
cron.schedule('0 * * * *', () => {
    console.log('Calculating daily interest...');
    calculateDailyInterest();
});

// app.get('/api/updat', (req, res) => {
//     // Set the appropriate headers for SSE
//     res.setHeader('Content-Type', 'text/event-stream');
//     res.setHeader('Cache-Control', 'no-cache');
//     res.setHeader('Connection', 'keep-alive');
  
//     // Send a dummy SSE message every second
//     const interval = setInterval(() => {
//       const data = { message: 'This is a real-time update.' };
//       res.write(`data: ${JSON.stringify(data)}\n\n`);
//     }, 1000);
  
//     // Clean up the interval when the client closes the connection
//     req.on('close', () => {
//       clearInterval(interval);
//     });
//   });

app.get('/wingo', (req, res) => {
    res.send(`Hello Contact world from the server`);
    
});

app.get('/login', (req, res) => {
    res.cookie("login", 'login');
    res.send(`Hello Login world from the server`);
});

app.get('/signup', (req, res) => {
    res.send(`Hello Registration world from the server`);
});

app.listen(PORT, () => {
    console.log(`server is runnig at port no ${PORT}`);
})