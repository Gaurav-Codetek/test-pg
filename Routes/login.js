const express = require('express');
const usersSchema = require('../Models/UserFiles.js')
const auth = require('../Middleware/auth')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app = express.Router() ;
app.post('/', async (req,res) => {
    const { roll, Name1 } = req.body
   // const rollNo = roll.toUpperCase()
   // const dob = Name1.toUpperCase()
   let rollNo = req.body.roll ; 
   let dob = req.body.Name1 ; 
    try {
        let token ; 
        // const checkName = await usersSchema.findOne({ DOB: dob }, {})
    //    const checkRoll1 = await user2022.findOne({ RollNo: rollNo }, {})
        // const checkName1 = await user2022.findOne({ DOB: dob }, {})

        // console.log(checkRoll1.id)
        // console.log(checkName1.id)
       
        console.log(rollNo)
        if (!rollNo || !dob) {
           return res.json("notexist1")
         }  
        const checkRoll = await usersSchema.findOne({ RollNo: rollNo }, {})
    
        //console.log(checkRoll)
       if(checkRoll){
        if(checkRoll.DOB===dob){
        token = await checkRoll.generateAuthToken() ; 
        console.log(token) ;
       res.cookie("jwt",token,{
           
           
        })
       }
    }
    else if (!rollNo || !dob) {
        return res.json("notexist2")
      }  
    //  const checkRoll1 = await user2022.findOne({ RollNo: rollNo }, {})
    //  //console.log(checkRoll)
    // if(checkRoll1){
    //  if(checkRoll1.DOB===dob){
    //  token = await checkRoll1.generateAuthToken1() ; 
    //  console.log(token) ;
    // res.cookie("jwt",token,{
        
        
    //  })
    //}
 //}
      if(checkRoll){ 
            if(checkRoll.DOB === dob){
                const response = { 
                    auth: "exist",
                    username: checkRoll.Name,
                    roll:rollNo
                    // branch: checkRoll.BRANCH 
                }
             //   console.log(checkRoll) ;
                
                res.json(response) ; 
            }
        }
           
        //  else if(checkRoll1.DOB === dob){
        //     const response = { 
        //         auth: "exist",
        //         username: checkRoll1.Name,
        //         // branch: checkRoll.BRANCH 
        //     }
        //  //   console.log(checkRoll) ;
            
        //     res.json(response) ; 
        // }
       else{
        return res.json("notexist2")
       }
        }
       
    catch (err) {
        console.log(err)
    }
})



module.exports = app ;