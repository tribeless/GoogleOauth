const express = require("express");

require("dotenv").config();
const configValues = process.env;
const {
    PORT,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET
} = configValues;

const app = express();

app.set("view engine","ejs");
app.set("views","views");

app.use(express.urlencoded({extended:false}));
const session = require('express-session');

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET'
}));

app.get("/",(req,res)=>{
    res.render("pages/auth");
});


app.listen(PORT,()=>console.log(`App running on port ${PORT}`));

/*Passport
*setup
**/
const passport = require('passport');
let userProfile;

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

app.get('/success', (req, res) => res.send(userProfile));
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

/*
Google oauth2
****/
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
passport.use(new GoogleStrategy({
    clientID:GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    userProfile = profile;
    return done(null,userProfile);
}));

app.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect success.
    res.redirect('/success');
  });