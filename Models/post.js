let mongoose = require('mongoose') ;
const TestSchema = new mongoose.Schema({
   
    uuid :{
        type:String ,
        require:true
    },
    body:{
        type:String
    },
    likeCount: {
        type: Number,
        require: true
    },
    likes:[],
    postedBy:{
        type:String,
        require:String,
    }

},{timestamps:true})
const TestRegister = new mongoose.model("Testregister",TestSchema);
module.exports = TestRegister 