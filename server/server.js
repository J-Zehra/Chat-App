
// IMPORT PACKAGES / MODULES / ROUTES
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// INITIALIZE AN EXPRESS OBJECT
const app = express();

// CREATE SERVER WITH PORT [ENV]
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);

    // CONNECT DATABASE
    connectDB();
});

// MIDDLEWARE
app.use(express.json());

// ROUTES
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

// ERROR HANDLING MIDDLEWARE
app.use(notFound);
app.use(errorHandler);

// SOCKET
const io = require('socket.io')(server, {
    pingTimeout: 6000,
    cors: {
        origin: 'http://localhost:3000'
    }
});

io.on('connection', (socket) => {
    console.log('Socket Connected');

    socket.on('setup', (userData) => {
        socket.join(userData._id);
        console.log(userData._id);
        socket.emit('connected');
    });

    socket.on('join_chat', (room) => {
        socket.join(room);
        console.log("User joined room: " + room);
    });

    socket.on('typing', (room) => {
        socket.in(room).emit('typing');
    })

    socket.on('stop_typing', (room) => {
        socket.in(room).emit('stop_typing')
    })

    socket.on('new_message', (newMessage) => {
        let chat = newMessage.chat;
        console.log(newMessage);

        if(!chat.users) return console.log("User is not defined");

        chat.users.forEach(user => {
            if(user._id === newMessage.sender._id) return;

            socket.in(user._id).emit('message_received', newMessage);
            socket.in(user._id).emit('latest_message', newMessage.content);
        });
    });

    socket.off('setup', () => {
        console.log("User Disconnected");
        socket.leave(userData._id);
    })
})