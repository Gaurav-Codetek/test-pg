const dotenv = require('dotenv');
dotenv.config();
const express = require('express')
const WebSocket = require('ws')
const nodemailer = require('nodemailer')
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
const birth = require('./Models/BirthBash.js')
const postRouter = require('./Routes/postRouter.js')
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 9000
const app = express()
const cors = require('cors')


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
Database()

// app.use(express.urlencoded({extended:true}))
const corsOptions = {
    origin: `${process.env.CORS_ORIGIN}`,
    credentials: true,
    aptionSuccessStatus: 200
}
// app.use(cors(corsOptions)) ;
app.use(cors(corsOptions))
app.use(cookieParser());

app.use(express.json())

app.use('/', router);
app.use('/post', postRouter);
// app.use('api/postContent', postRouter)
app.get('/', auth, (req, res) => {
    res.send(req.user)
    console.log(req.user)
})

const server = require('http').createServer(app);
const wss = new WebSocket.Server({
    server: server,
    perMessageDeflate: false
});
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


// Login Server Startssssss

app.post('/Oauth', async (req, res) => {
    let rollNo = req.body.roll;

    try {
        const checkRoll = await birth.findOne({ RollNo: rollNo }, {})

        if (checkRoll && checkRoll.PassChange === "Done") {
            const response = {
                username: checkRoll.Name,
                password: checkRoll.DOB,
                Email: checkRoll.Email,
                auth: "exist-with-passChange"
            }

            return res.json(response)
        }
        else if (checkRoll && checkRoll.PassChange !== "Done") {
            const response = {
                username: checkRoll.Name,
                password: checkRoll.DOB,
                Email: checkRoll.Email,
                auth: "exist-with-no-passChange"
            }

            return res.json(response)
        }
        else if (!checkRoll) {
            const response = {
                auth: "not-exist"
            }

            return res.json(response)
        }
    }
    catch (err) {
        console.log(err)
    }
})

app.post('/OAuth1', async (req, res) => {
    const { a, b } = req.body;

    let rollNo = req.body.a;
    let password = req.body.b;
    console.log(rollNo, password)

    try {
        let token;
        if (!rollNo || !password) {
            const response = {
                auth: "Invalid"
            }
            return res.json(response)
        }

        const checkRoll = await birth.findOne({ RollNo: rollNo }, {})
        const pass = await bcrypt.compareSync(password, checkRoll.Password)
        console.log(pass)
        if (pass) {
            token = await checkRoll.generateAuthToken2();
            console.log(token, "token")
            res.cookie("jwt", token, {
                secure: true,
                sameSite: 'none',
            })
            const response = {
                auth: "valid",
                roll: checkRoll.RollNo,
                username: checkRoll.Name,
            }
            res.json(response)
        }
        else {
            const response = {
                auth: "Invalid",
            }
            console.log("Invalid2")
            res.json(response)
        }
    }
    catch (err) {
        console.log(err)
    }
})

app.post('/checkDate', async (req, res) => {
    const liveDate = req.body.todayDate;

    const users = await birth.find({ Matcher: liveDate });
    console.log(users);
    return res.json(users);
})

app.get('/search', async (req, res) => {
    const usersList = await birth.find({});
    // console.log(usersList);
    return res.json(usersList)
})

app.post('/EmailVer', async (req, res) => {
    const email = req.body.email;
    const roll = req.body.rollNo;

    const checkRoll = await birth.findOne({ RollNo: roll }, {});
    console.log(checkRoll.Email)

    if (checkRoll) {
        if (checkRoll.Email === email) {
            try {
                const min = 10000;
                const max = 99999;
                const verifyCode = Math.floor(Math.random() * (max - min + 1)) + min;
                const code = verifyCode.toString();
                await checkRoll.updateOne({ Auth: code });
                let transporter = await nodemailer.createTransport({
                    host: `${process.env.HOST}`,
                    port: process.env.SMTP_PORT,
                    authMethod: 'plain',
                    auth: {
                        user: `${process.env.USER}`,
                        pass: `${process.env.PASS}`
                    },
                    tls: {
                        rejectUnauthorized: false
                    }
                });

                //send mail

                let info = await transporter.sendMail({
                    from: '"PageRoll" <Gp4444> ',
                    to: `${email}`,
                    subject: `PageRoll: Email Verification Code`, // Subject line
                    // text: `Your email verification code is ${verifyCode}`,
                    html: `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Document</title>
                    </head>
                    <body>
                        <div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2;">
                            <div style="margin: 50px auto; width: 90%; padding: 20px 0;">
                              <div style="border-bottom: 1px solid #eee;">
                                <a href="" style="font-size: 1.4em; color: #00466a; text-decoration: none; font-weight: 600;">PAGEROLL | beta</a>
                              </div>
                              <p>Thank you for choosing Pageroll. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
                              <h2 style="background: #00466a; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;">${verifyCode}</h2>
                              <p style="font-size: 0.9em;">Enter OTP for validation<br />Happy surfing</p>
                              <hr style="border: none; border-top: 1px solid #eee;" />
                            </div> 
                          </div>
                    </body>
                    </html>
                    `
                })

                console.log("Message sent: %s", info.messageId);
                return res.json("exist")
            } catch (err) {
                console.log("Mail does not sent", err)
            }
        }
    }
})

