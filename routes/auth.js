const express = require('express');
const Router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const passport = require('passport');

// Import models
const Person = require('../models/Person.js');

// 01 Get the Register Form
Router.get('/register', (req, res) => {
    res.render('register')
});

// 02
// @type    POST
//@route    auth/register
// @desc    route for Register a user
// @access  PUBLIC

Router.post('/register',
    // Validate Register form using express-validator
    [
        check("name", "Please Enter Your name..").not().isEmpty().trim().escape(),
        check("username", "Please Enter a username..")
            .not()
            .isEmpty()
            .trim()
            .escape(),
        check("email", "Enter a valid Email Id").isEmail().normalizeEmail(),
        check("password", "Password Error..Must be 6 character long")
            .isLength({ min: 6 })
            .not()
            .isEmpty()
            .trim(),
        check("password2", "Passwords do not match").custom(
            (value, { req }) => value === req.body.password
        ),
    ],

    (req, res) => {
        // Check wheater is email already registered or not
        Person.findOne({ email: req.body.email })

            .then(found => {
                if (found) {
                    req.flash("danger", "Email is already registerd..");
                    res.status(403).redirect("/auth/addperson");
                } else {
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        return res.render("register", {
                            errors: errors.array(),

                        });
                    } else {
                        // If there is no error or validate successfully Saved data to Database
                        let newPerson = new Person({
                            name: req.body.name,
                            username: req.body.username,
                            email: req.body.email,
                            password: req.body.password,
                            password2: req.body.password2
                        });
                        // Encrypt User/Account password using BCRYPTJS
                        bcrypt.genSalt(10, function (err, salt) {
                            bcrypt.hash(newPerson.password, salt, function (err, hash) {
                                if (err) throw err;
                                // Store hash in your password DB.
                                newPerson.password = hash;
                                newPerson.password2 = hash;

                                // Save to database
                                newPerson
                                    .save()
                                    .then((saved) => {
                                        if (saved) {
                                            req.flash(
                                                "success",
                                                "Email has been registerd successfully.."
                                            );
                                            res.redirect(302, "/auth/register");
                                            console.log(saved);
                                        }
                                    })
                                    .catch((err) => console.log(err));
                            });
                        });
                    }
                } // else bracket ends here
            })
            .catch(err => console.log(err))

    });


// 03 Get Login Page
Router.get('/login', (req, res) => {
    res.render('login');
});

// 04 Post Login data to database
Router.post("/login", function (req, res, next) {
    passport.authenticate("local", {
        successRedirect: "/admin",
        failureRedirect: "/auth/login",
        failureFlash: true,
    })(req, res, next);
});

// 05 Logout
Router.get("/logout", (req, res) => {
    req.logout();
    req.flash("danger", "You are logged out..");
    res.redirect("/");
});

// Access control systyme middleware
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        res.set(
            "Cache-Control",
            "no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0"
        );
        return next();
    } else {
        req.flash("warning", "You are not authorized. Please login !");
        res.redirect("/auth/login");
    }
}
module.exports = Router;