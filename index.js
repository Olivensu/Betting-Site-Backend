// // server.js

// const express = require('express');
// const http = require('http');
// const socketIO = require('socket.io');
// const mongoose = require('mongoose');
// const cors = require('cors');

// const app = express();
// const server = http.createServer(app);
// const io = socketIO(server);

// app.use(cors());

// mongoose.connect('mongodb+srv://tasbiulhasan08:Olive182@betting-site.nuovutc.mongodb.net/?retryWrites=true&w=majority', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('Connected to MongoDB'))
//   .catch(error => console.error('MongoDB connection error:', error));;
// // Create a Countdown schema and model
// const countdownSchema = new mongoose.Schema({
//     countdownId: { type: Number, unique: true },
//     remainingTime: Number,
//     createdAt: { type: Date, default: Date.now }
//   });
  
//   const Countdown = mongoose.model('Countdown', countdownSchema);
  
//   const startCountdown = async () => {
//     try {
//       const countdownId = getCurrentCountdownId();
  
//       // Find the countdown document or create a new one if it doesn't exist
//       let countdown = await Countdown.findOne({ countdownId });
//       if (!countdown) {
//         countdown = new Countdown({ countdownId, remainingTime: 180 });
//         await countdown.save();
//       }
  
//       const countdownInterval = setInterval(async () => {
//         countdown = await Countdown.findOneAndUpdate(
//           { countdownId },
//           { $inc: { remainingTime: -1 } },
//           { new: true }
//         );
  
//         if (!countdown || countdown.remainingTime <= 0) {
//           clearInterval(countdownInterval);
//           handleCountdownCompletion();
//         }
  
//         io.emit('countdown', countdown.remainingTime);
//       }, 1000);
//     } catch (error) {
//       console.error('Countdown error:', error);
//     }
//   };
  
//   const handleCountdownCompletion = async () => {
//     // Perform necessary actions when countdown completes
//     io.emit('countdownComplete');
  
//     // Start the next countdown
//     startCountdown();
//   };
  
//   const getCurrentCountdownId = () => {
//     // Calculate the current countdown ID based on the current time
//     // Replace this logic with your own implementation
//     const currentTime = new Date();
//     const hours = currentTime.getHours();
//     const minutes = currentTime.getMinutes();
//     return (hours * 60 + minutes) / 3;
//   };
  
//   io.on('connection', socket => {
//     console.log('A user connected');
  
//     Countdown.findOne({ countdownId: getCurrentCountdownId() })
//       .then(countdown => {
//         if (countdown && countdown.remainingTime) {
//           socket.emit('countdown', countdown.remainingTime);
//         } else {
//           // Countdown document not found or remainingTime is not available
//           console.error('Countdown document not found or remainingTime is null/undefined');
//           // Handle the error condition or initialization appropriately
//         }
//       })
//       .catch(error => {
//         console.error('Countdown error:', error);
//         // Handle the error condition appropriately
//       });
  
//     socket.on('disconnect', () => {
//       console.log('A user disconnected');
//     });
//   });
  
//   server.listen(3001, () => {
//     console.log('Server is running on port 3001');
//     startCountdown(); // Start the initial countdown
//   });