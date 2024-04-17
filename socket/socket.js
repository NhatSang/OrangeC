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
  // socket.on("user login", (userId) => {
  //   console.log("hello " + userId);
  //   socketToUserIdMap[socket.id] = userId;
  // });

  const userId = socket.handshake.query.userId;
  console.log(userId);
  if (userId != "undefined") socketToUserIdMap[userId] = socket.id;

  socket.on("chat message", async (msg) => {
    // const senderId = socketToUserIdMap[socket.id];
    // const receiverId = Object.keys(socketToUserIdMap).find(
    //   (key) => socketToUserIdMap[key] === msg.receiverId
    // );
    // console.log("receiverId", receiverId);
    const message = await createMessage(msg);
    const conversation = await Conversation.findOne({
      _id: msg.conversationId,
    });
    conversation.members.forEach((member) => {
      // const receiverId = Object.keys(socketToUserIdMap).find(
      //   (key) => socketToUserIdMap[key] === member.toString()
      // );
      const receiverId = socketToUserIdMap[member.toString()];
      console.log("recmess: ", receiverId);
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
      // const receiverId = Object.keys(socketToUserIdMap).find(
      //   (key) => socketToUserIdMap[key] === member._id
      // );
      const receiverId = socketToUserIdMap[member._id];
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
      const receiverId = socketToUserIdMap[member.toString()];
      io.to(receiverId).emit("recall message", msg);
    });
  });

  //xoa message
  socket.on("delete message", async (msg) => {
    deleteMessage(msg);
    const conversation = await Conversation.findOne({
      _id: msg.conversationId,
    });
    conversation.members.forEach((member) => {
      const receiverId = socketToUserIdMap[member.toString()];
      io.to(receiverId).emit("delete message", msg);
    });
  });

  //reaction message
  socket.on("reaction message", async (reaction) => {
    createReaction(reaction);
    const conversation = await Conversation.findOne({
      _id: reaction.conversationId,
    });
    conversation.members.forEach((member) => {
      const receiverId = socketToUserIdMap[member.toString()];
      io.to(receiverId).emit("reaction message", reaction);
    });
  });
  // send friend request realtime
  socket.on("send friend request", async (fq) => {
    const receiverId = socketToUserIdMap[fq.receiverId];
    console.log("fq:", fq);
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
      const receiverId = socketToUserIdMap[fq.senderId._id];
      console.log("recId: ", receiverId);
      console.log("senId", fq.senderId);
      const updateResult = await FriendRequest.updateOne(
        { _id: fq._id },
        { $set: { state: "accepted" } }
      );
      if (receiverId) {
        const user = await User.findOne({ _id: fq.senderId._id });
        console.log("accept to: ", user);
        if (user) io.to(receiverId).emit("acceptFriendRequest", user);
      }
    } catch (err) {
      console.log(err);
    }
  });

  // reject friend request
  socket.on("reject friend request", async (fq) => {
    console.log(fq);
    const receiverId = socketToUserIdMap[fq.receiverId];
    const senderId = socketToUserIdMap[fq.senderId._id];
    console.log("rejrec:", receiverId);
    const deleteResult = await FriendRequest.deleteOne({ _id: fq._id });
    console.log(deleteResult);
    if (receiverId) {
      console.log("rejct: ", fq);
      io.to(receiverId).emit("rejectFriendRequest", fq);
    }
    if (senderId) {
      io.to(senderId).emit("rejectFriendRequest", fq);
    }
  });
  // huy ket ban
  socket.on("delete friend", async (data) => {
    const receiverId = socketToUserIdMap[data.receiverId];
    const deleteResult = await FriendRequest.findOneAndDelete({
      $or: [
        { senderId: data.senderId, receiverId: data.receiverId },
        { senderId: data.receiverId, receiverId: data.senderId },
      ],
    });

    io.to(receiverId).emit("deleteFriend", data);
  });
  // tao cuoc hoi thoai
  socket.on("create new conversation", async (conversation) => {
    const newConversation = await addConversation(conversation);
    if (conversation.isGroup) {
      conversation.members.forEach((member) => {
        const receiverId = socketToUserIdMap[member];
        io.to(receiverId).emit("newConversationGroup", newConversation);
      });
    } else {
      conversation.members.forEach((member) => {
        const receiverId = socketToUserIdMap[member];
        io.to(receiverId).emit("newConversation", newConversation);
      });
    }
  });

  socket.on("change name group", async (data) => {
    const updateResult = await Conversation.updateOne(
      { _id: data.conversation._id },
      { $set: { nameGroup: data.newName } }
    );
    const updatedConversation = await Conversation.findOne({
      _id: data.conversation._id,
    }).populate("members");
    if (updatedConversation)
      updatedConversation.members.forEach((member) => {
        const receiverId = socketToUserIdMap[member._id];
        // const user = socketToUserIdMap[userId];
        // io.to(user).emit("respondAdd", updatedConversation);
        io.to(receiverId).emit("updateConversation", updatedConversation);
      });
  });

  socket.on("add member to group", async (data) => {
    const updateResult = await Conversation.updateOne(
      { _id: data.conversation._id },
      { $push: { members: data.member } }
    );
    const updatedConversation = await Conversation.findOne({
      _id: data.conversation._id,
    }).populate("members");
    if (updatedConversation)
      data.conversation.members.forEach((member) => {
        const receiverId = socketToUserIdMap[member._id];
        const user = socketToUserIdMap[userId];
        io.to(user).emit("respondAdd", updatedConversation);
        io.to(socketToUserIdMap[data.member._id]).emit("addToGroup",updatedConversation);
        io.to(receiverId).emit("updateConversation", updatedConversation);
      });
  });
  //remove member from group if userd === memberId thi la leave group
  socket.on("remove member", async (data) => {
    if (data.conversation.administrators.includes(data.member._id)) {
      const updateResult = await Conversation.updateOne(
        { _id: data.conversation._id },
        {
          $pull: {
            members: data.member._id,
            administrators: data.member._id,
          },
        }
      );
    } else {
      const updateResult = await Conversation.updateOne(
        { _id: data.conversation._id },
        { $pull: { members: data.member._id } }
      );
    }

    const updatedConversation = await Conversation.findOne({
      _id: data.conversation._id,
    }).populate("members");
    if (updatedConversation) {
      if (data.member._id !== userId)
        io.to(socketToUserIdMap[data.member._id]).emit(
          "removeMember",
          updatedConversation
        );
      updatedConversation.members.forEach((member) => {
        const receiverId = socketToUserIdMap[member._id];
        if (data.member._id === userId)
          io.to(receiverId).emit("leaveGroup", updatedConversation);
        else io.to(receiverId).emit("removeMember", updatedConversation);
      });
    }
  });
  socket.on("grant admin", async (data) => {
    const updateResult = await Conversation.updateOne(
      { _id: data.conversation._id },
      { $push: { administrators: data.member._id } }
    );
    const updatedConversation = await Conversation.findOne({
      _id: data.conversation._id,
    }).populate("members");
    if (updatedConversation)
      updatedConversation.members.forEach((member) => {
        const receiverId = socketToUserIdMap[member._id];
        io.to(receiverId).emit("updateConversation", updatedConversation);
      });
  });

  socket.on("revoke admin", async (data) => {
    const updateResult = await Conversation.updateOne(
      { _id: data.conversation._id },
      { $pull: { administrators: data.member._id } }
    );
    const updatedConversation = await Conversation.findOne({
      _id: data.conversation._id,
    }).populate("members");
    if (updatedConversation)
      updatedConversation.members.forEach((member) => {
        const receiverId = socketToUserIdMap[member._id];
        io.to(receiverId).emit("updateConversation", updatedConversation);
      });
  });

  socket.on("disband the group", async (conversation) => {
    try {
      const deleteCon = await Conversation.deleteOne({ _id: conversation._id });
      const deleteMess = await Message.deleteMany({
        conversationId: conversation._id,
      });
      conversation.members.forEach((member) => {
        const receiverId = socketToUserIdMap[member._id];
        io.to(receiverId).emit("disbandGroup", conversation);
      });
    } catch (error) {
      console.error("can't disband the group");
    }
  });

  socket;

  socket.on("logout", (userId) => {
    console.log("trc", Object.keys(socketToUserIdMap));
    delete socketToUserIdMap[userId];
    console.log("sau", Object.keys(socketToUserIdMap));
  });
  socket.on("disconnect", () => {
    console.log("trc", Object.keys(socketToUserIdMap));

    delete socketToUserIdMap[userId];
    console.log("sau", Object.keys(socketToUserIdMap));
  });
});

module.exports = { app, server, io };
