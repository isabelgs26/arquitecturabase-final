const datos = require("./cad.js");
const bcrypt = require("bcrypt");

function Sistema(objConfig = {}) {
    this.cad = new datos.CAD();
    this.usuarios = {};

    this.test = objConfig.test || false;
}

Sistema.prototype.inicializar = async function () {
    console.log("Inicializando sistema y conexión a BD (modelo.js)...");

    if (!this.test) {
        console.log("Modo Producción: Conectando a MongoDB...");
        await this.cad.conectar();
        console.log("Conexión a BD (modelo.js) completada.");
    } else {
        console.log("Modo Test: Omitiendo conexión a MongoDB.");
    }
}


Sistema.prototype.usuarioGoogle = function (usr, callback) {
    this.cad.buscarOCrearUsuario(usr, function (obj) {
        callback(obj);
    });
}

Sistema.prototype.obtenerUsuarios = function (callback) {
    this.cad.buscarUsuarios({}, callback);
}

Sistema.prototype.registrarUsuario = function (obj, callback) {
    let modelo = this;
    if (!obj.nick) {
        obj.nick = obj.email;
    }

    this.cad.buscarUsuario({ email: obj.email }, function (usr) {
        if (!usr) {
            bcrypt.hash(obj.password, 10, function (err, hash) {
                if (err) {
                    console.error("Error al cifrar la contraseña:", err);
                    return callback({ "email": -1 });
                }
                obj.password = hash;
                modelo.cad.insertarUsuario(obj, function (res) {
                    callback(res);
                });
            });
        } else {
            callback({ "email": -1 });
        }
    });
};

Sistema.prototype.loginUsuario = function (obj, callback) {
    this.cad.buscarUsuario({ email: obj.email }, function (usr) {
        if (!usr) {
            callback({ "email": -1 });
            return;
        }
        bcrypt.compare(obj.password, usr.password, function (err, ok) {
            if (ok) {
                callback(usr);
            } else {
                callback({ "email": -1 });
            }
        });
    });
};


Sistema.prototype.agregarUsuario = function (nick) {
    let res = { "nick": -1 };
    if (!this.usuarios[nick]) {
        this.usuarios[nick] = new Usuario(nick);
        res.nick = nick;
    } else {
        console.log("el nick " + nick + " está en uso");
    }
    return res;
}
Sistema.prototype.usuarioActivo = function (nick) {
    let res = { "activo": false };
    if (this.usuarios[nick]) {
        res.activo = true;
    }
    return res;
}
Sistema.prototype.eliminarUsuario = function (nick) {
    let res = { "eliminado": false };
    if (this.usuarios[nick]) {
        delete this.usuarios[nick];
        res.eliminado = true;
    }
    return res;
}
Sistema.prototype.numeroUsuarios = function () {
    const usuariosValidos = Object.values(this.usuarios).filter(u => u && u.nick);
    const num = usuariosValidos.length;
    return { "num": num };
}
function Usuario(nick) {
    this.nick = nick;
}

module.exports.Sistema = Sistema;