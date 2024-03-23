const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcrypt");

const getJwt = (email, userId) => {
  const payload = {
    email,
    userId,
  };
  const token = jwt.sign(payload, process.env.SECRETKEY, { expiresIn: "7d" });
  return token;
};

//refresh token
const refreshToken = (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return res.status(403).json("Access is forbidden - Missing refreshToken");
  }
  jwt.verify(refreshToken, process.env.SECRETKEY, (err, user) => {
    if (err) {
      return res.status(403).json("Access is forbidden - Invalid refreshToken");
    }
    console.log(user);
    const accessToken = getJwt(user.email, user.userId);
    return res.status(200).json({ accessToken });
  });
};

//get all user
const getAllUser = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.json({ message: error });
  }
});
//register user
const register = asyncHandler(async (req, res) => {
  const user = new User({
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    dateOfBirth: req.body.dateOfBirth,
    image: req.body.image,
    gender: req.body.gender,
    password: req.body.password,
  });
  console.log(user);
  const existingEmail = await User.findOne({ email: req.body.email });
  if (existingEmail) {
    res.status(400).json({ message: "Email already exists" });
    throw new Error("Email already exists");
  }
  const existingPhone = await User.findOne({ phone: req.body.phone });
  if (existingPhone) {
    res.status(400).json({ message: "Phone already exists" });
    throw new Error("Phone already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  user.password = hashedPassword;
  await user.save();

  res.status(200).json({
    message: "Register successfully",
  });
});

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const existingEmail = await User.findOne({ email: username });
  if (!existingEmail) {
    res.status(403).json({ message: "Email not found" });
    throw new Error("Email not found");
  }
  const validPassword = await bcrypt.compare(password, existingEmail.password);
  if (!validPassword) {
    res.status(401).json({ message: "Email or Password is incorrect" });
    throw new Error("Email or Password is incorrect");
  }
  const user = await User.findOne({ _id: existingEmail._id });
  const accessToken = getJwt(username, existingEmail.userId);

  res.status(200).json({
    message: "Login successfully",
    user,
    accessToken: accessToken,
  });
});
// find user
const findUsers = asyncHandler(async (req, res) => {
  const { keyword, userId } = req.query;
  let result = null;
  if (/\d+/.test(keyword)) {
    result = await User.find({ phone: keyword, _id: { $ne: userId } });
    if (!result) {
      res.status(403).json({ success: false, message: "Not found" });
      throw new Error("Not found");
    }
  } else {
    result = await User.find({
      name: { $regex: keyword, $options: "i" },
      _id: { $ne: userId },
    });
    if (!result) {
      res.status(403).json({ success: false, message: "Not found" });
      throw new Error("Not found");
    }
  }
  res.status(200).json({ success: true, data: result });
});

module.exports = { getAllUser, register, login, refreshToken, findUsers };
