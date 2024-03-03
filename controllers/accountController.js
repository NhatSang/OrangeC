const express = require("express");
const Account = require("../models/Account");

//get all account
const getAllAccount = async (req, res) => {
    const accounts = await Account.find();
    res.json(accounts);
};

//create new account
const createAccount = async (req, res) => {
    const account = new Account({
        username: req.body.username,
        password: req.body.password,
        userId: req.body.userId,
    });
    await account.save();
    res.json(account);
};

//update account
const updateAccount = async (req, res) => {
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

    res.json(account);
};
// delete account
const deleteAccount = async (req, res) => {
    const account = await Account.findByIdAndRemove(req.params.id);

    if (!account)
        return res.status(404).send("The user with the given ID was not found.");

    res.json(account);
};

module.exports = { getAllAccount, createAccount, updateAccount, deleteAccount };
