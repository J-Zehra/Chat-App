const asyncHandler = require('express-async-handler');
const Chat = require('../models/chatModel');
const User = require('../models/userModel');
const Message = require('../models/messageModel');

//#### ISSUE ###//
// Throws an error at the first run

const accessChat = asyncHandler(async(req, res) => {
    // EXTRACT THE SELECTED USER'S ID AND THE CURRENT USER'S ID
    const selectedUser = req.body.userID;
    const currentUser = req.user._id; 

    // CHECK IF THE USER ID EXIST IN THE REQUEST
    if(!selectedUser){
        console.log('UserID param is not sent in request');
        return res.sendStatus(400);
    }

    // CHECK IF THE CHAT ALREADY EXIST AND THEN POPULATE THE USER AND THE LATEST MESSAGE
    let isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: currentUser } } },
            { users: { $elemMatch: { $eq: selectedUser } } }
        ]
    })
    .populate('users', '-password')
    .populate('latestMessage');

    // POPULATE THE LATEST MESSAGE WITH THE USER
    isChat = await User.populate(isChat, {
        path: 'latestMessage.sender',
        select: 'name pic email',
    });


    // CHECK IF THE CHAT EXIST OTHERWISE, CREATE A NEW CHAT
    if(isChat.length > 0){
        res.send(isChat[0]);
    }else{
        let chatData = {
            chatName: 'sender',
            isGroupChat: false,
            users: [currentUser, selectedUser],
            latestMessage: null
        }

        try {
            const createdChat = await Chat.create(chatData);

            // AFTER CREATING THE CHAT, SEND IT BACK TO THE USER
            const fullChat = await Chat.findOne({ _id: createdChat._id })
            .populate(
                'users',
                '-password',
            );

            res.status(200).json(fullChat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }
});

const fetchChats = asyncHandler(async(req, res) => {
    const currentUser = req.user._id;
    console.log(currentUser);

    try {
        // FIND THE CHAT WITH THE CURRENT USER AND THEN POPULATE THE USER
        await Chat.find({ users: { $elemMatch: { $eq: currentUser } } })
        .populate('users', '-password')
        .populate('groupAdmin', '-password')
        .populate('latestMessage', 'content')
        .then(async(result) => {
            result = await User.populate(result, {
                path: 'latestMessage.sender',
                select: 'name pic email'
            });

            res.status(200).send(result);
        });
    } catch (error) {
        throw new Error(error.message);
    }
});

const latestMessage = asyncHandler(async(req, res) => {
    const { newMessage } = req.body;

    console.log(newMessage.content);

    try{
        const chat = await Chat.findByIdAndUpdate(
            newMessage.chat._id,
            { latestMessage: newMessage },
            {new: true}
        );

        res.status(200).json(chat);
    }catch(err){
        console.log(err);
    }
})

const createGroupChat = asyncHandler(async(req, res) => {
    const users = req.body.users;
    const groupName = req.body.groupName;

    // CHECK IF THE FIELDS HAS BEEN FILLED
    if(!users || !groupName){
        return res.status(400).send({ message: "Please fill all the fields" });
    }

    // PARSE THE STRINGIFY ARRAY OF USERS
    let listOfUsers = JSON.parse(users);

    // CHECK IF THE USERS IN THE GROUP IS MORE THAN TWO
    if(listOfUsers.length < 2){
        return res.status(400).send({ message: "More than two users are required to create a group chat"});
    }

    // PUSH THE CURRENT USER TO THE LIST OF USERS THAT FORMS THE GROUP
    const currentUser = req.user;
    listOfUsers.push(currentUser);

    // CREATE THE GROUP CHAT
    try {
        const groupChat = await Chat.create({
            chatName: groupName,
            users: listOfUsers,
            isGroupChat: true,
            groupName: currentUser
        });

        // SEND BACK THE GROUP CHAT TO THE USER
        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
        .populate('users', '-password')
        .populate('groupAdmin', '-password');

        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const renameGroup = asyncHandler(async(req, res) => {
    const { chatID, newChatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
        chatID,
        { chatName: newChatName },
        { new: true }
    )
    .populate('users', '-password', User)
    .populate('groupAdmin', '-password', Chat);

    // CHECK IF THE CHAT IS FOUND
    if(!updatedChat){
        res.status(404);
        throw new Error('Chat not found');
    }else{
        res.json(updatedChat);
    }
});

const addToGroup = asyncHandler(async(req, res) => {
    const { chatID, addedUserID } = req.body;

    // ADD THE USER
    const added = await Chat.findByIdAndUpdate(
        chatID,
        { $push: { users: addedUserID } },
        { new: true }
    )
    .populate('users', '-password', User)
    .populate('groupAdmin', '-password', Chat);

    // CHECK IF ADDED
    if(!added){
        res.status(404);
        throw new Error('Chat not found');
    }else{
        res.json(added);
    }
});

const removeFromGroup = asyncHandler(async(req, res) => {
    const { chatID, removeUserID } = req.body;

    // ADD THE USER
    const removed = await Chat.findByIdAndUpdate(
        chatID,
        { $pull: { users: removeUserID } },
        { new: true }
    )
    .populate('users', '-password', User)
    .populate('groupAdmin', '-password', Chat);

    // CHECK IF ADDED
    if(!removed){
        res.status(404);
        throw new Error('Chat not found');
    }else{
        res.json(removed);
    }
});


module.exports = { accessChat, fetchChats, latestMessage, createGroupChat, renameGroup, addToGroup, removeFromGroup }