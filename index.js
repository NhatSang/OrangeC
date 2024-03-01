const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const routes = require("./routes");
const http = require("http");
const socketIo = require("socket.io");
const { Message } = require("./models");
const cros = require("cors")

const app = express();
app.use(cros());
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const options = {
  cors: true,
  origins: ["http://localhost:3000"],
};
const io = require("socket.io")(server, options);

app.use(bodyParser.json());

//connect mongoDB
mongoose
  .connect("mongodb://0.0.0.0:27017/mydatabase")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// handle chat

let socketToUserIdMap = {};

io.on("connection", (socket) => {
  console.log("new user connection" + socket.id);
  socket.on("chat message",async (msg) => {
    const senderId = socketToUserIdMap[socket.id];
    const receiverId = Object.keys(socketToUserIdMap).find(
      (key) => socketToUserIdMap[key] === msg.receiverId
    );
    const message = new Message({content:msg.message,senderId:senderId,receiverId:msg.receiverId});
    await message.save();
    if(receiverId){
        io.to(receiverId).emit('chat message',{message:msg.message, sender: senderId});
    }else{
        
    }
  });
  socket.on('user login', (userId)=>{
    socketToUserIdMap[socket.id] = userId;
  })

  socket.on('disconnect',()=>{
    delete socketToUserIdMap[socket.io];
  })
});

app.use("/api", routes);
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
