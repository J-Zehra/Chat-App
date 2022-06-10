const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../config/generateToken');
const res = require('express/lib/response');

// HANDLE ERRORS
const handleErrors = (err) => {
    let errors = { email: '', password: '' };

    // CHECK FOR DUPLICATE EMAIL
    if(err.code === 11000){
        errors.email = 'Email already exist';
        return errors;
    }

    // INCORRECT EMAIL
    if(err.message === "Email doesn't exist"){
        errors.email = err.message;
    }

    // CHECK IF THE PASSWORD MATCHED
    if(err.message === 'Incorrect password'){
        errors.password = err.message;
    }

    // VALIDATION ERRORS
    if(err.message.includes('users validation failed')){
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        })
    }

    return errors;
}

const registerUser = asyncHandler( async(req, res) => {
    console.log("Hello");
    const { name, email, password, pic } = req.body;

    try{
        const newUser = await User.create({
            name,
            email,
            password,
            pic
        });

        res.status(200).json({
            _id: newUser._id,
            name: newUser.name,
            email:  newUser.email,
            pic: newUser.pic,
            token: generateToken(newUser._id)
        });
    }catch(error){
        const errors = handleErrors(error);
        res.status(400).json({errors});
    }
});

const setAvatar = asyncHandler(async(req, res) => {
    const { index } = req.body;
    const currentUser = req.user;
    console.log(currentUser, index);

    try{
        const user = await User.findByIdAndUpdate(
            currentUser._id,
            { pic: index },
            { new: true }
        );

        res.status(200).json({user});
    }catch(err){
        res.status(400).json(err);
    }
})

const authUser = asyncHandler(async(req, res) => {
    const { email, password } = req.body;

    try{
        const user = await User.login(email, password);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id)
        });
    }catch(error){
        console.log("Error: ",error);
        const errors = handleErrors(error);
        res.status(400).json({errors});
    }
});

// SEARCH USERS USING QUERY
const allUsers = asyncHandler(async(req, res) => {
 //   console.log("Hello");
    const keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } }
        ]
    } : {};

    // GET ALL THE USERS EXCEPT THE CURRENT USER
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id}  });
    console.log(users);

    res.send(users);
});

module.exports = { registerUser, authUser, allUsers, setAvatar }