const express = require('express');
const { BaccaratCountdown, BaccaratBet } = require('../model/baccaratCountDownScema');
const User = require('../model/userSchema');
const baccarat = express.Router();

baccarat.get('/baccarat', (req,res)=>{
    runningCountdown(status);
})

const startBaccaratNextCountdown = async (durationInSeconds)=>{
    const bangladeshTimeZone = 'Asia/Dhaka';

const currentDateObj  = new Date().toLocaleString('en-US', { timeZone: bangladeshTimeZone });
const currentDate = new Date(currentDateObj);
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

  await startBaccaratCountdown(parseInt(id), durationInSeconds);
}

let isCountdownRunning = false; 
let isCountdownProcessing = false; 

const startBaccaratCountdown = async (countdownId, durationInSeconds) =>{
    if(isCountdownRunning){
        return;
    }
    isCountdownRunning = true;

    try {
        let baccaratCountdown = await BaccaratCountdown.findOne({countdownId});

        if(!baccaratCountdown){
            baccaratCountdown = new BaccaratCountdown({countdownId: countdownId, secondsLeft: durationInSeconds});
            await baccaratCountdown.save();
        }

        const countdownInterval = setInterval(async () =>{
            if(isCountdownProcessing){
                return;
            }
            isCountdownProcessing = true;

            console.log(`BaccaratCountdown ${baccaratCountdown.countdownId} - Time Left: ${baccaratCountdown.secondsLeft} seconds`);
            baccaratCountdown.secondsLeft--;

            if(baccaratCountdown.secondsLeft<=0){
                clearInterval(countdownInterval);
                baccaratCountdown = await BaccaratCountdown.findOne({countdownId});

                let winningColor = null;

                const colors = ['player', 'tie', 'banker'];

                let minBetAmount = Infinity;

                for(const color of colors){
                    
                    if(baccaratCountdown[color + 'BetAmount'] < minBetAmount){
                        minBetAmount = baccaratCountdown[color + 'BetAmount'];
                        winningColor = color;
                }
            }
            if(baccaratCountdown.playerBetAmount === 0 && baccaratCountdown.tieBetAmount === 0 && baccaratCountdown.bankerBetAmount === 0){
                const randomIndex = Math.floor(Math.random() * colors.length);
          winningColor = colors[randomIndex];
          console.log(winningColor);
            }

                baccaratCountdown.status = 'finished';
                baccaratCountdown.winningColor = winningColor;
                await baccaratCountdown.save();

                const users = await User.find({ 'bets.color': winningColor });

                // Step 2: Calculate and Update Winnings for Each User
                for (const user of users) {
                    const betsForCurrentCountdown = user.bets.filter((bet) =>{
                    return bet.countdownId === countdownId && bet.color === winningColor;
                    })
                    const totalWinnings = betsForCurrentCountdown.reduce((total, bet) => {
                    // console.log(totalWinnings)
                    if ( bet.color === winningColor  && winningColor === 'player') {
                        const winningsOnColor = bet.amount * 1.5;
                        return total + winningsOnColor;
                    }
                    else if ( bet.color === winningColor  && winningColor === 'tie') {
                        const winningsOnColor = bet.amount * 3;
                        return total + winningsOnColor;
                    }
                    else if ( bet.color === winningColor  && winningColor === 'banker') {
                        const winningsOnColor = bet.amount * 2;
                        return total + winningsOnColor;
                    }
                    return total + winningsOnColor;
                    }, 0);

                    console.log(totalWinnings)

                    // Update the user's balance with the total winnings
                    user.deposite += totalWinnings;

                    // Clear the user's bet details for the winning color
                    user.bets = user.bets.filter((bet) => bet.color !== winningColor);

                    // Save the changes to the user in the database
                    await user.save();
                }
                    console.log(`Countdown ${baccaratCountdown.countdownId} - Time's up!`);
                    isCountdownRunning = false;
                    isCountdownProcessing = false;

                    setTimeout(async() => {
                        await startBaccaratNextCountdown(180);
                    }, 2000);
                
        }else{
            await baccaratCountdown.save();
            isCountdownProcessing = false;
        }
    
    }, 1000);
    } catch (error) {
        isCountdownRunning = false;
        isCountdownProcessing = false; // Reset the flag in case of an error
        console.error('Error starting countdown:', error);
    }
};

// delete running countdown

const deleteCountdown = async(req, res)=>{
    try {
      // Get all countdowns from the database
    const allCountdowns = await BaccaratCountdown.find({status: "running"}).sort();

    // Delete running countdowns with IDs greater than the first countdown
    const firstCountdown = allCountdowns[0];
    if (!firstCountdown || typeof firstCountdown !== 'object') {
        return res.status(404).send("Countdown not found");
      }
    console.log(firstCountdown)
    await BaccaratCountdown.deleteMany({ _id: { $gt: firstCountdown._id } });
    

    // Return the first countdown
    // res.status(200).json(firstCountdown);
    } catch (error) {
      console.error('Error managing countdowns:', error);
      res.status(500).send('Internal Server Error');
    }
  }
  
  deleteCountdown()

// find running countdown of baccarat

const currentDate = new Date();
const currentDateOfMonth = currentDate.getDate();
const currentMonth = currentDate.getMonth() + 1; // Months are zero-based, so we add 1 to get the correct month number
const currentYear = currentDate.getFullYear();
const id = currentYear + ''+ currentMonth + '' +currentDateOfMonth + '000'

const runningCountdown = async (status) =>{
    try {
        if(status === 'running'){
            const baccaratCountdown = await BaccaratCountdown.findOne({status: status});
            console.log(baccaratCountdown?.countdownId);

            if(!baccaratCountdown){
                await startBaccaratCountdown(id, 180);
                return;
            }
            await startBaccaratCountdown(baccaratCountdown?.countdownId, baccaratCountdown.secondsLeft);
            return
        }
        else{
            return;
        }
    } catch (error) {
        console.error('Error fetching user:', error);
    }
}

let status = 'running';

runningCountdown(status);


baccarat.get('/baccaratcountdown', async (req, res) => {
    const baccaratcountdownresult = await BaccaratCountdown.find();
    return res.send(baccaratcountdownresult);
  })

baccarat.get('/baccaratcountdown/running', async(req, res) =>{
    try {
        const runningCountdown = await BaccaratCountdown.findOne({status: 'running'});
        if(!runningCountdown){
            return res.status(404).json({message: 'Not Found'});
        }
        return res.json(runningCountdown);
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({message: 'Internal Server Error'});
    }    
})

baccarat.post('/baccaratbet', async (req, res)=>{
    try {
        const {email, color, betAmount} = req.body;
        const gamecharge = betAmount;

        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({message: 'User not found'})
        }

        const baccaratcountdown = await BaccaratCountdown.findOne({status: 'running'});
        if(!baccaratcountdown){
            return res.status(404).json({message: 'Countdown not found'});
        }

        const bet = new BaccaratBet({
            email,
            countdownId: baccaratcountdown.countdownId,
            color:color,
            amount: gamecharge,
        })

        await bet.save();

        user.bets.push({countdownId: baccaratcountdown.countdownId, color, amount:gamecharge})
        
        user.deposite-= parseInt(gamecharge);
        await user.save();

        baccaratcountdown[`${color}BetAmount`]+= betAmount;

        baccaratcountdown.bets.push(bet);

        await baccaratcountdown.save();
        res.status(200).json({message: 'Bet placed successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'internal server error'})
    }
})



module.exports = baccarat;