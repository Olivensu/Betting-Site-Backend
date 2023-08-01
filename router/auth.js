const express = require('express');
const User = require('../model/userSchema');
const router = express.Router();
const cron = require('node-cron');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate');
const DepositHistory = require('../model/depositSchema');
const SureWin = require('../model/surewinScema');
const WithdrawHistory = require('../model/withdrawScema');
const {Countdown, Bet} = require('../model/countdownSchema');
require('../db/conn')

router.get('/', (req, res) => {
    res.send('Hello world from the server router js')
})

router.post('/register', async (req, res) => {

    const {name, email, phone, password,confirmpassword } = req.body;

    if(!name || !email || !phone || !password || !confirmpassword ) {
        return res.status(422).json({error: "Plz filled the field properly"})
    }

    try {
       const userExist = await User.findOne({email: email});

       if(userExist){
        return res.status(422).res.json("exist")
    }
    else if(password != confirmpassword){
        
        return res.status(422).res.json("not_match");
    }
    else{
        const user = new User({name, email, phone, password,confirmpassword, deposite: 0,betColor:null, isAdmin: "false", })

        await user.save();
        res.status(201).json({message: "user registered successfully"});
    }


    } catch (err) {
        console.log(err)
    }
    
})

// login route 
let token;
router.post('/login', async (req, res) => {
    
    try {
        const {email, password} = req.body;

    if(!email || !password) {
        res.status(403).json({message: "Invalid email or password"});
    }

    const userLogin = await User.findOne({ email: email});

    if(userLogin){
        
        //bcypt pasword
        const isMatch = await bcrypt.compare(password, userLogin.password);

        token =await userLogin.generateAuthToken();
        
        res.cookie("jwtoken", token, {
            domain: "localhost",
            path: 'http://localhost:3000/wingo', // Set the path to root
            expires: new Date(Date.now() + 25892000000),
            httpOnly: true
        });
        console.log(token);

        if(!isMatch) {
            res.status(403).json({error: "Invalid email or password"});
        } else{
            res.status(201).json("exist");
            
        }
    }
    else{
        res.status(403).json({error: "Invalid email or password"});
    }
    
    } 
    
    catch (err) {
        console.log(err)
    } 
})


router.get('/users',  async(req, res) => {
    const result = await User.find();
    return res.send(result);
})


