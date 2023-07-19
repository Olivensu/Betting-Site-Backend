const dotenv = require("dotenv");
const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();

dotenv.config();

require('./db/conn');
const User = require('./model/userSchema');

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());

// we link the router files to make our route easy 
app.use(require('./router/auth'));

const PORT = process.env.PORT;


// app.get('/', (req, res) => {
//     res.cookie("jwt", 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ');
//     res.send(`Hello world from the server app.js`);
// });

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