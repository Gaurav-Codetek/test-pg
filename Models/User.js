const mongoose = require("mongoose")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { Schema } = mongoose
const dotenv = require('dotenv');
dotenv.config();

const newUser = new mongoose.Schema({
    RollNo: {
        type: String,
        required: true
    },

    Password : {
        type: String,
        required: true
    },

    Name : {
        type: String,
        required:true
    },
    
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
})

newUser.methods.generateAuthToken = async function(){
    try{
        const token = jwt.sign({id:this._id.toString()},`${process.env.SECRET_KEY}`)
        this.tokens  = this.tokens.concat({token:token})
        console.log(token) 
        await this.save() ;
        return token ;
    }
    catch(error){
      // res.send("error  "+error);
         console.log("error "+error);
    }
  }
 
//  newUser.pre("save",async function(next){
//    // const passwordHash = await bcrypt.hash(this.password,10)
//     this.password = await bcrypt.hash(this.password,10)
//     console.log(this.password) ;
//     next();
//  })
const collection = mongoose.model("User-Data", newUser)

module.exports= collection