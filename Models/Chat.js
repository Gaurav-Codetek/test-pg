let mongoose = require('mongoose');

const message = new mongoose.Schema({
    roll: {
        type: String,
        required: true
    },
    msg: {
        type: String,
        required: true
    },
    Name: {
        type: String,
        required: true
    },
    ident: {
        type: String,
        required: true
    }
})
const ChatSchema = new mongoose.Schema({

    chat: [message]

}, { timestamps: true })
const ChatRegister = new mongoose.model("chatstorage", ChatSchema);
module.exports = ChatRegister