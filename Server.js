const dotenv = require('dotenv');
dotenv.config();
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const cookieParser = require("cookie-parser")
const path = require("path")
const collection = require('./Models/User.js')
const methodOverride = require('method-override')
const multer = require('multer')
const Post = require("./Models/post.js")
const Database = require("./mongo")
const auth = require('./Middleware/auth')
const router = require('./Routes/router.js')
const postRouter = require('./Routes/postRouter.js')
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 9000
const app = express()
const cors = require('cors')


app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
//app.use(express.urlencoded({extended:true}))
const corsOptions = {
    origin:"http://localhost:3000",
    credentials:true,
    aptionSuccessStatus:200
}
// app.use(cors(corsOptions)) ;

app.use(cors(corsOptions))
Database()
app.use('/',router) ;
app.use('/post',postRouter) ;
// app.use('api/postContent', postRouter)
app.get('/', auth, (req,res)=>{
    res.send(req.user)
    console.log(req.user)
})
// app.post('/',async(req,res)=>{
//     const limit =5; // Parse 'limit' query parameter (default to 10 if not provided)
//     const skip = req.body.skip;
//     console.log(skip) ;
//     try {
//       // Fetch data from MongoDB and limit the results
//       const users = await UsernameRegister.find({}).sort({ "_id": -1 }).skip(skip).limit(limit);
//       console.log(users)
//        res.json(users);
//     } catch (error) {
//       console.error('Error fetching data from MongoDB:', error);
//       res.status(500).json({ error: 'An error occurred while fetching data' });
//     }
//   });
// app.get('/post', async(req, res)=>{
//     const{Name, Branch} = req.body;
    
//     const data = await Post.find({})
//     console.log(data)
//     res.json(data)
// })

app.post('/login', async(req,res)=>{
    const {roll, pass, username} = req.body;
    // console.log(roll)
    try{
        // const checkRoll = await collection.findOne({RollNo: roll})
        // const checkPass = await collection.findOne({Password: pass})
        const checkidforRoll = await collection.findOne({RollNo: roll}, {})
        const checkidforPass = await collection.findOne({Password: pass},{})
        const checkidforName = await collection.findOne({Name: username},{})
        if(checkidforName && checkidforRoll && checkidforPass && checkidforRoll.id === checkidforPass.id &&  checkidforRoll.id === checkidforName.id){
            res.json("exist")
        }
        else{
            res.json("notexist")
        }
        console.log(checkidforName, checkidforPass, checkidforRoll)
    }
    catch(e){
        console.log(e)
    }
})

app.post('/signup', async(req,res)=>{
    const {roll, pass, username}= req.body;
    const data = {
        RollNo: roll,
        Password: pass,
        Name: username
    }
    try{

        const checkRoll = await collection.findOne({RollNo: roll})
        
        if(checkRoll){
            res.json("exist")
        }
        else{
            res.json("notexist")
            await collection.insertMany([data])
        }

        
    }
    catch(e){
        console.log(e)
    }
})

app.listen(9000, ()=>{
    console.log("PORT connected")
})

