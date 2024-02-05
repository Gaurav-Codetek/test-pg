const express = require("express")
const mongoose = require("mongoose")
const router = express.Router()
const Post = require("../Models/post")

router.get('/post',async (req, res)=>{
    const Data = await Post.find({})
    res.json(Data)
})

module.exports = router