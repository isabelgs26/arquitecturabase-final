require('dotenv').config();

const express = require("express");
const path = require("path");
const passport = require("passport");
const cookieSession = require("cookie-session");
const modelo = require("./servidor/modelo.js");
const fs = require("fs");

// bodyParser está obsoleto, express ya lo incluye.
// const bodyParser = require("body-parser"); 

const sistema = new modelo.Sistema({ test: false });
const app = express();

require("./servidor/passport-setup.js");

const PORT = process.env.PORT || 3000;

// Usamos los middlewares modernos de Express para parsear JSON y URL-encoded
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

// --- CAMBIO 1: Cierre de Sesión (Sección 2.9) ---
// Se usa request.logout() como pide Passport [cite: 884-886]
app.get("/cerrarSession", function (request, response, next) {
    request.logout(function (err) { // logout() requiere un callback
        if (err) {
            return next(err);
        }
        response.clearCookie('nick'); // Limpiamos la cookie del cliente
        response.redirect("/"); // Redirigimos a la raíz
    });
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
    response.send({ "nick": "nook" });
});

// Ruta /good (Sin cambios, la dejamos con los logs de depuración)
app.get("/good", function (request, response) {
    console.log("--- DEBUG: Entrando a /good ---");
    if (!request.user || !request.user.emails || request.user.emails.length === 0) {
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

// Ruta de Registro (Sin cambios, estaba bien)
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

// --- CAMBIO 2: Login Local (Sección 2.8) ---
// Ahora usa passport.authenticate("local") como pide el PDF [cite: 826-830]
app.post('/loginUsuario',
    passport.authenticate("local", {
        failureRedirect: "/fallo", // Reutilizamos la ruta de fallo
        successRedirect: "/ok"      // Nueva ruta de éxito para login local
    })
);

// Nueva ruta /ok para manejar el éxito del login local [cite: 828-830]
app.get("/ok", function (request, response) {
    // request.user existe gracias a Passport
    response.cookie('nick', request.user.email); // Creamos la cookie 'nick'
    response.send({ nick: request.user.email }); // Enviamos JSON al cliente
});


// --- CAMBIO 3: Ruta Obsoleta Eliminada ---
// Se elimina /agregarUsuario/:nick porque era del Sprint 1 (manejo en memoria)
/*
app.get("/agregarUsuario/:nick", function (req, res) {
    let nick = req.params.nick;
    let resultado = sistema.agregarUsuario(nick);
    res.json(resultado);
});
*/

// Rutas de API de la Base de Datos (Sin cambios, estaban bien)
app.get("/obtenerUsuarios", function (req, res) {
    sistema.obtenerUsuarios(function (usuarios) {
        res.json(usuarios);
    });
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

// Inicio del servidor (Sin cambios, estaba bien)
sistema.inicializar().then(() => {
    console.log("Sistema inicializado con base de datos");
    app.listen(PORT, () => {
        console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
}).catch(err => {
    console.error("Error inicializando sistema:", err);
});