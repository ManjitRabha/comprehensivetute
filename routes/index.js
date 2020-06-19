const express = require('express');
const Router = express.Router();
const mongoose = require('mongoose');


// Import Subscriber model
const Subscriber = require('../models/Suscriber.js');

// Home Route Type Get
// @type    GET
//@route    /
// @desc    route for Home Page
// @access  PUBLIC
Router.get('/', (req, res) => {
    res.render('index');
});

// @type    POST
//@route    /subscribe
// @desc    route for Subscriber with email ID
// @access  PUBLIC

Router.post('/subscribe', (req, res) => {
    Subscriber.findOne({ email: req.body.email })
        .then(subscriber => {
            if (subscriber) {
                req.flash('warning', 'Your email is alredy subscribed...');
                res.render('index');
            } else {
                const newSubscriber = new Subscriber({
                    email: req.body.email,
                });
                newSubscriber.save()
                    .then(saved => {
                        if (saved) {
                            req.flash('success', 'Email has been subscribed..');
                            res.redirect('/');
                        }
                    })
                    .catch(err => console.log(err));
            };
        })
        .catch(err => console.log(err));
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