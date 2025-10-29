const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Cargar .env con opciones específicas
require('dotenv').config({ override: true });

// Verificación forzada
console.log('🔐 CREDENCIALES CARGADAS:');
console.log('CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, function (accessToken, refreshToken, profile, done) {
    return done(null, profile);
}));

module.exports = passport;