const socketIo = require("socket.io");
const cros = require("cors");
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const Message = require("../models/Message");
const { createMessage,createReaction } = require("../controllers/messageController");
const FriendRequest = require("../models/FriendRequest");

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
  console.log("new user connection " + socket.id);

  socket.on("chat message", async (msg) => {
    const senderId = socketToUserIdMap[socket.id];
    const receiverId = Object.keys(socketToUserIdMap).find(
      (key) => socketToUserIdMap[key] === msg.receiverId
    );
    console.log("receiverId", receiverId);
    createMessage(msg);

    if (receiverId) {
      console.log("receiverId", receiverId);
      console.log("msg", msg);
      io.to(receiverId).emit("chat message", {
        msg
      });
    }
  });

  socket.on("reaction message", async (
    messageId,userId,reactType,receiverIdRA
  ) => {
    const senderId = socketToUserIdMap[socket.id];
    const receiverId = Object.keys(socketToUserIdMap).find(
      (key) => socketToUserIdMap[key] === receiverIdRA
    );
    createReaction(messageId,userId,reactType);

    if (receiverId) {
      io.to(receiverId).emit("reaction message", {
        messageId,reactType
      });
    }
  
  });

  socket.on("send friend request", async (fq) => {
    const senderId = socketToUserIdMap[socket.id];
    const receiverId = Object.keys(socketToUserIdMap).find(
      (key) => socketToUserIdMap[key] === fq.receiverId
    );
    console.log(receiverId);
    const friendRequest = new FriendRequest({
      senderId: fq.senderId,
      receiverId: fq.receiverId,
    });
    if (receiverId) {
      await friendRequest.save();
      await friendRequest.populate("senderId");
      io.to(receiverId).emit("newFriendRequest", friendRequest);
    } else {
      await friendRequest.save();
    }
  });


  socket.on("user login", (userId) => {
    console.log("hello " + userId);
    socketToUserIdMap[socket.id] = userId;
  });

  socket.on("disconnect", () => {
    delete socketToUserIdMap[socket.io];
  });
});

module.exports = { app, server, io };
