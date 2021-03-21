const express = require("express");
const User = require("../models/userModel");
const auth = require("../middleware/auth");

const router = new express.Router();

//// Login & Logout ////

router.get("/test", (req, res) => {
    res.send("ok");
});

// SignUp
router.post("/users/signup", async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        const token = await user.generateAuthToken();

        res.status(201).send({ user, token });
    } catch (err) {
        res.status(400).send({
            status: 400,
            message: err.message,
        });
    }
});

// LogIn
router.post("/users/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findByCredentials(email, password);
        const token = await user.generateAuthToken();

        res.send({ user, token });
    } catch (err) {
        res.status(400).send("Unable to login!");
    }
});

// LogOut
router.post("/users/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(
            (token) => token.token !== req.token
        );
        await req.user.save();

        res.send("Logout successfully");
    } catch (err) {
        res.status(500).send();
    }
});

// LogOut from all devices
router.post("/users/logoutAll/", auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.send("Logout from all devices successfully");
    } catch (err) {
        res.status(500).send();
    }
});

// Delete User
router.delete("/users/me", auth, async (req, res) => {
    try {
        await req.user.remove();
        res.send(req.user.email);
    } catch (err) {
        res.send.status(500);
    }
});

module.exports = router;
