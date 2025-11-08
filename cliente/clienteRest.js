// 🟢 CORRECCIÓN SPRINT 2:
// La función AHORA recibe 'controlWeb' como parámetro
function ClienteRest(controlWeb) {
    let cw = controlWeb; // Y lo guarda en 'cw'

    // ========================================
    // 🟢 FUNCIONES SPRINT 1 (RE-AÑADIDAS)
    // ========================================

    this.agregarUsuario = function (nick) {
        $.getJSON("/agregarUsuario/" + nick, function (data) {
            let msg = "El nick " + nick + " está ocupado";
            if (data.nick != -1) {
                console.log("Usuario " + nick + " ha sido registrado");
                msg = "Bienvenido al sistema, " + nick;
                // $.cookie("nick", data.nick, { expires: 7 }); // 'comprobarSesion' ya no usa esto
            } else {
                console.log("El nick ya está ocupado");
            }
            cw.mostrarMensaje(msg); // 'cw' AHORA EXISTE
        });
    }

    this.agregarUsuario2 = function (nick) {
        $.ajax({
            type: 'GET',
            url: '/agregarUsuario/' + nick,
            success: function (data) {
                if (data.nick != -1) {
                    console.log("Usuario " + nick + " ha sido registrado");
                } else {
                    console.log("El nick ya está ocupado");
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("Status: " + textStatus);
                console.log("Error: " + errorThrown);
            },
            contentType: 'application/json'
        });
    }

    this.obtenerUsuarios = function () {
        // Esta función es llamada por 'mostrarObtenerUsuarios' en controlWeb
        // que hace su propio $.getJSON. Esta función (obtenerUsuarios)
        // realmente no hace nada en tu código actual, pero la mantenemos.
        $.getJSON("/obtenerUsuarios", function (data) {
            console.log("Lista de usuarios (desde clienteRest):", data);
        });
    }

    this.numeroUsuarios = function () {
        $.getJSON("/numeroUsuarios", function (data) {
            console.log("Datos recibidos del servidor:", data);
            let numero = data && data.num !== undefined ? data.num : 0;
            // Asegurarse de que el div existe antes de escribir en él
            if ($("#resultadoNumero").length) {
                $("#resultadoNumero").html("Número total de usuarios (en memoria): <strong>" + numero + "</strong>");
                $("#resultadoNumero").show();
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error("Error al obtener número de usuarios:", textStatus, errorThrown);
            $("#resultadoNumero").html("Error al obtener número de usuarios");
        });
    }

    this.usuarioActivo = function (nick) {
        // Esta función es llamada por 'mostrarUsuarioActivo' en controlWeb
        // que hace su propio $.getJSON. Esta función no se usa, pero la mantenemos.
        $.getJSON("/usuarioActivo/" + nick, function (data) {
            if (data.activo) {
                console.log("El usuario " + nick + " está activo");
            } else {
                console.log("El usuario " + nick + " NO está activo");
            }
        });
    }

    this.eliminarUsuario = function (nick) {
        $.getJSON("/eliminarUsuario/" + nick, function (data) {
            if (data.eliminado) {
                console.log("Usuario " + nick + " eliminado correctamente");
                cw.mostrarMensaje("Usuario " + nick + " eliminado de la memoria", "exito");
            } else {
                console.log("No se pudo eliminar el usuario " + nick);
                cw.mostrarMensaje("No se pudo eliminar el usuario " + nick, "error");
            }
        });
    }

    // ========================================
    // FUNCIONES SPRINT 2 (Login / Registro)
    // ========================================

    this.registrarUsuario = function (email, password, nombre, apellidos) {
        $.ajax({
            type: 'POST',
            url: '/registrarUsuario',
            data: JSON.stringify({
                "email": email,
                "password": password,
                "nombre": nombre,
                "apellidos": apellidos
            }),
            success: function (data) {
                if (data.nick != -1) {
                    console.log("Usuario " + data.nick + " ha sido registrado");
                    cw.limpiar(); // 'cw' AHORA EXISTE
                    cw.mostrarMensaje("Bienvenido al sistema, " + data.nick + ". Revisa tu email para confirmar.", "exito");
                    cw.mostrarAcceso(); // Volver al login
                } else {
                    console.log("No se pudo registrar el usuario");
                    cw.mostrarMensaje("Error: El usuario (email) ya existe", "error"); // 'cw' AHORA EXISTE
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("Status: " + textStatus);
                console.log("Error: " + errorThrown);
                cw.mostrarMensaje("Error en el servidor. Inténtalo más tarde.", "error"); // 'cw' AHORA EXISTE
            },
            contentType: 'application/json'
        });
    }

    this.loginUsuario = function (email, password) {
        $.ajax({
            type: 'POST',
            url: '/loginUsuario',
            data: JSON.stringify({ "email": email, "password": password }),
            success: function (data) {
                if (data.nick != -1) {
                    console.log("Usuario " + data.nick + " ha iniciado sesión");
                    cw.limpiar();
                    cw.mostrarHome();
                }
                else {
                    console.log("Usuario o clave incorrectos");
                    cw.mostrarMensaje("Email o contraseña incorrectos", "error"); // 'cw' AHORA EXISTE
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("Status: " + textStatus);
                console.log("Error: " + errorThrown);
                cw.mostrarMensaje("Error en el servidor al iniciar sesión.", "error"); // 'cw' AHORA EXISTE
            },
            contentType: 'application/json'
        });
    }
}