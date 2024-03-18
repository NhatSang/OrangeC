const express = require("express");
const {
  sendFriendRequest,
  getFriends,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} = require("../controllers/friendRequestController");
const Router = express.Router();

Router.post("/send", sendFriendRequest);
Router.put("/:id", acceptFriendRequest);
Router.get("/getFriends/:userId", getFriends);
Router.get("/getFriendRequest/:userId", getFriendRequests);
Router.delete("/:id", rejectFriendRequest);

module.exports = Router;
