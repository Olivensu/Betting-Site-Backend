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
const {Countdown} = require("./model/countdownSchema");

app.use(express.json());
app.use(cors());
// app.use(cron());
app.use(cookieParser());
app.use(bodyParser.json());

// we link the router files to make our route easy 
app.use(require('./router/auth'));
app.use(require('./router/baccarat'));

const PORT = process.env.PORT;


// app.get('/', (req, res) => {
//     res.cookie("jwt", 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ');
//     res.send(`Hello world from the server app.js`);
// });

// Function to start a new countdown after a delay
const startNextCountdown = async (durationInSeconds) => {
  const currentDate = new Date();
  let currentDateOfMonth = currentDate.getDate();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const currentHour = currentDate.getHours();
  const currentMinute = currentDate.getMinutes();

  const formattedHour = currentHour.toString().padStart(2, '0');
  const formattedMinute = currentMinute.toString().padStart(2, '0');
  if(currentDateOfMonth<10){
    currentDateOfMonth= '0' + currentDateOfMonth;
  }

  const id = currentYear + '' + currentMonth + '' + currentDateOfMonth + '' + formattedHour + '' + formattedMinute;

  await startCountdown(parseInt(id), durationInSeconds);
};

let isCountdownRunning = false;
let isCountdownProcessing = false; // New flag to prevent overlapping interval processing

const startCountdown = async (countdownId, durationInSeconds) => {
  if (isCountdownRunning) {
    return;
  }

  isCountdownRunning = true;

  try {
    let countdown = await Countdown.findOne({ countdownId });

    if (!countdown) {
      countdown = new Countdown({ countdownId, secondsLeft: durationInSeconds });
      await countdown.save();
    }

    const countdownInterval = setInterval(async () => {
      // Check if the countdown is currently being processed
      if (isCountdownProcessing) {
        return;
      }

      isCountdownProcessing = true;

      console.log(`Countdown ${countdown.countdownId} - Time Left: ${countdown.secondsLeft} seconds`);
      countdown.secondsLeft--;

      if (countdown.secondsLeft <= 0) {
        clearInterval(countdownInterval);
        countdown = await Countdown.findOne({ countdownId });

        let winningColor = null;
        const colors = ['blue', 'red', 'green'];
        let minBetAmount = Infinity;

        for (const color of colors) {
          if (countdown[color + 'BetAmount'] < minBetAmount) {
            minBetAmount = countdown[color + 'BetAmount'];
            winningColor = color;
          }
        }

        countdown.status = 'finished';
        countdown.winningColor = winningColor;
        await countdown.save();

        // Step 1: Retrieve Users Who Placed Bets on the Winning Color
    const users = await User.find({ 'bets.color': winningColor });

    // Step 2: Calculate and Update Winnings for Each User
        for (const user of users) {
          const betsForCurrentCountdown = user.bets.filter((bet) =>{
            return bet.countdownId === countdownId && bet.color === winningColor;
          })
          const totalWinnings = betsForCurrentCountdown.reduce((total, bet) => {
            // console.log(totalWinnings)
            if (bet.color === winningColor) {
              const winningsOnColor = bet.amount * 2;
              return total + winningsOnColor;
            }
            return total;
          }, 0);
    
          // Update the user's balance with the total winnings
          user.deposite += totalWinnings;
    
          // Clear the user's bet details for the winning color
          user.bets = user.bets.filter((bet) => bet.color !== winningColor);
    
          // Save the changes to the user in the database
          await user.save();
        }
        // for (const user of users) {
        //   let totalWinnings = 0;

        
        //   // user.deposite = parseInt(user.deposite) + parseInt(user.betAmount) * 2;
        //   // user.betColor = null;
        //   // user.betAmount = 0;
        //   // await user.save();
        // }

        console.log(`Countdown ${countdown.countdownId} - Time's up!`);
        isCountdownRunning = false;
        isCountdownProcessing = false; // Reset the flag after interval processing

        setTimeout(async () => {
          await startNextCountdown(durationInSeconds);
        }, 2000);
      } else {
        await countdown.save();
        isCountdownProcessing = false;
      }
    }, 1000);
  } catch (error) { 
    isCountdownRunning = false;
    isCountdownProcessing = false; // Reset the flag in case of an error
    console.error('Error starting countdown:', error);
  }
};

// //  Create a new Date object to get the current date and time
 const currentDate = new Date();
const currentDateOfMonth = currentDate.getDate();
    const currentMonth = currentDate.getMonth() + 1; // Months are zero-based, so we add 1 to get the correct month number
    const currentYear = currentDate.getFullYear();
    const id = currentYear + ''+ currentMonth + '' +currentDateOfMonth + '000'
//     console.log(id)

// // Start the first countdown with ID 1 and duration of 3 minutes (180 seconds)
// startCountdown(id, 180);
const runningCountdown = async (status) => {
  try {
        if(status = 'running'){

        const countdown = await Countdown.findOne({status: status});
        console.log(countdown?.countdownId);

        if(!countdown) {
          startCountdown(id, 180)
           return //res.status(404).json({ error: 'Countdown not found' });
        }
        await startCountdown(countdown.countdownId, 180);
        return //console.log(res.json(countdown));
        }else{
          return
        }
        
        // const countdown = await Countdown.findOne({status: status});
        // console.log(countdown.countdownId);

        // if(!countdown) {
        //   return res.status(404).json({ error: 'Countdown not found' });
        // }
        // await startCountdown(countdown.countdownId, 180);

        // return res.json(countdown);
  }
  catch (error) {
      console.error('Error fetching user:', error);

    // Handle the error gracefully and return an error response
    // return res.status(500).json({ message: 'Internal server error' });
  }
}

let status = 'running';

runningCountdown(status);

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