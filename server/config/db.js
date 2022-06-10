const mongoose = require('mongoose');

const connectDB = async() => {
    try{
        const connect = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
        });

        console.log(`MongoDB Connected: ${connect.connection.host}`);
    }catch(err){
        console.log(`Error: ${err}`);
        process.exit();
    }
}

module.exports = connectDB;