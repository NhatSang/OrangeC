const socketIo = require("socket.io");
const cros = require("cors");
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const Message = require("../models/Message");

const app = express();
app.use(cros());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const server = http.createServer(app);

const options = {
  cors: true,
  origins: ["http://localhost:3000"],
};
const io = require("socket.io")(server, options);
app.use(bodyParser.json());

// handle chat

let socketToUserIdMap = {};

io.on("connection", (socket) => {
  console.log("new user connection" + socket.id);
  socket.on("chat message", async (msg) => {
    const senderId = socketToUserIdMap[socket.id];
    const receiverId = Object.keys(socketToUserIdMap).find(
      (key) => socketToUserIdMap[key] === msg.receiverId
    );

    const message = new Message({
      content: msg.message,
      senderId: senderId,
      receiverId: msg.receiverId,
    });
    await message.save();

    if (receiverId) {
      io.to(receiverId).emit("chat message", {
        message: msg.message,
        sender: senderId,
      });
    } else {
    }
  });
  socket.on("user login", (userId) => {
    socketToUserIdMap[socket.id] = userId;
  });

  socket.on("disconnect", () => {
    delete socketToUserIdMap[socket.io];
  });
});

module.exports = {app,server,io}