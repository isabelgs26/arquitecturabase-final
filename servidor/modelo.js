const datos = require("./cad.js");

function Sistema() {
    this.cad = new datos.CAD();
    this.usuarios = {};

    this.inicializar = async function () {
        console.log("Inicializando sistema y conexión a BD...");
        await this.cad.conectar(function (db) {
            console.log("Conectado a Mongo Atlas - Base de datos lista");
        });
    }
    this.usuarioGoogle = function (usr, callback) {
        this.cad.buscarOCrearUsuario(usr, function (obj) {
            callback(obj);
        });
    }
    this.agregarUsuario = function (nick) {
        let res = { "nick": -1 };
        if (!this.usuarios[nick]) {
            this.usuarios[nick] = new Usuario(nick);
            res.nick = nick;
        } else {
            console.log("el nick " + nick + " está en uso");
        }
        return res;
    }

    this.obtenerUsuarios = function () {
        return this.usuarios;
    }

    this.usuarioActivo = function (nick) {
        let res = { "activo": false };
        if (this.usuarios[nick]) {
            res.activo = true;
        }
        return res;
    }

    this.eliminarUsuario = function (nick) {
        let res = { "eliminado": false };
        if (this.usuarios[nick]) {
            delete this.usuarios[nick];
            res.eliminado = true;
        }
        return res;
    }

    this.numeroUsuarios = function () {
        const usuariosValidos = Object.values(this.usuarios).filter(u => u && u.nick);
        const num = usuariosValidos.length;
        return { "num": num };
    }

    const bcrypt = require("bcrypt");

    this.registrarUsuario = function (obj, callback) {
        let modelo = this;
        if (!obj.nick) {
            obj.nick = obj.email;
        }

        this.cad.buscarUsuario({ email: obj.email }, async function (usr) {
            if (!usr) {
                try {
                    const hash = await bcrypt.hash(obj.password, 10);
                    obj.password = hash;
                    modelo.cad.insertarUsuario(obj, function (res) {
                        callback(res);
                    });
                } catch (error) {
                    console.error("Error al cifrar la contraseña:", error);
                    callback({ "email": -1 });
                }
            } else {
                callback({ "email": -1 });
            }
        });
    };

    this.loginUsuario = function (obj, callback) {
        this.cad.buscarUsuario({ email: obj.email }, function (usr) {
            if (!usr) {
                callback({ "email": -1 });
                return;
            }
            // 🔐 Comprobar contraseña cifrada
            bcrypt.compare(obj.password, usr.password, function (err, ok) {
                if (ok) {
                    callback(usr);
                } else {
                    callback({ "email": -1 });
                }
            });
        });
    };

    function Usuario(nick) {
        this.nick = nick;
    }
}
module.exports.Sistema = Sistema;