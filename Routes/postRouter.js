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

const UPLOAD_PATH = path.join(__dirname, '/uploads');

mkdirp.sync(path.join(__dirname, '/uploads'));
var uuid1 = uuid();
const storage = multer.diskStorage({

    destination: (req, file, done) => {
        done(null, UPLOAD_PATH);
    },
    filename: (req, file, done) => {
        done(null, uuid1 + '___' + file.originalname);
    },
});


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

const upload = multer({ storage, limits, fileFilter }).single('image');

app.post('/', (req, res) => {
     console.log(uuid1) ;

    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        try {
            const postedBy = (JSON.parse(req.body.rollNo)).roll;
            const caption = req.body.caption
            const { file } = req;
            if (!file) {
                return res.status(400).json({ success: false, message: 'file not supplied' });
            }

            const newFilePath = path.join(UPLOAD_PATH, uuid1);
            // save newFilePath in your db as image path
            await sharp(file.path).resize().jpeg({ quality: 20 }).toFile(newFilePath);
            fs.unlinkSync(file.path);
            const test = await TestRegister.create({ uuid: uuid1, postedBy: postedBy, body: caption });
            console.log(test);
            uuid1=uuid();
            return res.status(200).json({ success: true, message: 'image uploaded' });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    });
});


module.exports = app;