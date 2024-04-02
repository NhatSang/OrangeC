const socketIo = require("socket.io");
const cros = require("cors");
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const Message = require("../models/Message");
const {
  createMessage,
  createReaction,
} = require("../controllers/messageController");
const FriendRequest = require("../models/FriendRequest");
const User = require("../models/User");

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
    const message = await createMessage(msg);
    if (receiverId) {
      io.to(receiverId).emit("chat message", message);
    }
  });

  socket.on("reaction message", async (reaction) => {
    const senderId = socketToUserIdMap[socket.id];
    const receiverId = Object.keys(socketToUserIdMap).find(
      (key) => socketToUserIdMap[key] === reaction.receiverId
    );
    createReaction(reaction);

    console.log("receiverIdok", reaction);
    console.log("receiverId", receiverId);
    if (receiverId) {
      io.to(receiverId).emit("reaction message", reaction);
    }
  });
  // send friend request realtime
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
      io.to(receiverId).emit("new friend request", friendRequest);
    } else {
      await friendRequest.save();
    }
  });

  // mapping socketId by userId
  socket.on("user login", (userId) => {
    console.log("hello " + userId);
    socketToUserIdMap[socket.id] = userId;
  });

  //accept friend request
  socket.on("accept friend request", async (fq) => {
    const receiverId = Object.keys(socketToUserIdMap).find(
      (key) => socketToUserIdMap[key] === fq.receiverId
    );
    const updateResult = await FriendRequest.updateOne(
      { _id: fq._id },
      { $set: { state: "accepted" } }
    );
    if (receiverId) {
      const user = await User.find({ _id: receiverId });
      console.log(user);
      if (user) io.to(receiverId).emit("accept friend request", user);
    }
  });

  // reject friend request
  socket.on("reject friend request", async (fq) => {
    const receiverId = Object.keys(socketToUserIdMap).find(
      (key) => socketToUserIdMap[key] === fq.receiverId
    );
    const deleteResult = await FriendRequest.findOneAndDelete({
      $or: [
        { senderId: fq.senderId, receiverId: fq.receiverId },
        { senderId: fq.receiverId, receiverId: fq.senderId },
      ],
    });
    if (receiverId) {
      io.to(receiverId).emit("reject friend request", fq);
    }
  });

  socket.on("disconnect", () => {
    delete socketToUserIdMap[socket.io];
  });
});

module.exports = { app, server, io };