app.post('/changePass', async (req, res) => {
    const pass = req.body.b;
    const roll = req.body.a;
    // console.log("pass change reached")
    const checkRoll = await birth.findOne({ RollNo: roll }, {});
    console.log("pass change reached",)


    if (checkRoll) {
        let token;
        try {
            const salt = 10;
            const passwordHash = await bcrypt.hash(pass, salt);
            console.log(passwordHash, salt);
            await checkRoll.updateOne({ PassChange: "Done" })
            await birth.updateOne({ RollNo: roll }, { $unset: { Password: 1, id: 0 } })
            await checkRoll.updateOne({ Password: passwordHash })
            await checkRoll.updateOne({ unid: roll })
            token = await checkRoll.generateAuthToken2();
            res.cookie("jwt", token, {
                secure: true,
                sameSite: 'none',
            })
            const resp = {
                auth: "passChanged",
                username: checkRoll.Name,
                roll: checkRoll.RollNo,
                branch: checkRoll.Branch
            }
            res.json(resp);
        } catch (err) { console.log(err) }

    }
})

app.post('/likeFunc', async (req, res) => {
    const { uuid } = req.body;

})

app.post('/verifyCode', async (req, res) => {
    const code = req.body.email;
    const roll = req.body.rollNo;

    const checkRoll = await birth.findOne({ RollNo: roll }, {});
    // const str =checkRoll.Auth;
    // const codeStr = str.toString();
    console.log(checkRoll.Auth, code)

    if (checkRoll) {
        if (checkRoll.Auth === code) {
            await birth.updateOne({ RollNo: roll }, { $unset: { Auth: 1, id: 0 } })
            console.log("exist")
            const resp = {
                auth: "exist",
                username: checkRoll.Name,
                roll: checkRoll.RollNo,
            }
            res.json(resp)
        }
        else {
            await birth.updateOne({ RollNo: roll }, { $unset: { Auth: 1, id: 0 } })
            res.json("not-exist")
        }
    }
})

app.post('/mailSender', async (req, res) => {
    const { Name, msg, Branch, Year } = req.body;
    let user = req.body.Name;
    let msgs = req.body.msg;
    let branch = req.body.Branch;
    let year = req.body.Year;
    let str = "Hello Happy birthday";

    try {
        let transporter = await nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            authMethod: 'plain',
            auth: {
                user: `${process.env.USER}`,
                pass: `${process.env.PASS}`
            }
        });

        //send mail

        let info = await transporter.sendMail({
            from: '"BirthBash" <Gp4444> ',
            to: "gp43883@gmail.com",
            subject: `${user} have wished you`, // Subject line
            text: `${msgs}`
        })

        console.log("Message sent: %s", info.messageId);
        return res.json(info)
    } catch (err) {
        console.log("Mail does not sent")
    }
})

app.get('/logout', (req, res) => {
    console.log("fetched logout")
    res.clearCookie("jwt", {
        path: '/',
        secure: true,
        sameSite: 'none',
    });
    res.status(200).send('User Logout');

})






// Login Server Endsssssssss


app.post('/chatStorage', async (req, res) => {
    const { roll, inputValue, username } = req.body;
    try {
        await chatStorage.updateOne({}, { $push: { chat: [{ roll: roll, msg: inputValue, Name: username }] } })
        const chat = await chatStorage.findOne({ ident: "chatMsg" }, {});
        // console.log(chat.chat)
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

server.listen(PORT, () => {
    console.log(`PORT connected at ${PORT}`)
})

