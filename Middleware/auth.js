const userSchema = require('../Models/UserFiles')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');
dotenv.config();

const auth = async(req, res, next)=>{
    try{
        console.log("auth reached") ;
        const token =await req.cookies.jwt
        const verifyUser =  jwt.verify(token,`${process.env.SECRET}`) ;  
        
        const user = await userSchema.findOne({_id:verifyUser._id,"tokens.token":token}) ; 
     //   const user2 = await user2022.findOne({_id:verifyUser._id,"tokens.token":token}) ;   
        if(!user){throw new Error('User Not Found')}
       else if(user){ 
        req.token = token ; 
        req.user = user ; 
        req.userID = user._id ; 
        console.log(user.Name)
        next();
       }
      
    }
    catch(error){
        res.status(401).send("No token provded");
        console.log(error) ;
    }
}

module.exports = auth;