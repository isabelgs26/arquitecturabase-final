function CAD() {
    const mongo = require("mongodb").MongoClient;
    const ObjectId = require("mongodb").ObjectId;

    this.usuarios = null;


    this.conectar = async function () {
        let cad = this;
        const mongoUrl = process.env.MONGODB_URI;
        let client = new mongo(mongoUrl, { useUnifiedTopology: true });

        try {
            await client.connect();
            const database = client.db("sistema");
            cad.usuarios = database.collection("usuarios");
            console.log("Conexión a BD (cad.js) exitosa y 'cad.usuarios' asignado.");
        } catch (err) {
            console.error("Error al conectar a MongoDB (cad.js):", err);
            throw new Error("No se pudo conectar a la base de datos");
        }
    }

    this.buscarOCrearUsuario = function (usr, callback) {
        buscarOCrear(this.usuarios, usr, callback);
    }
    function buscarOCrear(coleccion, criterio, callback) {
        coleccion.findOneAndUpdate(criterio, { $set: criterio }, {
            upsert: true,
            returnDocument: "after",
            projection: { email: 1 }
        }, function (err, doc) {
            if (err) { throw err; }
            else {
                console.log("Elemento actualizado (o creado) por Google");
                if (doc && doc.value) {
                    console.log(doc.value.email);
                    callback({ email: doc.value.email });
                } else {
                    console.log("Documento creado, devolviendo criterio.");
                    callback({ email: criterio.email });
                }
            }
        });
    }


    this.buscarUsuario = function (criterio, callback) {
        buscar(this.usuarios, criterio, callback);
    }
    this.insertarUsuario = function (usuario, callback) {
        insertar(this.usuarios, usuario, callback);
    }
    function buscar(coleccion, criterio, callback) {
        coleccion.find(criterio).toArray(function (error, usuarios) {
            if (error) {
                console.error("Error en 'buscar' (cad.js):", error);
                return callback(undefined);
            }
            if (usuarios.length == 0) {
                callback(undefined);
            } else {
                callback(usuarios[0]);
            }
        });
    }
    function insertar(coleccion, elemento, callback) {
        coleccion.insertOne(elemento, function (err, result) {
            if (err) {
                console.log("error al insertar (cad.js):", err);
                callback(undefined);
            } else {
                console.log("Nuevo elemento creado (Registro Local)");
                callback(elemento);
            }
        });
    }


    this.buscarUsuarios = function (criterio, callback) {
        buscarPlural(this.usuarios, criterio, callback);
    }
    function buscarPlural(coleccion, criterio, callback) {
        coleccion.find(criterio).toArray(function (error, usuarios) {
            if (error) {
                console.error("Error en 'buscarPlural' (cad.js):", error);
                return callback([]); // Devolver array vacío en error
            }
            callback(usuarios); // Devolver todos los usuarios
        });
    }
}

module.exports.CAD = CAD;