const express = require('express');
const multer = require('multer');
const mkdirp = require('mkdirp');
const sharp = require('sharp');
// const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const mongoose = require("mongoose")
const { v4: uuid } = require('uuid');
const app = express.Router();
const TestRegister = require("../Models/post.js");
const { S3Client, PutObjectCommand }= require("@aws-sdk/client-s3")
const UPLOAD_PATH = path.join(__dirname, '/uploads');



const bucketName = 'pgbucket-1'
//const region = process.env.AWS_BUCKET_REGION
const accessKeyId = `${process.env.ACCESS_KEY_ID}`
const secretAccessKey = `${process.env.SECRET_ACCESS_KEY}`

const s3Client = new S3Client({
  region:'auto',
  endpoint:`${process.env.ENDPOINT}`,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
})
mkdirp.sync(path.join(__dirname, '/uploads'));
var uuid1 = uuid();
  const storage = multer.memoryStorage()//({

//     destination: (req, file, done) => {
//         done(null, UPLOAD_PATH);
//     },
//     filename: (req, file, done) => {
//         done(null, uuid1 + '_' + file.originalname);
//     },
// });


const limits = {
    fileSize: 5 * 1024 * 1024,
};

const fileFilter = (req, file, done) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        done(null, true);
    } else {
        done(new Error('file type not supported'), false);
    }
};

const upload = multer({ storage:storage })

app.post('/',upload.single('image'), async(req, res) => {
     console.log(uuid1) ;

   
      //  if (err) {
       //     return res.status(400).json({ success: false, message: err.message });
       // }
        try {
            const postedBy = (JSON.parse(req.body.rollNo)).roll;
            const caption = req.body.caption
            const { file } = req;
            
          //  const type = req.body.type
            const type ='post'
            if(type==='post')
            { 
            if (!file) {
                return res.status(400).json({ success: false, message: 'file not supplied' });
            }
           console.log(file.buffer);
         //   const newFilePath = path.join(UPLOAD_PATH, uuid1);
            // save newFilePath in your db as image path
           // await sharp(file.path).resize().jpeg({ quality: 20 }).toFile(newFilePath);
           // fs.unlinkSync(file.path);
            const test = await TestRegister.create({ uuid: uuid1, postedBy: postedBy, body: caption,type:type, like:[], likeCount: 0 });
          //console.log(fileBuffer) 
            const params=
            {
             Bucket:'pgbucket-1', 
             Key:uuid1,
             Body:file.buffer,
             ContentType:file.mimetype
 
            }
           const command = new PutObjectCommand(params);
            await s3Client.send(command);
            console.log(test);
            uuid1=uuid();
            return res.status(200).json({ success: true, message: 'image uploaded' });
         }
         else if(type==='blog')
         {
            const blog = req.body.blog
            const test = await TestRegister.create({ uuid: uuid1, postedBy: postedBy, body: caption,type:type,blog:blog});
            uuid1=uuid();
            return res.status(200).json({ success: true, message: 'image uploaded' });
         }
         else if(type==='certificate')
         {
            if (!file) {
                return res.status(400).json({ success: false, message: 'file not supplied' });
            }
            const newFilePath = path.join(UPLOAD_PATH, uuid1);
            // save newFilePath in your db as image path
            await sharp(file.path).resize().jpeg({ quality: 20 }).toFile(newFilePath);
            fs.unlinkSync(file.path);
            const test = await TestRegister.create({ uuid: uuid1, postedBy: postedBy, body: caption,type:type });
            console.log(test);
            uuid1=uuid();
            return res.status(200).json({ success: true, message: 'image uploaded' });
         }
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    
});


module.exports = app;