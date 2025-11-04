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

// MIDDLEWARES BÁSICOS
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// RUTA RAÍZ (index.html)
app.get("/", function (request, response) {
    let contenido = fs.readFileSync(__dirname + "/cliente/index.html", "utf8");
    contenido = contenido.replace("GOOGLE_CLIENT_ID_PLACEHOLDER", process.env.GOOGLE_CLIENT_ID);
    response.setHeader("Content-type", "text/html");
    response.send(contenido);
});

// MIDDLEWARE DE ESTÁTICOS
app.use(express.static(__dirname + "/cliente"));

// CONFIGURACIÓN DE SESIÓN Y PASSPORT
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
    if (req.user && req.user.email) {
        sistema.eliminarUsuario(req.user.email); // Esto es de la memoria local
    }
    req.logout(function (err) {
        if (err) { return res.status(500).json({ error: "Error al cerrar sesión" }); }
        req.session = null;
        res.clearCookie('Sistema');
        res.clearCookie('connect.sid');
        res.json({ success: true, message: "Sesión cerrada correctamente" });
    });
});


// ========================
// GOOGLE OAUTH TRADICIONAL 
// ========================
app.get("/auth/google", passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get("/google/callback",
    passport.authenticate('google', { failureRedirect: '/' }),
    function (req, res) {
        if (req.user && req.user.email) {
            let email = req.user.email;
            let userName = req.user.nombre || email;

            sistema.usuarioGoogle({ "email": email, "nombre": userName }, function (obj) {
                console.log("Usuario de Google (callback) PROCESADO EN BD:", obj.email);
                res.cookie('nick', userName);
                res.redirect('/');
            });
        } else {
            res.redirect('/');
        }
    }
);

// ========================
// GOOGLE ONE TAP 
// ========================
app.post('/oneTap/callback',
    passport.authenticate('google-one-tap', { session: false }),
    function (req, res) {
        if (req.user && req.user.emails && req.user.emails[0]) {
            let email = req.user.emails[0].value;
            let userName = req.user.displayName || email;

            sistema.usuarioGoogle({ "email": email, "nombre": userName }, function (obj) {
                console.log("Usuario de Google (One Tap) PROCESADO EN BD:", obj.email);
                res.cookie('nick', userName);
                res.redirect('/');
            });
        } else {
            res.redirect('/');
        }
    }
);

app.get("/fallo", function (request, response) {
    response.send({ "nick": "nook" });
});

app.get("/good", function (request, response) {
    if (req.user && req.user.email) {
        let email = req.user.email;
        let userName = req.user.nombre || email;

        sistema.usuarioGoogle({ "email": email, "nombre": userName }, function (obj) {
            response.cookie('nick', userName);
            response.redirect('/');
        });
    } else {
        res.redirect('/');
    }
});


// ========================
// "VER USUARIOS" 
// ========================
app.get("/obtenerUsuarios", function (req, res) {
    sistema.obtenerUsuarios(function (usuarios) {
        res.json(usuarios); // Devuelve los usuarios de la BD
    });
});


// ========================
// RUTAS DE REGISTRO Y LOGIN LOCAL 
// ========================
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
sistema.inicializar().then(() => {
    console.log("Sistema inicializado con base de datos");
    app.listen(PORT, () => {
        console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
}).catch(err => {
    console.error("Error inicializando sistema:", err);
});