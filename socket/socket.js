const socketIo = require("socket.io");
const cros = require("cors");
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const Message = require("../models/Message");
const {
  createMessage,
  createReaction,
  recallMessage,
  deleteMessage,
} = require("../controllers/messageController");
const FriendRequest = require("../models/FriendRequest");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const { addConversation } = require("../controllers/conversationController");

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
  // mapping socketId by userId
  socket.on("user login", (userId) => {
    console.log("hello " + userId);
    socketToUserIdMap[socket.id] = userId;
  });

  socket.on("chat message", async (msg) => {
    // const senderId = socketToUserIdMap[socket.id];
    // const receiverId = Object.keys(socketToUserIdMap).find(
    //   (key) => socketToUserIdMap[key] === msg.receiverId
    // );
    // console.log("receiverId", receiverId);
    console.log('hiiii');
    const message = await createMessage(msg);
    const conversation = await Conversation.findOne({
      _id: msg.conversationId,
    });
    conversation.members.forEach((member) => {
      const receiverId = Object.keys(socketToUserIdMap).find(
        (key) => socketToUserIdMap[key] === member.toString()
      );
      io.to(receiverId).emit("chat message", message);
    });
  });
  //forward message
  socket.on("forward message", async (data) => {
    const conversation = data.conversation;
    console.log("conversation: ", conversation);
    const receiverId = conversation.members.filter(
      (m) => m._id !== data.senderId
    );
    console.log("receiverId: ", receiverId);
    const msg = data.msg;
    const newMsg = {
      conversationId: conversation._id,
      senderId: data.senderId,
      receiverId: receiverId,
      type: msg.type,
      contentMessage: msg.contentMessage,
      urlType: msg.urlType,
      createAt: new Date(),
      isDeleted: false,
      reaction: [],
      isSeen: false,
      isReceive: false,
      isSend: false,
      isRecall: false,
    };
    const message = await createMessage(newMsg);
    console.log(message);
    conversation.members.forEach((member) => {
      const receiverId = Object.keys(socketToUserIdMap).find(
        (key) => socketToUserIdMap[key] === member._id
      );
      io.to(receiverId).emit("chat message", message);
    });
  });
  //recall message
  socket.on("recall message", async (msg) => {
    recallMessage(msg);
    const conversation = await Conversation.findOne({
      _id: msg.conversationId,
    });
    conversation.members.forEach((member) => {
      const receiverId = Object.keys(socketToUserIdMap).find(
        (key) => socketToUserIdMap[key] === member.toString()
      );
      io.to(receiverId).emit("recall message", msg);
    });
  });

  //reaction message
  socket.on("reaction message", async (reaction) => {
    createReaction(reaction);
    const conversation = await Conversation.findOne({
      _id: reaction.conversationId,
    });
    conversation.members.forEach((member) => {
      const receiverId = Object.keys(socketToUserIdMap).find(
        (key) => socketToUserIdMap[key] === member.toString()
      );
      io.to(receiverId).emit("reaction message", reaction);
    });
  });
  // send friend request realtime
  socket.on("send friend request", async (fq) => {
    const senderId = socketToUserIdMap[socket.id];
    const receiverId = Object.keys(socketToUserIdMap).find(
      (key) => socketToUserIdMap[key] === fq.receiverId
    );
    const friendRequest = new FriendRequest({
      senderId: fq.senderId,
      receiverId: fq.receiverId,
    });
    await friendRequest.save();
    if (receiverId) {
      console.log("send to: " + receiverId);
      await friendRequest.populate("senderId");
      io.to(receiverId).emit("newFriendRequest", friendRequest);
    }
  });

  //accept friend request
  socket.on("accept friend request", async (fq) => {
    try {
      const receiverId = Object.keys(socketToUserIdMap).find(
        (key) => socketToUserIdMap[key] === fq.senderId
      );
      const updateResult = await FriendRequest.updateOne(
        { _id: fq._id },
        { $set: { state: "accepted" } }
      );
      if (receiverId) {
        const user = await User.findOne({ _id: fq.senderIdId });
        console.log(user);
        if (user) io.to(receiverId).emit("acceptFriendRequest", user);
      }
    } catch (err) {
      console.log(err);
    }
  });

  // reject friend request
  socket.on("reject friend request", async (fq) => {
    const receiverId = Object.keys(socketToUserIdMap).find(
      (key) => socketToUserIdMap[key] === fq.receiverId
    );
    const deleteResult = await FriendRequest.deleteOne({ _id: fq._id });
    if (receiverId) {
      io.to(receiverId).emit("rejectFriendRequest", fq);
    }
  });
  // huy ket ban
  socket.on("delete friend", async (data) => {
    const receiverId = Object.keys(socketToUserIdMap).find(
      (key) => socketToUserIdMap[key] === data.receiverId
    );
    const deleteResult = await FriendRequest.findOneAndDelete({
      $or: [
        { senderId: data.senderId, receiverId: data.receiverId },
        { senderId: data.receiverId, receiverId: data.senderId },
      ],
    });

    socket.to(receiverId).emit("deleteFriend", data);
  });
  // tao cuoc hoi thoai
  socket.on("create new conversation", async (conversation) => {
    const newConversation = await addConversation(conversation);
    conversation.members.forEach((member) => {
      const receiverId = Object.keys(socketToUserIdMap).find(
        (key) => socketToUserIdMap[key] === member
      );
      io.to(receiverId).emit("newConversation", newConversation);
    });
  });

  socket.on("logout", (userId) => {
    const socketId = Object.keys(socketToUserIdMap).find(
      (key) => socketToUserIdMap[key] === userId
    );
    console.log("disconnect :", socketId);
    delete socketToUserIdMap[socketId];
  });
  socket.on("disconnect", () => {
    delete socketToUserIdMap[socket.io];
  });
});

module.exports = { app, server, io };
