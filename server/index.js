// // Import necessary modules
// const express = require('express');
// const mongoose = require('mongoose');
// const { Server } = require('socket.io');
// const cors = require('cors')
// const http = require('http');
// const {Getting_Messages , Sending_Messages } = require('./Controller/UserChatController')

// // Initialize the Express app
// const app = express();

// // Create HTTP server and wrap with socket.io
// const server = http.createServer(app);
// const io = new Server(server,{
//     cors: {
//       origin: "*",   // Allow all origins (you can restrict to specific origins as needed)
//       methods: ["GET", "POST"],  // Allowed HTTP methods
//       credentials: true  // Set to true if you need to send cookies or other credentials with requests
//     }
//   });

// // Connect to MongoDB
// mongoose.connect('mongodb+srv://zafarzaeemmern:EowNa85ShDSTg26W@cluster0.kfsxv.mongodb.net/socket')
//     .then(() => console.log('Connected to MongoDB'))
//     .catch((err) => console.error('MongoDB connection error:', err));

// // Define a simple MongoDB schema
// const MessageSchema = new mongoose.Schema({
//     username: String,
//     message: String,
//     timestamp: { type: Date, default: Date.now },
// });

// const Message = mongoose.model('Message', MessageSchema);

// // Middleware to parse JSON
// app.use(express.json());
// app.use(cors({
//     origin : "*"
// }))
// app.use("/api", require("./Routes/index"));
// // Routes
// app.get('/', (req, res) => {
//     res.send('Server is running!');
// });
// // Socket.IO logic
// io.on('connection', (socket) => {
//     console.log('A user connected:' , socket.id);

//     socket.on('Join', ({ userId, friendId }) => {
//         console.log("userId",userId , "friendId",friendId)
//         const roomId = `${userId}_${friendId}`
//         socket.join(roomId)
       
//         console.log(`User ${userId} joined room: ${roomId}`);
//       });
    

//     socket.on('Sending_Message' ,  (object) => {
//        console.log("dddaa" , object);
       
//        const roomId = [object.reciever_Id, object.sender_Id].sort().join('_');

//         Sending_Messages(object,(response) => {
//         io.to(roomId).emit('new_messages', {
//             object_type: "sending_Messages",
//             message: response,
//         });
        
//     })

//     })


//     socket.on("Getting_Messages", (object) => { 
        
//         const roomId = [object.reciever_Id, object.sender_Id].sort().join('_');
        
//         Getting_Messages(object,(response) => {
           
//             io.to(roomId).emit('new_messages', {
//                 object_type: "fetching_Messages",
//                 message: response,
//             });
//         });
//     });


//     socket.on('disconnect', () => {
//         console.log('A user disconnected:', socket.id);
//     });
// });

// // Start the server
// const PORT = 5000;
// server.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });




// Import necessary modules
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

// Initialize the Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (customize this in production)
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb+srv://zafarzaeemmern:EowNa85ShDSTg26W@cluster0.kfsxv.mongodb.net/socket', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Define a MongoDB schema for messages
const messageSchema = new mongoose.Schema({
  from: String,
  to: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining a private room for one-to-one chat
  socket.on('join', ({ userId, friendId }) => {
    const roomId = [userId, friendId].sort().join('_');
    socket.join(roomId);
    console.log(`User ${userId} joined room: ${roomId}`);
  });

  // Handle sending messages
  socket.on('sendMessage', async ({ from, to, message }) => {
    const roomId = [from, to].sort().join('_');

    // Save message to the database
    const newMessage = new Message({ from, to, message });
    await newMessage.save();

    // Emit the message to both participants in the room
    io.to(roomId).emit('receiveMessage', { from, message });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// API route to get past messages between two users
app.get('/messages', async (req, res) => {
  const { userId, friendId } = req.query;
  const roomId = [userId, friendId].sort().join('_');
  
  const messages = await Message.find({
    $or: [
      { from: userId, to: friendId },
      { from: friendId, to: userId }
    ]
  }).sort({ timestamp: 1 });

  res.json(messages);
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
