const express = require("express");
const path = require("path");
const passport = require("passport");
const cookieSession = require("cookie-session");
const modelo = require("./servidor/modelo.js");
const fs = require("fs");
const bodyParser = require("body-parser"); // AÑADIR ESTO

const sistema = new modelo.Sistema();
const app = express();
require('dotenv').config();

require("./servidor/passport-setup.js");

const PORT = process.env.PORT || 3000;

// MIDDLEWARES (AÑADIR bodyParser)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/cliente"));
app.use(cookieSession({
    name: 'Sistema',
    keys: ['key1', 'key2']
}));
app.use(passport.initialize());
app.use(passport.session());

// RUTAS DE AUTENTICACIÓN
app.get("/sesion", function (req, res) {
    res.json({
        autenticado: req.isAuthenticated(),
        usuario: req.user
    });
});

app.get("/cerrarSession", function (req, res) {
    if (req.user && req.user.emails && req.user.emails[0]) {
        let email = req.user.emails[0].value;
        sistema.eliminarUsuario(email);
    }

    req.logout(function (err) {
        if (err) {
            return res.status(500).json({ error: "Error al cerrar sesión" });
        }
        req.session = null;
        res.clearCookie('Sistema');
        res.clearCookie('connect.sid');
        res.json({ success: true, message: "Sesión cerrada correctamente" });
    });
});

// RUTA PRINCIPAL
app.get("/", function (request, response) {
    let contenido = fs.readFileSync(__dirname + "/cliente/index.html", "utf8");
    contenido = contenido.replace("GOOGLE_CLIENT_ID_PLACEHOLDER", process.env.GOOGLE_CLIENT_ID);
    response.setHeader("Content-type", "text/html");
    response.send(contenido);
});

// GOOGLE OAUTH TRADICIONAL
app.get("/auth/google", passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get("/google/callback",
    passport.authenticate('google', { failureRedirect: '/' }),
    function (req, res) {
        if (req.user && req.user.emails && req.user.emails[0]) {
            let email = req.user.emails[0].value;
            let userName = req.user.displayName || email;
            sistema.agregarUsuario(email);
            res.cookie('nick', userName);
        }
        res.redirect('/');
    }
);

// ✅ GOOGLE ONE TAP 
app.post('/oneTap/callback',
    passport.authenticate('google-one-tap', {
        session: false
    }),
    function (req, res) {
        if (req.user && req.user.emails && req.user.emails[0]) {
            let email = req.user.emails[0].value;
            let userName = req.user.displayName || email;
            sistema.agregarUsuario(email);
            res.cookie('nick', userName);
            res.json({ success: true, user: email });
        } else {
            res.json({ success: false, error: "No se pudo autenticar" });
        }
    }
);

app.get("/fallo", function (request, response) {
    response.send({ "nick": "nook" });
});

app.get("/good", function (request, response) {
    if (request.user && request.user.emails && request.user.emails[0]) {
        let email = request.user.emails[0].value;
        let userName = request.user.displayName || email;
        response.cookie('nick', userName);
    }
    response.redirect('/');
});

// RUTAS DE USUARIOS
app.get("/agregarUsuario/:nick/:email/:password", function (request, response) {
    let nick = request.params.nick;
    let email = request.params.email;
    let password = request.params.password;
    let res = sistema.agregarUsuario(nick, email, password);
    response.send(res);
});

app.get("/agregarUsuario/:nick", function (req, res) {
    let nick = req.params.nick;
    let resultado = sistema.agregarUsuario(nick);
    res.json(resultado);
});

app.get("/obtenerUsuarios", function (req, res) {
    let usuarios = sistema.obtenerUsuarios();
    res.json(usuarios);
});

app.get("/usuarioActivo/:nick", function (req, res) {
    let nick = req.params.nick;
    let resultado = sistema.usuarioActivo(nick);
    res.json(resultado);
});

app.get("/numeroUsuarios", function (req, res) {
    let resultado = sistema.numeroUsuarios();
    res.json(resultado);
});

app.get("/eliminarUsuario/:nick", function (req, res) {
    let nick = req.params.nick;
    let resultado = sistema.eliminarUsuario(nick);
    res.json(resultado);
});

// REGISTRO Y LOGIN
app.post("/registrarUsuario", function (req, res) {
    let obj = req.body;
    sistema.registrarUsuario(obj, function (resultado) {
        if (resultado && resultado.email !== -1) {
            res.json({ nick: resultado.email });
        } else {
            res.json({ nick: -1 });
        }
    });
});

app.post("/loginUsuario", function (req, res) {
    sistema.loginUsuario(req.body, function (resultado) {
        if (resultado && resultado.email !== -1) {
            res.json({ nick: resultado.email });
        } else {
            res.json({ nick: -1 });
        }
    });
});

// INICIO DEL SERVIDOR
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});