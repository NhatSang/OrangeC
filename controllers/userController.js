const express = require("express");
const User = require("../models/User");

//get all user
const getAllUser = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.json({ message: error });
    }
};

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
module.exports = {createUser, getAllUser, updateUser, deleteUser}
