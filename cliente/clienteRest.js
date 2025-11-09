function ClienteRest(controlWeb) {
    let cw = controlWeb;

    // (Se eliminan agregarUsuario y agregarUsuario2 del Sprint 1)

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
                // Lógica de Tarea 2.5 (Éxito/Fallo)
                if (data.nick != -1) {
                    console.log("Usuario " + data.nick + " ha sido registrado");
                    cw.limpiar();
                    cw.mostrarMensaje("Usuario registrado con éxito. Inicia sesión para acceder al sistema.", "exito");
                    cw.mostrarAcceso(); // Requisito 1: Mostrar login
                } else {
                    console.log("No se pudo registrar el usuario");
                    cw.mostrarMensaje("Error: El usuario (email) ya existe", "error"); // Requisito 2: Mostrar error
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
            url: '/loginUsuario', // Esta ruta ahora usa Passport
            data: JSON.stringify({ "email": email, "password": password }),
            success: function (data) {
                // Lógica de Tarea 2.8 (Passport)
                if (data.nick !== "nook" && data.nick !== -1) {
                    console.log("Usuario " + data.nick + " ha iniciado sesión");
                    $.cookie("nick", data.nick);
                    cw.limpiar();
                    cw.mostrarHome(data.nick);
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
            let numero = data && data.num !== undefined ? data.num : 0;
            if ($("#resultadoNumero").length) {
                $("#resultadoNumero").html("Número total de usuarios (en BD): <strong>" + numero + "</strong>");
                $("#resultadoNumero").show();
            }
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