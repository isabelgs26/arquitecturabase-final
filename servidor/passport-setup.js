const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GoogleOneTapStrategy = require("passport-google-one-tap").GoogleOneTapStrategy; // ✅ AÑADIR ESTO

// Cargar .env con opciones específicas
require('dotenv').config({ override: true });


passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

// Estrategia Google OAuth tradicional
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, function (accessToken, refreshToken, profile, done) {
    return done(null, profile);
}));

passport.use('google-one-tap', new GoogleOneTapStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    verifyCsrfToken: false
}, function (profile, done) {
    return done(null, profile);
}));

module.exports = passport;