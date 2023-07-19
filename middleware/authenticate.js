const User = require('../model/userSchema');
const jwt = require("jsonwebtoken");

const Authenticate = async(req, res, next) =>{
    try {
        const token = req.cookies.jwtoken;
        const varifyToken = jwt.verify(token, process.env.SECRET_KEY)

        const rootUser = await User.findOne({_id:varifyToken._id, "tokens.token": token})

        if(!rootUser){
            throw new Error(`Could not find`)
        }

        req.token = token;
        req.rootUser = rootUser;
        req.userID = rootUser._id;

        next()
        
    } catch (error) {
        res.status(401).send("Unauthenticated")
        console.log(error);
    }

}

module.exports = Authenticate