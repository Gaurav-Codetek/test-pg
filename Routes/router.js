const express = require('express') ;
const router = express.Router() ;
const mongoose = require("mongoose")
const UsernameRegister = require('../Models/username.js')
const TestRegister = require("../Models/post.js")
const path = require("path");
require("../mongo.js")
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
router.get("/photos",async(req,res)=>{
  try{
    const data = await TestRegister.find({}).sort({"_id":-1}) ; 
    console.log(data)
    await res.json(data) ;
 //   console.log(data) ;
  }catch(e){
    console.log(e) ;
  }
}) //CH231110V4945247
router.get('/api/photo/:photoId', (req, res) => {
  const { photoId } = req.params;
  //console.log(photoId)
  // Construct the file path using the unique identifier
  const filePath = path.join(__dirname, 'uploads', photoId);
  res.sendFile(filePath);
});
module.exports = router ; 
