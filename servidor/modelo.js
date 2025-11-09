// EN: servidor/modelo.js

const datos = require("./cad.js");
const bcrypt = require("bcrypt");

function Sistema(objConfig = {}) {
    this.cad = new datos.CAD();
    this.test = objConfig.test || false;
    // Se elimina this.usuarios = {} (obsoleto del Sprint 1)
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

// Correcto para Sprint 2 [cite: 408-411]
Sistema.prototype.usuarioGoogle = function (usr, callback) {
    this.cad.buscarOCrearUsuario(usr, callback);
}

Sistema.prototype.obtenerUsuarios = function (callback) {
    this.cad.buscarUsuarios({}, callback);
}

// Correcto para Sprint 2 [cite: 608-628]
Sistema.prototype.registrarUsuario = function (obj, callback) {
    let modelo = this;
    if (!obj.nick) {
        obj.nick = obj.email;
    }

    this.cad.buscarUsuario({ email: obj.email }, function (usr) {
        if (!usr) {
            // Cifrar clave [cite: 844, 1041]
            bcrypt.hash(obj.password, 10, function (err, hash) {
                if (err) {
                    console.error("Error al cifrar la contraseña:", err);
                    return callback({ "email": -1 });
                }
                obj.password = hash;
                // Insertar usuario [cite: 615]
                modelo.cad.insertarUsuario(obj, callback);
            });
        } else {
            callback({ "email": -1 }); // Usuario ya existe [cite: 621]
        }
    });
};

// Correcto para Sprint 2 [cite: 818, 978-999]
Sistema.prototype.loginUsuario = function (obj, callback) {
    this.cad.buscarUsuario({ email: obj.email }, function (usr) {
        if (!usr) {
            return callback({ "email": -1 });
        }
        // Comparar clave cifrada [cite: 845, 990]
        bcrypt.compare(obj.password, usr.password, function (err, ok) {
            if (ok) {
                callback(usr);
            } else {
                callback({ "email": -1 });
            }
        });
    });
};

Sistema.prototype.usuarioActivo = function (email, callback) {
    this.cad.buscarUsuario({ email: email }, function (usr) {
        if (usr) {
            callback({ activo: true });
        } else {
            callback({ activo: false });
        }
    });
}

Sistema.prototype.eliminarUsuario = function (email, callback) {
    this.cad.eliminarUsuario({ email: email }, function (res) {
        callback(res);
    });
}

Sistema.prototype.numeroUsuarios = function (callback) {
    this.cad.contarUsuarios({}, callback);
}

// Se eliminan Sistema.prototype.agregarUsuario y function Usuario(nick) (obsoletos del Sprint 1)

module.exports.Sistema = Sistema;