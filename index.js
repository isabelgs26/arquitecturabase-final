const express = require("express");
const path = require("path");
const passport = require("passport");
const cookieSession = require("cookie-session");
const modelo = require("./servidor/modelo.js");
const fs = require("fs");

const sistema = new modelo.Sistema();
const app = express();
require('dotenv').config();

require("./servidor/passport-setup.js");

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/cliente"));
app.use(cookieSession({
    name: 'Sistema',
    keys: ['key1', 'key2']
}));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", function (request, response) {
    var contenido = fs.readFileSync(__dirname + "/cliente/index.html");
    response.setHeader("Content-type", "text/html");
    response.send(contenido);
});

app.get("/auth/google", passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get("/google/callback",
    passport.authenticate('google', { failureRedirect: '/' }),
    function (req, res) {
        res.redirect('/');
    }
);

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

app.post("/registrarUsuario", function (req, res) {
    console.log("Petición POST /registrarUsuario recibida:", req.body);
    let obj = req.body;
    sistema.registrarUsuario(obj, function (resultado) {
        if (resultado && resultado.email !== -1) {
            console.log("Usuario registrado:", resultado.email);
            res.json({ nick: resultado.email });
        } else {
            console.log("Error: usuario existente o inválido");
            res.json({ nick: -1 });
        }
    });
});

app.post("/loginUsuario", function (req, res) {
    console.log("Petición POST /loginUsuario recibida:", req.body);
    sistema.loginUsuario(req.body, function (resultado) {
        if (resultado && resultado.email !== -1) {
            console.log("Login correcto:", resultado.email);
            res.json({ nick: resultado.email });
        } else {
            console.log("Email o contraseña incorrectos");
            res.json({ nick: -1 });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    console.log("Usuarios actuales:", sistema.obtenerUsuarios());
});