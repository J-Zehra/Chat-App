const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { isEmail } = require('validator');

// CREATE THE USER SCHEMA
const UserModel = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name']
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minlength: [6, 'Minimum password is 6 characters']
    },
    pic: {
        type: Number,
        required: true,
        default: 1
    }

}, { timestamps: true })

// ENCRYPT THE PASSWORD BEFORE SAVING INTO THE DATABASE
UserModel.pre('save', async function(next){
    // CHECK IF THE PASSWORD HASN'T BEEN MODIFIED
    if(!this.isModified){
        next();
    }

    // ENCRYPT THE PASSWORD
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// MATCH PASSWORD
UserModel.statics.login = async function(email, password) {
    const user = await this.findOne({ email });
    
    if(user){
        const auth = await bcrypt.compare(password, user.password);

        if(auth){
            return user;
        }
        throw Error("Incorrect password");
    }
    throw Error("Email doesn't exist");
}

// EXPORT THE MODEL
const User = mongoose.model("users", UserModel);
module.exports = User;