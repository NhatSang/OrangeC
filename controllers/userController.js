const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcrypt");


const getJwt = (email, userId) => {
    const payload = {
        email,
        userId,
    };
    const token = jwt.sign(
        payload,
        process.env.SECRETKEY,
        { expiresIn: "1h" }
    );
    return token;
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
   const existingEmail = await User.findOne({ email: req.body.email});
    if (existingEmail) {
         res.status(400).json({ message: "Email already exists" });
         throw new Error("Email already exists");
    }
    const existingPhone = await User.findOne({ phone: req.body.phone});
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
    const {username, password} = req.body;
    console.log(username);
    const existingEmail = await User.findOne({ email: username});
    if (!existingEmail) {
         res.status(403).json({ message: "Email not found" });
         throw new Error("Email not found");
    }
    const validPassword = await bcrypt.compare(password, existingEmail.password);
    console.log(validPassword)
    if (!validPassword) {
         res.status(401).json({ message: "Email or Password is incorrect" });
         throw new Error("Email or Password is incorrect");
    }
    const user = await User.findOne({ _id: existingEmail._id});
    const accessToken = getJwt(username, existingEmail.userId);

    res.status(200).json({ 
        message: "Login successfully",
        user,
        accessToken: accessToken
     });
});

module.exports = { getAllUser, register,login }
