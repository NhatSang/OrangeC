const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const socketIo = require("socket.io");
const cros = require("cors");
const { log } = require("console");
const Message = require("./models/Message");
const userRouter = require("./routers/userRouter");
const accountRouter = require("./routers/accountRouter");
const authRouter = require("./routers/authRouter");
const error = require("./middlewares/responseMiddleware");
const { default: connectDB } = require("./db/connectDB");
const app = express();
require("dotenv").config();
app.use(cros());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
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

app.get("/", (req, res) => {
  res.send("SERVER IS RUNNING");
});
app.use("/api/v1", userRouter);
app.use("/api/v1", accountRouter);
app.use("/api/v1", authRouter);
app.use(error);

server.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