router.get('/users/:email', async (req, res) => {
    try {
      const userEmail = req.params.email;
  
      // Query the database to find the user by email
      const user = await User.findOne({ email: userEmail });
  
      if (!user) {
        // If user not found, return 404 Not Found status
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Return the user's information as a response
      return res.json(user);
    } catch (error) {
      // Log the error message to the console for debugging
      console.error('Error fetching user:', error);
  
      // Handle the error gracefully and return an error response
      return res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/users/:email', async (req, res)=>{
    const { email } = req.params;
    const {deposite} = req.body;
    try{
        if(!deposite){
            return res.status(400).json({ error: 'Invalid status value. Status must be either "accepted" or "rejected".' });
        }

        const updateDepositHistory = await User.updateOne({ email }, {deposite});
        if (!updateDepositHistory) {
            return res.status(404).json({ error: 'Deposit record not found' });
          }
      
          return res.json(updateDepositHistory);
    } catch (err){
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
  })

  router.post('/depositHistory', async (req, res) => {
    const {name, email, phone, deposite,txnID } = req.body;

    if(!name || !email || !phone || !deposite || !txnID ) {
        return res.status(422).json({error: "Plz filled the field properly"})
    }

    // Create a new Date object to get the current date and time
    const currentDate = new Date();

    // Get the individual components (minute, hour, date, month, and year)
    const currentMinute = currentDate.getMinutes();
    const currentHour = currentDate.getHours();
    const currentDateOfMonth = currentDate.getDate();
    const currentMonth = currentDate.getMonth() + 1; // Months are zero-based, so we add 1 to get the correct month number
    const currentYear = currentDate.getFullYear();

    // Display the results
    let time = (`${currentMinute}:${currentHour}`);
    let date = (`${currentDateOfMonth}/${currentMonth}/${currentYear}`);


    try {
       
        const depositHistory = new DepositHistory({name, email, phone, deposite,txnID, date:date, time: time, request: 'Pending'  })

        await depositHistory.save();
        return res.status(201).json({message: "Deposit Submitted successfully"});
    
    } catch (err) {
        console.log(err)
    }
  });

  router.get('/depositHistory', async (req, res)=>{
     try {
        const result = await DepositHistory.find();
     return res.send(result);
     } catch (error) {
        console.log(error);
     }
  })

  router.get('/depositHistory/:_id', async (req, res)=>{
    try {
    const {_id} = req.params;
  
      // Query the database to find the user by email
      const user = await DepositHistory.findById({_id});
  
      if (!user) {
        // If user not found, return 404 Not Found status
        return res.status(404).json({ message: 'User not found' });
      } 
  
      // Return the user's information as a response
      return res.json(user);
    } catch (error) {
      // Log the error message to the console for debugging
      console.error('Error fetching user:', error);
  
      // Handle the error gracefully and return an error response
      return res.status(500).json({ message: 'Internal server error' });
    }
})

  router.put('/depositHistory/:_id', async (req, res)=>{
    const { _id } = req.params;
    const {request} = req.body;
    try{
        if(request !== 'Accepted' && request !== 'Rejected'){
            return res.status(400).json({ error: 'Invalid status value. Status must be either "accepted" or "rejected".' });
        }

        const updateDepositHistory = await DepositHistory.updateOne({ _id }, {request});
        if (!updateDepositHistory) {
            return res.status(404).json({ error: 'Deposit record not found' });
          }
      
          return res.json(updateDepositHistory);
    } catch (err){
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
  })


  router.get('/surewin', async (req, res) => {
    const result = await SureWin.find();
    return res.send(result)
  })

  router.post('/surewin', async (req, res) => {
    
    const {name, email, phone, deposite} = req.body;

    if(!name || !email || !phone || !deposite){
        return res.status(404).json({ error: 'All item are not filled' });
    }

    // Create a new Date object to get the current date and time
    const currentDate = new Date();

    // Get the individual components (minute, hour, date, month, and year)
    const currentMinute = currentDate.getMinutes();
    const currentHour = currentDate.getHours();
    const currentDateOfMonth = currentDate.getDate();
    const currentMonth = currentDate.getMonth() + 1; // Months are zero-based, so we add 1 to get the correct month number
    const currentYear = currentDate.getFullYear();

    // Display the results
    let time = (`${currentMinute}:${currentHour}`);
    let date = (`${currentDateOfMonth}/${currentMonth}/${currentYear}`);

    try {
        const sureWin = new SureWin({name, email, phone, deposite, winmoney: deposite, date:date, time: time, lastInterestCalculationDate: new Date(),});

        await sureWin.save();
        return res.status(201).json({message: "SureWin deposit created"})
    } catch (error) {
        console.log(error);
    } 
})


router.get('/surewin/:email', async (req, res) => {
    
    try {
        const userEmail = req.params.email;
    
        // Query the database to find the user by email
        const user = await SureWin.findOne({ email: userEmail });
    
        if (!user) {
          // If user not found, return 404 Not Found status
          return res.send();
        }
    
        // Return the user's information as a response
        return res.json(user);
      } catch (error) {
        // Log the error message to the console for debugging
        console.error('Error fetching user:', error);
    
        // Handle the error gracefully and return an error response
        return res.status(500).json({ message: 'Internal server error' });
      }
});

router.put('/surewin/:email', async (req, res) =>{
    const { email } = req.params;
    const {winmoney } = req.body;
    try{
        if(!winmoney){
            return res.status(400).json({ error: 'Invalid status value. Status must be either "accepted" or "rejected".' });
        }

        const updateDepositHistory = await SureWin.updateOne({ email }, {winmoney } );
        
        if (!updateDepositHistory) {
            return res.status(404).json({ error: 'Deposit record not found' });
          }
      
          return res.json(updateDepositHistory);
    } catch (err){
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//withdraw history


router.post('/withdrawHistory', async (req, res) => {
    const {name, email, phone, withdraw } = req.body;

    if(!name || !email || !phone || !withdraw ) {
        return res.status(422).json({error: "Plz filled the field properly"})
    }

    // Create a new Date object to get the current date and time
    const currentDate = new Date();

    // Get the individual components (minute, hour, date, month, and year)
    const currentMinute = currentDate.getMinutes();
    const currentHour = currentDate.getHours();
    const currentDateOfMonth = currentDate.getDate();
    const currentMonth = currentDate.getMonth() + 1; // Months are zero-based, so we add 1 to get the correct month number
    const currentYear = currentDate.getFullYear();

    // Display the results
    let time = (`${currentMinute}:${currentHour}`);
    let date = (`${currentDateOfMonth}/${currentMonth}/${currentYear}`);


    try {
       
        const depositHistory = new WithdrawHistory({name, email, phone, withdraw, date:date, time: time, request: 'Pending'  })

        await depositHistory.save();
        return res.status(201).json({message: "Withdraw Request Submitted successfully"});
    
    } catch (err) {
        console.log(err)
    }
  });

  router.get('/withdrawHistory', async (req, res)=>{
    try {
       const result = await WithdrawHistory.find();
    return res.send(result);
    } catch (error) {
       console.log(error);
    }
 })

 
 router.put('/withdrawHistory/:_id', async (req, res)=>{
    const { _id } = req.params;
    const {request} = req.body;
    try{
        if(request !== 'Accepted' && request !== 'Rejected'){
            return res.status(400).json({ error: 'Invalid status value. Status must be either "accepted" or "rejected".' });
        }

        const updateDepositHistory = await WithdrawHistory.updateOne({ _id }, {request});
        if (!updateDepositHistory) {
            return res.status(404).json({ error: 'Deposit record not found' });
          }
      
          return res.json(updateDepositHistory);
    } catch (err){
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
  })

  router.get('/countdown', async (req, res) => {
    const result = await Countdown.find();
    return res.send(result);
  })

  router.get('/countdown/running', async (req, res) => {
    try {
          const status = 'running';
          
          const countdown = await Countdown.findOne({status: status});

          if(!countdown) {
            return res.status(404).json({ error: 'Countdown not found' });
          }

          return res.json(countdown);
    }
    catch (error) {
        console.error('Error fetching user:', error);
  
      // Handle the error gracefully and return an error response
      return res.status(500).json({ message: 'Internal server error' });
    }
  })

  router.post('/bet', async (req, res) => {
    try {
      const  { email, color, betAmount } = req.body;
      const gamecharge = betAmount*0.98;
  
      // Check if the user exists
      const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if the countdown is running
      const countdown = await Countdown.findOne({ status: 'running' });
      if (!countdown) {
        return res.status(400).json({ message: 'No active countdown found' });
      }
  
      // Check if the user has enough money to place the bet
      if (user.deposite < betAmount) {
        return res.status(400).json({ message: 'Insufficient funds' });
      }

      // Create a new Bet document for the user's bet
    const bet = new Bet({
      email: email,
      countdownId: countdown.countdownId,
      color,
      amount: gamecharge,
    });

    await bet.save();

    user.bets.push({countdownId: countdown.countdownId, color, amount:gamecharge });
  
      // Update the user's bet information
      // user.betColor = color;
      // user.betAmount = gamecharge;
      user.deposite = parseInt(user.deposite) - parseInt(gamecharge);
      await user.save();
  
      // Update the total bet amount for the chosen color in the countdown document
      countdown[`${color}BetAmount`] += betAmount;
       // Add the bet to the bets array
      countdown.bets.push(bet);
      await countdown.save();
  
      res.status(200).json({ message: 'Bet placed successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

module.exports = router