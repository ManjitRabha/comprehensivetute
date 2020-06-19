const express = require('express');
const app = express();
const path = require('path');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const session = require("express-session");
const cookieparser = require("cookie-parser");
const favicon = require('serve-favicon');
const createError = require('http-errors');
const passport = require('passport');
const config = require('./config/database');


// initialize serve-favicon
app.use(favicon(path.join(__dirname, 'public', 'logo.ico')))


// dotenv file setup
require('dotenv').config();
const PORT = process.env.PORT || 80;
const mongoUrl = process.env.DATABASE;

// setup body-parser middleware
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

// Serving Public folder
// app.use(express.static('public'));
app.use(express.static(path.join(__dirname)));




// Flash messages setup 
// cookie
app.use(cookieparser("keyboard cat"));
//session
app.use(
    session({
        secret: "keyboard cat",
        resave: true,
        maxAge: 1200000,
        saveUninitialized: true,
        // cookie: { secure: true }
    })
);
// Flash and express messages
// Express Messages Middleware
app.use(require("connect-flash")());
app.use(function (req, res, next) {
    res.locals.messages = require("express-messages")(req, res);
    next();
});

// view folder/engine setup
app.set('views', path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Passport Config
require("./config/passport")(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// MONGODB setup
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, });

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Database has been connected");
});


// Set Global Variable
app.get("*", function (req, res, next) {
    res.locals.user = req.user || null;
    next();
});
// Import Routes
const indexRouter = require('./routes/index');
app.use('/', indexRouter);
const authRouter = require('./routes/auth');
app.use('/auth', authRouter);
const uploadRouter = require('./routes/upload');
app.use('/upload', uploadRouter);
const adminRouter = require('./routes/admin');
app.use('/admin', adminRouter);




// Catch 404 and forward to error handler
app.use((req, res, next) => {
    next(new createError.NotFound());
});
// error handler
app.use((err, req, res, next) => {
    // render error page
    res.status(err.status || 500)
    res.render('error', { err })
});

app.listen(PORT, () => console.log(`App is running @Port => ${PORT}`));