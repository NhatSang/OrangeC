const { log } = require("console");
const userRouter = require("./routers/userRouter");
const accountRouter = require("./routers/accountRouter");
const authRouter = require("./routers/authRouter");
const error = require("./middlewares/responseMiddleware");
const  connectDB  = require("./db/connectDB");
const {app,server} = require("./socket/socket")
require("dotenv").config();

const PORT = process.env.PORT;

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