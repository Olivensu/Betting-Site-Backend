const express = require('express');
const { BaccaratCountdown, BaccaratBet } = require('../model/baccaratCountDownScema');
const User = require('../model/userSchema');
const baccarat = express.Router();

baccarat.get('/baccarat', (req,res)=>{
    res.send('Hello baccarat')
})

const startBaccaratNextCountdown = async (durationInSeconds)=>{
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
                        await startBaccaratNextCountdown(durationInSeconds);
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
            await startBaccaratCountdown(baccaratCountdown?.countdownId, 180);
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
    const result = await BaccaratCountdown.find();
    return res.send(result);
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

        const countdown = await BaccaratCountdown.findOne({status: 'running'});
        if(!countdown){
            return res.status(404).json({message: 'Countdown not found'});
        }

        const bet = new BaccaratBet({
            email,
            countdownId: countdown.countdownId,
            color:color,
            amount: gamecharge,
        })

        await bet.save();

        user.bets.push({countdownId: countdown.countdownId, color, amount:gamecharge})
        
        user.deposite-= parseInt(gamecharge);
        await user.save();

        countdown[`${color}BetAmount`]+= betAmount;

        countdown.bets.push(bet);

        await countdown.save();
        res.status(200).json({message: 'Bet placed successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'internal server error'})
    }
})



module.exports = baccarat;