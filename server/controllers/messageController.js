const asyncHandler = require('express-async-handler');
const Message = require('../models/messageModel');
const User = require('../models/userModel');
const Chat = require('../models/chatModel');


const sendMessage = asyncHandler(async(req, res) => {
    const { content, chatID } = req.body;
    const currentUser = req.user;

    // CHECK ID THE CONTENT AND ID EXIST ON THE BODY
    if(!content || !chatID){
        return res.sendStatus(400);
    }

    // CREATE THE MESSAGE PAYLOAD
    let newMessage = {
        sender: currentUser._id,
        content: content,
        chat: chatID
    }

    // QUERY IT TO THE DATABASE
    try {
        const createdMessage = await Message.create(newMessage);

        await Message.find({ _id: createdMessage._id })
        .populate('sender', 'name pic')
        .populate({ path: 'chat', model: Chat })
        .then(async(result) => {
            result =  await User.populate(result, {
                path: 'chat.users',
                select: 'name pic email'
            });

            res.json(result);
        })

    } catch (error) {
        res.status(400);
        throw new Error(error);
    }
});


const allMessages = asyncHandler(async(req, res) => {
    const { chatID } = req.params;

    try {
        const messages = await Message.find({ chat: chatID })
        .populate('sender', 'name pic email')
        .populate({ path: 'chat', model: Chat });

        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);   
    }
});

const latestMessage = asyncHandler(async(req, res) => {

})

module.exports = { sendMessage, allMessages, latestMessage }