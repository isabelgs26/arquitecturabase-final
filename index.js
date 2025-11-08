require('dotenv').config();
const express = require("express");
const path = require("path");
const passport = require("passport");
const cookieSession = require("cookie-session");
const modelo = require("./servidor/modelo.js");
const fs = require("fs");
const bodyParser = require("body-parser");

const sistema = new modelo.Sistema({ test: false });
const app = express();

require("./servidor/passport-setup.js");

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


app.get("/sesion", function (req, res) {
    res.json({
        autenticado: req.isAuthenticated(),
        usuario: req.user
    });
});

app.get("/cerrarSession", function (req, res) {
    if (req.user && req.user.email) {
        sistema.eliminarUsuario(req.user.email);
    }
    req.logout(function (err) {
        if (err) { return res.status(500).json({ error: "Error al cerrar sesión" }); }
        req.session = null;
        res.clearCookie('Sistema');
        res.clearCookie('connect.sid');
        res.json({ success: true, message: "Sesión cerrada correctamente" });
    });
});

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
        failureRedirect: '/',
        session: false
    })
);

app.get("/fallo", function (request, response) {
    response.send({ "nick": "nook" });
});

app.get("/good", function (request, response) {
    if (request.user && request.user.email) {
        let email = request.user.email;
        let userName = request.user.nombre || email;

        sistema.usuarioGoogle({ "email": email, "nombre": userName }, function (obj) {
            console.log("Usuario de Google (ruta /good) PROCESADO EN BD:", obj.email);
            response.cookie('nick', userName);
            response.redirect('/');
        });
    } else {
        console.error("Error en /good: req.user no está definido o no tiene email.");
        response.redirect('/');
    }
});


app.get("/obtenerUsuarios", function (req, res) {
    sistema.obtenerUsuarios(function (usuarios) {
        res.json(usuarios); // Devuelve los usuarios de la BD
    });
});


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


app.get("/agregarUsuario/:nick", function (req, res) {
    let nick = req.params.nick;
    let resultado = sistema.agregarUsuario(nick);
    res.json(resultado);
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
// ========================


// INICIO DEL SERVIDOR 
sistema.inicializar().then(() => {
    console.log("Sistema inicializado con base de datos");
    app.listen(PORT, () => {
        console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
}).catch(err => {
    console.error("Error inicializando sistema:", err);
});