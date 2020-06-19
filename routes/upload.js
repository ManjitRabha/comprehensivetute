const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const Router = express.Router();
require("dotenv").config();
const youremail = process.env.EMAIL;
const password = process.env.PASSWORD;

// Import Model "Upload"
const Upload = require("../models/Upload.js");
const subscriber = require("../models/Suscriber.js");
// Routes

// @type    GET
//@route    /upload
// @desc    route for getting user profile based on USERNAME
// @access  PUBLIC
Router.get("/", ensureAuthenticated, (req, res) => {
  res.render("upload", { user: req.user });
});

// Post upload. js model data and send email to subscriber
// Dynamically using mongodb

// @type    GET
//@route    /upload
// @desc    route for getting user profile based on USERNAME
// @access  PUBLIC
Router.post("/", ensureAuthenticated, (req, res) => {
  const newUpload = new Upload({
    _id: new mongoose.Types.ObjectId(),
    user: req.user.id,
    title: req.body.title,
    detail: req.body.detail,
  });
  // Saving data to database
  newUpload
    .save()
    .then((saved) => {
      if (saved) {
        subscriber
          .find({})
          .then((found) => {
            if (found) {
              let mailList = [];
              found.forEach((emails) => {
                mailList.push(emails.email);
                return mailList;
              });
              // create reusable transporter object using the default SMTP transport
              // Create an output variable for email
              const output = `
                    <h3> This is an Email From sakorisakori.com</h3>
                    <h6> A private initiative from Partha Pratim Garg </h6>
                    <p> ${req.body.title}</p>;
                    <p> ${req.body.detail}</p>`;
              let transporter = nodemailer.createTransport({
                service: "gmail",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                  user: youremail, // generated ethereal user
                  pass: password, // generated ethereal password
                },
                tls: {
                  rejectUnauthorized: false,
                },
              });
              // setup email data with unicode symbols
              let mailOptions = {
                from: '"sakorisakori.com" <polestar2020im@gmail.com>', // sender address
                to: mailList, // list of receivers
                subject: "A Job Advertise Website", // Subject line
                text: "Hello world?", // plain text body
                // html: "<h1> Email is Recived </h1>" // html body
                html: output,
              };
              // send mail with defined transport object
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  return console.log(error);
                }
                console.log("Message sent: %s", info.messageId);
                console.log(
                  "Preview URL: %s",
                  nodemailer.getTestMessageUrl(info)
                );

                res.render("upload", { msg: "Email has been sent" });
              });
            } // found parameter else bracket
          })
          .catch((err) => console.log("Email Sending error" + err));
      } // saved parameter else bracket
    })
    .catch((err) => console.log(err));
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
