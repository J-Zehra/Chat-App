const mongoose = require('mongoose');
const User = require('./userModel');
const Message = require('./messageModel');

const ChatModel = mongoose.Schema({
    chatName: {
        type: String,
        trim: true
    },
    isGroupChat: {
        type: Boolean,
        default: false
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    }],
    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Message
    },
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    }
}, { timestamps: true })

const Chat = mongoose.model("chats", ChatModel);
module.exports = Chat;