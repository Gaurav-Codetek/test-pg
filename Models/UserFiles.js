///onst dotenv = require('dotenv') ;
//dotenv.config({path:'/config.env'}) ;
const mongoose = require("mongoose")
const { Schema } = mongoose
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();


const UserSchema = new Schema ({
    RollNo:{
        type: String,
        // required: true
    },

    DOB:{
        type: String,
        // required: true
    },
    Name:{
        type: String
    },
    BRANCH:{
        type:String
    },
    pic:{
        type:String,
        default:"https://res.cloudinary.com/cnq/image/upload/v1586197723/noimage_d4ipmd.png"
       },
    tokens: [{
        token:{
            type: String,
            required: true
        }
    }]
})
UserSchema.methods.generateAuthToken=async function(){
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
// UserSchema.pre("save",async function(next){
//     this.password = await this.DOB ; 
//     next() ; 
// })
module.exports = mongoose.model("user", UserSchema)

