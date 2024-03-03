const express = require("express");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Account = require("../models/Account");
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

//create user
const createUser = async (req, res) => {
    const user = new User({
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        dateOfBirth: req.body.dateOfBirth,
        image: req.body.image,
        gender: req.body.gender,
    });
    try {
        const saveUser = await user.save();
        res.json(saveUser);
    } catch (error) {
        res.json({ message: error });
    }
};

//update user
const updateUser = async (req, res) => {
    try {
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
        res.json(user);
    } catch (error) {
        res.json({ message: error });
    }
}

//delete user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndRemove(req.params.id);
        if (!user)
            return res.status(404).send("The user with the given ID was not found.");
        res.json(user);
    } catch (error) {
        res.json({ message: error });
    }
}


//register user and account
const register = asyncHandler(async (req, res) => {
    const user = new User({
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        dateOfBirth: req.body.dateOfBirth,
        image: req.body.image,
        gender: req.body.gender
    });
    console.log(user);
   const existingEmail = await User.findOne({ email: req.body.email});
    if (existingEmail) {
         res.status(400);
         throw new Error("Email already exists");
    }
    const existingPhone = await User.findOne({ phone: req.body.phone});
    if (existingPhone) {
         res.status(400);
         throw new Error("Phone already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const account = new Account({
        email: req.body.email,
        password: hashedPassword,
        user: user._id
    });

    await user.save();
    await account.save();
    const token = getJwt(user.email, user._id);

    res.status(200).json({ 
        message: "Register successfully",
        data: {user,account},
        accessToken: token
     });

});



module.exports = { createUser, getAllUser, updateUser, deleteUser, register }
