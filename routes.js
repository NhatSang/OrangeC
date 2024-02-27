const express = require("express");
const { Account, User, FriendRequest, Message, Sticker } = require("./models");

const router = express.Router();
//ACCOUNT
//  GET để lấy tất cả các accounts
router.get("/accounts", async (req, res) => {
  const accounts = await Account.find();
  res.send(accounts);
});

//  POST để tạo mới một accounts
router.post("/accounts", async (req, res) => {
  const account = new Account({
    username: req.body.username,
    password: req.body.password,
    userId: req.body.userId,
  });
  await account.save();
  res.send(account);
});

// PUT để cập nhật một accounts đã tồn tại
router.put("/accounts/:id", async (req, res) => {
  const account = await Account.findByIdAndUpdate(
    req.params.id,
    {
      username: req.body.username,
      password: req.body.password,
      userId: req.body.userId,
    },
    { new: true }
  );

  if (!account)
    return res.status(404).send("The user with the given ID was not found.");

  res.send(account);
});

//  DELETE để xóa một accounts
router.delete("/accounts/:id", async (req, res) => {
  const account = await Account.findByIdAndRemove(req.params.id);

  if (!account)
    return res.status(404).send("The user with the given ID was not found.");

  res.send(account);
});
// USER
//  GET để lấy tất cả các users
router.get("/users", async (req, res) => {
  const users = await User.find();
  res.send(users);
});

//  POST để tạo mới một user
router.post("/users", async (req, res) => {
  const user = new User({
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    dateOfBirth: req.body.dateOfBirth,
    image: req.body.image,
    gender: req.gender,
  });
  await user.save();
  res.send(user);
});

// PUT để cập nhật một user đã tồn tại
router.put("/users/:id", async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      dateOfBirth: req.body.dateOfBirth,
      image: req.body.image,
      gender: req.gender,
    },
    { new: true }
  );

  if (!user)
    return res.status(404).send("The user with the given ID was not found.");

  res.send(user);
});

//  DELETE để xóa một user
router.delete("/users/:id", async (req, res) => {
  const user = await User.findByIdAndRemove(req.params.id);

  if (!user)
    return res.status(404).send("The user with the given ID was not found.");

  res.send(user);
});
