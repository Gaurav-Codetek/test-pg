const express = require('express');
const router = express.Router();
const mongoose = require("mongoose")
const UsernameRegister = require('../Models/username.js')
const TestRegister = require("../Models/post.js")
const path = require("path");

// const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
require("../mongo.js")
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3")

const bucketName = 'pgbucket-1'
//const region = process.env.AWS_BUCKET_REGION
const accessKeyId = `${process.env.ACCESS_KEY_ID}`
const secretAccessKey = `${process.env.SECRET_ACCESS_KEY}`

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `${process.env.ENDPOINT}`,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
})
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
// router.post('/',async(req,res)=>{
//    const limit =5; // Parse 'limit' query parameter (default to 10 if not provided)
//    const skip = 1;
//    console.log(skip) ;
//    try {
//      // Fetch data from MongoDB and limit the results
//     //  const users = await UsernameRegister.find({}).sort({ "_id": 1 }).skip(skip).limit(limit);
//      const test = await TestRegister.find({})
//    //  console.log('TEST'+test)
//       res.json(users);
//    } catch (error) {
//      console.error('Error fetching data from MongoDB:', error);
//      res.status(500).json({ error: 'An error occurred while fetching data' });
//    }
//  });
router.get("/photos", async (req, res) => {
  try {
    const skip = parseInt(req.query.skip);
    const data = await TestRegister.find({}).sort({ "_id": -1 }).skip(skip).limit(5);
    console.log(data)
    await res.json(data);
    //   console.log(data) ;
  } catch (e) {
    console.log(e);
  }
}) //CH231110V4945247
router.get('/api/photo/:photoId', async (req, res) => {
  const { photoId } = req.params;
  const getObjectParams = {
    Bucket: 'pgbucket-1',
    Key: photoId
  }
  const command = new GetObjectCommand(getObjectParams)
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
  console.log(url)
  res.json({ url })
  //console.log(photoId)
  // Construct the file path using the unique identifier
  //const filePath = path.join(__dirname, 'uploads', photoId);
  // res.sendFile(filePath);
});
module.exports = router; 
