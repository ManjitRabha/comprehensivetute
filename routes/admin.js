const express = require("express");
const Router = express.Router();
const mongoose = require("mongoose");

const Person = require("../models/Person.js");
const Upload = require("../models/Upload.js");

// @type    GET
//@route    /admin
// @desc    route for getting PERSONAL PAGE based on LOGIN
// @access  PRIVATE
Router.get("/", ensureAuthenticated, (req, res) => {
  Upload.find({ user: req.user })
    .populate("user", ["name", "email", "profilepic", "password"])
    .then((found) => {
      if (!found) {
        req.flash("danger", "Data not found");
        res.redirect("/admin");
      } else {
        res.render("admin", { data: found });
        console.log(found);
      }
    })
    .catch((err) => console.log("Error finding" + err));

  // res.render("admin", { user: req.user });
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
