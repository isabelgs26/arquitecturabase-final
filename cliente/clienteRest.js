function ClienteRest(controlWeb) {
    let cw = controlWeb;

    // --- ELIMINADAS ---
    // Las funciones "agregarUsuario" y "agregarUsuario2" se eliminan.
    // Eran del Sprint 1 y llamaban a la ruta obsoleta /agregarUsuario/:nick

    this.obtenerUsuarios = function () {
        $.getJSON("/obtenerUsuarios", function (data) {
            console.log("Lista de usuarios:", data);
        });
    }

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
                    cw.limpiar();
                    // El PDF pide enviar email de confirmación [cite: 521-523, 765-768]
                    // (Tu lógica de mostrar "Revisa tu email" es correcta)
                    cw.mostrarMensaje("Bienvenido al sistema, " + data.nick + ". Revisa tu email para confirmar.", "exito");
                    cw.mostrarAcceso();
                } else {
                    console.log("No se pudo registrar el usuario");
                    cw.mostrarMensaje("Error: El usuario (email) ya existe", "error");
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("Status: " + textStatus);
                console.log("Error: " + errorThrown);
                cw.mostrarMensaje("Error en el servidor. Inténtalo más tarde.", "error");
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
                // --- CORRECCIÓN ---
                // El login fallido (vía /fallo) ahora devuelve {nick: "nook"}
                // El login exitoso (vía /ok) devuelve {nick: "email@..."}
                if (data.nick !== "nook" && data.nick !== -1) {
                    console.log("Usuario " + data.nick + " ha iniciado sesión");
                    // Guardamos la cookie que nos dio el servidor
                    $.cookie("nick", data.nick);
                    cw.limpiar();
                    cw.mostrarHome();
                }
                else {
                    console.log("Usuario o clave incorrectos");
                    cw.mostrarMensaje("Email o contraseña incorrectos", "error");
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("Status: " + textStatus);
                console.log("Error: " + errorThrown);
                cw.mostrarMensaje("Error en el servidor al iniciar sesión.", "error");
            },
            contentType: 'application/json'
        });
    }

    this.numeroUsuarios = function () {
        $.getJSON("/numeroUsuarios", function (data) {
            console.log("Datos recibidos del servidor:", data);
            let numero = data && data.num !== undefined ? data.num : 0;
            if ($("#resultadoNumero").length) {
                $("#resultadoNumero").html("Número total de usuarios (en BD): <strong>" + numero + "</strong>");
                $("#resultadoNumero").show();
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error("Error al obtener número de usuarios:", textStatus, errorThrown);
            $("#resultadoNumero").html("Error al obtener número de usuarios");
        });
    }

    this.usuarioActivo = function (email) {
        $.getJSON("/usuarioActivo/" + email, function (data) {
            if (data.activo) {
                console.log("El usuario " + email + " está activo");
            } else {
                console.log("El usuario " + email + " NO está activo");
            }
        });
    }

    this.eliminarUsuario = function (email) {
        $.getJSON("/eliminarUsuario/" + email, function (data) {
            if (data.eliminado > 0) {
                console.log("Usuario " + email + " eliminado correctamente");
                cw.mostrarMensaje("Usuario " + email + " eliminado de la BD", "exito");
            } else {
                console.log("No se pudo eliminar el usuario " + email);
                cw.mostrarMensaje("No se pudo eliminar el usuario " + email, "error");
            }
        });
    }
}