const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Define the Bet schema
const betSchema = new mongoose.Schema({
    countdownId: {
        type: Number,
      },
    color: {
      type: String,
      enum: ['red', 'green', 'blue'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  });

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    confirmpassword: {
        type: String,
        required: true
    },
    deposite: {
        type: Number,
        required: true
    },
    bets: [betSchema],
    // betColor: { type: String, default: null },
    // betAmount: { type: Number, default: 0 },
    isAdmin: {
        type: String,
        required: true
    },
    tokens: [
        {
            token:{
                type: String,
                required: true
            }
        }
    ]
})


// we are hashing the password

userSchema.pre('save', async function(next){
    
    if(this.isModified('password')){
        console.log('hashing pass');
        this.password = await bcrypt.hash(this.password, 12);
        this.confirmpassword = await bcrypt.hash(this.confirmpassword, 12);
    }
    next();
})

// we are generating token
userSchema.methods.generateAuthToken = async function(){
    try {
        let token = jwt.sign({_id:this._id}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;
    } catch (err) {
        console.log(err)
    }
}

const User = mongoose.model('register', userSchema);

module.exports = User;