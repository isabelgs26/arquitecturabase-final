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
    name: 'Sistema', // Este es el nombre de la cookie de sesión
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

// --- ESTA ES LA CORRECCIÓN DEFINITIVA ---
// Esta versión no usa request.logout() (que se cuelga)
app.get("/cerrarSession", function (request, response, next) {

    // 1. Destruye la sesión en el servidor (para cookie-session)
    request.session = null;

    // 2. Borra la cookie de sesión principal
    response.clearCookie('Sistema');

    // 3. (LA LÍNEA CLAVE) Borra la cookie 'nick' que usa el cliente
    response.clearCookie('nick');

    // 4. Redirige a la raíz (esto ya no se colgará)
    response.redirect("/");
});
// ---------------------------------


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
    response.send({ "nick": "nook" });
});

app.get("/good", function (request, response) {

    console.log("--- DEBUG: Entrando a /good ---");

    if (!request.user || !request.user.emails || !request.user.emails.length === 0) {
        console.error("Error en /good: request.user no está completo. Redirigiendo a /.");
        return response.redirect('/');
    }

    let email;
    let userName;

    try {
        email = request.user.emails[0].value;
        userName = request.user.displayName || email;

        console.log(`DEBUG: Email obtenido: ${email}, Nombre obtenido: ${userName}`);

    } catch (e) {
        console.error("Error CRÍTICO al leer 'request.user':", e.message);
        return response.redirect('/');
    }

    console.log("DEBUG: Llamando a sistema.usuarioGoogle...");

    sistema.usuarioGoogle({ "email": email, "nombre": userName }, function (obj) {

        console.log("DEBUG: Callback de sistema.usuarioGoogle SÍ se ejecutó.");
        console.log("DEBUG: Usuario procesado en BD:", obj.email);

        response.cookie('nick', userName);
        response.redirect('/');

    });
});

app.get("/obtenerUsuarios", function (req, res) {
    sistema.obtenerUsuarios(function (usuarios) {
        res.json(usuarios);
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