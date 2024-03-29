const { log } = require("console");
const userRouter = require("./routers/userRouter");
const authRouter = require("./routers/authRouter");
const messageRouter = require("./routers/messageRouter");
const conversationRouter = require("./routers/conversationRouter");
const friendRequestRouter = require("./routers/friendRequestRouter");
const error = require("./middlewares/responseMiddleware");
const connectDB = require("./db/connectDB");
const { app, server } = require("./socket/socket");
require("dotenv").config();

const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("SERVER IS RUNNING");
});
app.use("/api/v1", userRouter);
app.use("/api/v1", authRouter);
app.use("/api/v1", messageRouter);
app.use("/api/v1", conversationRouter);
app.use("/api/friend", friendRequestRouter);
app.use(error);

server.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
