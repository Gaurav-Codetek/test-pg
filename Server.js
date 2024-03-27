const dotenv = require('dotenv');
dotenv.config();
const express = require('express')
const WebSocket = require('ws')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const cookieParser = require("cookie-parser")
const path = require("path")
const collection = require('./Models/User.js')
const methodOverride = require('method-override')
const multer = require('multer')
const post = require("./Models/post.js")
const Database = require("./mongo")
const auth = require('./Middleware/auth')
const router = require('./Routes/router.js')
const chatStorage = require('./Models/Chat.js')
const postRouter = require('./Routes/postRouter.js')
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 9000
const WEB_SOCKET_PORT = process.env.WEB_SOCKET_PORT || 8080
const app = express()
const cors = require('cors')


app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
//app.use(express.urlencoded({extended:true}))
const corsOptions = {
    origin: `${process.env.CORS_ORIGIN}`,
    credentials: true,
    aptionSuccessStatus: 200
}
// app.use(cors(corsOptions)) ;

app.use(cors(corsOptions))
Database()
app.use('/', router);
app.use('/post', postRouter);
// app.use('api/postContent', postRouter)
app.get('/', auth, (req, res) => {
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

const wss = new WebSocket.Server({ port: WEB_SOCKET_PORT });
const clients = new Set();
wss.on('connection', function connection(ws) {
    clients.add(ws);
    console.log('Client Connected');
    ws.on('message', function incoming(message) {
        console.log('Received:', message);
        //Broadcast received message to all clients
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
    ws.on('close', function close() {
        console.log('Client disconnected');
    });
});

app.post('/chatStorage', async (req, res) => {
    const { roll, inputValue, username } = req.body;
    try {
        await chatStorage.updateOne({}, { $push: { chat: [{ roll: roll, msg: inputValue, Name: username }] } })
        const chat = await chatStorage.findOne({ ident: "chatMsg" }, {});
        console.log(chat.chat)
        res.json(chat.chat)
    } catch (err) { console.log(err) }
})

app.get('/chatStorage', async (req, res) => {
    try {
        const chat = await chatStorage.findOne({ ident: "chatMsg" }, {});
        res.json(chat.chat)
    } catch (err) { console.log(err) }
})

app.post('/login', async (req, res) => {
    const { roll, pass, username } = req.body;
    // console.log(roll)
    try {
        // const checkRoll = await collection.findOne({RollNo: roll})
        // const checkPass = await collection.findOne({Password: pass})
        const checkidforRoll = await collection.findOne({ RollNo: roll }, {})
        const checkidforPass = await collection.findOne({ Password: pass }, {})
        const checkidforName = await collection.findOne({ Name: username }, {})
        if (checkidforName && checkidforRoll && checkidforPass && checkidforRoll.id === checkidforPass.id && checkidforRoll.id === checkidforName.id) {
            res.json("exist")
        }
        else {
            res.json("notexist")
        }
        console.log(checkidforName, checkidforPass, checkidforRoll)
    }
    catch (e) {
        console.log(e)
    }
})

app.post('/postlike', async (req, res) => {
    const { uuid, userunid } = req.body;
    const addunid = await post.find({ uuid: uuid }, {});

    if (addunid) {
        try {
            console.log(addunid);
            console.log("break")
            await post.updateOne({ uuid: uuid }, { $push: { likes: userunid } })
            const postArr = await post.find({ uuid: uuid }, {});
            console.log(postArr[0].likes.length);
            await post.updateOne({ uuid: uuid }, { likeCount: postArr[0].likes.length })
            console.log(postArr)
            res.json(postArr)
        }
        catch (err) {
            console.log(err)
        }
    }
})
app.post('/postdislike', async (req, res) => {
    const { uuid, userunid } = req.body;
    const addunid = await post.find({ uuid: uuid }, {});
    if (addunid) {
        try {
            console.log(addunid);
            console.log(userunid, "roll")
            console.log("break dislike")
            await post.updateOne({ uuid: uuid }, { $pull: { likes: userunid } })
            const postArr = await post.find({ uuid: uuid }, {});
            console.log(postArr[0].likes.length)
            await post.updateOne({ uuid: uuid }, { likeCount: postArr[0].likes.length })
            res.json(postArr)
        }
        catch (err) {
            console.log(err)
        }
    }
})

app.post('/likesList', async (req, res) => {
    const { uuid } = req.body;
    try {
        const data = await post.findOne({ uuid: uuid }, {})
        // console.log(data)
        res.json(data);
    } catch (err) {
        console.log(err)
    }
})


app.post('/likeCounter', async (req, res) => {
    const { uuid } = req.body;
    const addunid = await post.find({ uuid: uuid }, {});
    if (addunid) {
        res.json(addunid);
    }
    else {
        res.json("error")
    }
})

app.post('/signup', async (req, res) => {
    const { roll, pass, username } = req.body;
    const data = {
        RollNo: roll,
        Password: pass,
        Name: username
    }
    try {

        const checkRoll = await collection.findOne({ RollNo: roll })

        if (checkRoll) {
            res.json("exist")
        }
        else {
            res.json("notexist")
            await collection.insertMany([data])
        }


    }
    catch (e) {
        console.log(e)
    }
})

app.listen(PORT, () => {
    console.log("PORT connected")
})

