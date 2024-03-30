const mongoose = require("mongoose")
const { Schema } = mongoose
const dotenv = require('dotenv');
dotenv.config();
const jwt = require('jsonwebtoken');

// const jwt = require('jsonwebtoken');
const UserBirth = new Schema({
    RollNo: {
        type: String,
        // required: true
    },

    DOB: {
        type: String,
        // required: true
    },

    Matcher: {
        type: String
    },

    Name: {
        type: String
    },

    Branch: {
        type: String
    },

    Email: {
        type: String
    },

    Auth: {
        type: String
    },
    Password:{
        type: String
    },

    PassChange: {
        type: String
    },
    unid: {
        type: String
    },
    tokens: [{
        token:{
            type: String,
            required: true
        }
    }]
})

UserBirth.methods.generateAuthToken2=async function(){
    try{
        const token = jwt.sign({_id:this._id},`${process.env.SECRET_KEY}`)
        this.tokens = this.tokens.concat({token:token})
        await this.save() ;
        return token ;
    }
    catch(error){
        console.log(error) ; 
    }
}
module.exports = mongoose.model("birthbas", UserBirth)

