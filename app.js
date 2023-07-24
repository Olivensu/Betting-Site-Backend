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
const Countdown = require("./model/countdownSchema");

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

let isCountdownRunning = false; // Flag to keep track of the countdown status

// Function to start the countdown
const startCountdown = async (countdownId, durationInSeconds) => {
  if (isCountdownRunning) {
    // If the countdown is already running, skip starting a new countdown
    return;
  }

  isCountdownRunning = true;
  try {
    let countdown = await Countdown.findOne({ countdownId });

    if (!countdown) {
      // If the countdown doesn't exist, create a new one
      countdown = new Countdown({ countdownId, secondsLeft: durationInSeconds });
    }

    // Countdown interval (every second)
    const countdownInterval = setInterval(async () => {
      console.log(`Countdown ${countdown.countdownId} - Time Left: ${countdown.secondsLeft} seconds`);

      countdown.secondsLeft--;

      if (countdown.secondsLeft <= 0) {
        countdown = await Countdown.findOne({ countdownId });
            // Determine the winning color based on the lowest bet amount
      let winningColor = null;
      const colors = ['blue', 'red', 'green'];
      let minBetAmount = Infinity;

      for (const color of colors) {
        console.log(`Comparing ${color} betAmount: ${countdown[color + 'BetAmount']} with minBetAmount: ${minBetAmount}`);
        if (countdown[color + 'BetAmount'] < minBetAmount) {
          minBetAmount = countdown[color + 'BetAmount'];
          winningColor = color;
        }
      }
      console.log(`Winning Color: ${winningColor}`);

      // Update countdown status and winning color
      countdown.status = 'finished';
      countdown.winningColor = winningColor;
      await countdown.save();

        // Determine the winners and losers and update their deposited money accordingly
    const users = await User.find({ betColor: winningColor });
    for (const user of users) {
      user.deposite = parseInt(user.deposite) + parseInt(user.betAmount) * 2; // Double the bet amount for the winners
      user.betColor = null; // Clear the betColor field for all users
      user.betAmount = 0; // Reset the betAmount field for all users
      await user.save();
    }
       
        console.log(`Countdown ${countdown.countdownId} - Time's up!`);
        clearInterval(countdownInterval);

        // Set a delay (e.g., 2 seconds) before allowing a new countdown to start
        setTimeout(() => {
          isCountdownRunning = false; // Reset the flag to allow starting a new countdown
        }, 2000); // 2 seconds delay

        // Start the next countdown after a delay (e.g., 2 seconds) to avoid ParallelSaveError
    setTimeout(() => {
      startCountdown(parseInt(countdown.countdownId) + 1, durationInSeconds);
    }, 2000); // 2 seconds delay before starting the next countdown

      } else {
        await countdown.save();
      }
    }, 1000); // 1 second in milliseconds
  } catch (error) {
    isCountdownRunning = false; // Reset the flag in case of an error
    console.error('Error starting countdown:', error);
  }
};
 // Create a new Date object to get the current date and time
 const currentDate = new Date();
const currentDateOfMonth = currentDate.getDate();
    const currentMonth = currentDate.getMonth() + 1; // Months are zero-based, so we add 1 to get the correct month number
    const currentYear = currentDate.getFullYear();
    const id = currentYear + ''+ currentMonth + '' +currentDateOfMonth + '053'
    console.log(id)

// Start the first countdown with ID 1 and duration of 3 minutes (180 seconds)
startCountdown(id, 180);

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