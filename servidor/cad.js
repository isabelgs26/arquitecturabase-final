const mongo = require("mongodb").MongoClient;

function CAD() {
    this.usuarios = null;

    // ========================
    // Conectar a MongoDB
    // ========================
    this.conectar = async function (callback) {
        let cad = this;
        const client = new mongo(
            "mongodb+srv://usuarioSistema:1006@cluster0.gsqlsou.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
            { useUnifiedTopology: true }
        );

        await client.connect();
        const database = client.db("sistema");
        cad.usuarios = database.collection("usuarios");
        callback(database);
    }

    this.buscarUsuario = function (criterio, callback) {
        this.usuarios.findOne(criterio, function (err, usuario) {
            if (err) {
                console.error("Error buscando usuario:", err);
                callback(null);
            } else {
                callback(usuario);
            }
        });
    }


    this.insertarUsuario = function (usuario, callback) {
        this.usuarios.insertOne(usuario, function (err, result) {
            if (err) {
                console.error("Error insertando usuario:", err);
                callback(null);
            } else {
                console.log("Usuario creado:", usuario.email || usuario.nick);
                callback(usuario);
            }
        });
    }
}

module.exports.CAD = CAD;
