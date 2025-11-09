require('dotenv').config();

const express = require("express");
const path = require("path");
const passport = require("passport");
const cookieSession = require("cookie-session");
const modelo = require("./servidor/modelo.js");
const fs = require("fs");
const bodyParser = require("body-parser");

// --- TAREA 2.8: Importar LocalStrategy ---
const LocalStrategy = require('passport-local').Strategy;

const sistema = new modelo.Sistema({ test: false });
const app = express();

require("./servidor/passport-setup.js"); // Carga Google/OneTap

const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", function (request, response) {
    let contenido = fs.readFileSync(__dirname + "/cliente/index.html", "utf8");
    contenido = contenido.replace("GOOGLE_CLIENT_ID_PLACEHOLDER", process.env.GOOGLE_CLIENT_ID);
    response.setHeader("Content-type", "text/html");
    response.send(contenido);
});

app.use(express.static(__dirname + "/cliente"));

app.use(cookieSession({
    name: 'Sistema',
    keys: ['key1', 'key2']
}));
app.use(passport.initialize());
app.use(passport.session());

// --- TAREA 2.8: Definir LocalStrategy ---
// (Se define aquí porque necesita acceso a la instancia 'sistema')
passport.use(new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    function (email, password, done) {
        // sistema.loginUsuario ya usa bcrypt.compare (Tarea 2.7)
        sistema.loginUsuario({ "email": email, "password": password }, function (user) {
            if (user.email === -1) {
                return done(null, false, { message: 'Email o contraseña incorrectos.' });
            } else {
                return done(null, user); // El usuario se guardará en req.user
            }
        });
    }
));

app.get("/sesion", function (req, res) {
    res.json({
        autenticado: req.isAuthenticated(),
        usuario: req.user
    });
});

// --- Cierre de Sesión CORREGIDO ---
app.get("/cerrarSession", function (request, response, next) {
    request.session = null;
    response.clearCookie('Sistema');
    response.clearCookie('nick');
    response.redirect("/");
});

// Rutas de Google (Sin cambios, estaban bien)
app.get("/auth/google", passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get("/google/callback",
    passport.authenticate('google', {
        successRedirect: '/good',
        failureRedirect: '/'
    })
);

app.post('/oneTap/callback',
    passport.authenticate('google-one-tap', {
        successRedirect: '/good',
        failureRedirect: '/'
    })
);
app.get("/fallo", function (request, response) {
    // Esta ruta la usa Passport en caso de fallo de autenticación
    response.send({ "nick": "nook" });
});

app.get("/good", function (request, response) {
    if (!request.user || !request.user.emails || !request.user.emails.length === 0) {
        return response.redirect('/');
    }
    let email = request.user.emails[0].value;
    let userName = request.user.displayName || email;

    sistema.usuarioGoogle({ "email": email, "nombre": userName }, function (obj) {
        response.cookie('nick', userName);
        response.redirect('/');
    });
});

app.get("/obtenerUsuarios", function (req, res) {
    sistema.obtenerUsuarios(function (usuarios) {
        res.json(usuarios);
    });
});

// Tarea 2.5: Ruta de Registro (Sin cambios)
app.post("/registrarUsuario", function (req, res) {
    let obj = req.body;
    sistema.registrarUsuario(obj, function (resultado) {
        res.json({ nick: resultado.email }); // Devuelve email o -1
    });
});

// --- TAREA 2.8: Ruta Login Local Asegurada ---
app.post('/loginUsuario',
    passport.authenticate("local", {
        failureRedirect: "/fallo", // Si falla, redirige a /fallo
        successRedirect: "/ok"      // Si OK, redirige a /ok
    })
);

// --- TAREA 2.8: Nueva ruta /ok ---
app.get("/ok", function (request, response) {
    let nick = request.user.nick || request.user.email;
    response.cookie('nick', nick);
    response.send({ nick: nick });
});

// --- RUTA OBSOLETA ELIMINADA ---
// app.get("/agregarUsuario/:nick", ...);

app.get("/usuarioActivo/:email", function (req, res) {
    let email = req.params.email;
    sistema.usuarioActivo(email, function (resultado) {
        res.json(resultado);
    });
});

app.get("/numeroUsuarios", function (req, res) {
    sistema.numeroUsuarios(function (resultado) {
        res.json(resultado);
    });
});

app.get("/eliminarUsuario/:email", function (req, res) {
    let email = req.params.email;
    sistema.eliminarUsuario(email, function (resultado) {
        res.json(resultado);
    });
});

sistema.inicializar().then(() => {
    console.log("Sistema inicializado con base de datos");
    app.listen(PORT, () => {
        console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
}).catch(err => {
    console.error("Error inicializando sistema:", err);
});