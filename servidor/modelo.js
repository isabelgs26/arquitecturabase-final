const datos = require("./cad.js");

function Sistema() {
    this.cad = new datos.CAD();
    this.usuarios = {};

    this.inicializar = async function () {
        console.log("Inicializando sistema...");
        await this.cad.conectar(() => {
            console.log("Sistema inicializado con base de datos");
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

    this.registrarUsuario = function (obj, callback) {
        let modelo = this;
        if (!obj.nick) {
            obj.nick = obj.email;
        }
        this.cad.buscarUsuario({ email: obj.email }, function (usr) {
            if (!usr) {
                modelo.cad.insertarUsuario(obj, function (res) {
                    callback(res);
                });
            }
            else {
                callback({ "email": -1 });
            }
        });
    }

    this.loginUsuario = function (obj, callback) {
        this.cad.buscarUsuario({ email: obj.email }, function (usr) {
            if (usr && usr.password === obj.password) {
                callback(usr);
            } else {
                callback({ "email": -1 });
            }
        });
    }
}

function Usuario(nick) {
    this.nick = nick;
}

module.exports.Sistema = Sistema;