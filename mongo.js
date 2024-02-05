const mongoose = require('mongoose')
const dotenv = require('dotenv');
dotenv.config();

const Database = ()=>{
mongoose.connect(`${process.env.DB_CONNECT}`)
.then(res=>console.log("DB Connected"))
.catch(err=>console.log("Failed"))
}

module.exports = Database




