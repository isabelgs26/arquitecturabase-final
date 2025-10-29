function ClienteRest() {

    this.agregarUsuario = function (nick) {
        $.getJSON("/agregarUsuario/" + nick, function (data) {
            let msg = "El nick " + nick + " está ocupado";
            if (data.nick != -1) {
                console.log("Usuario " + nick + " ha sido registrado");
                msg = "Bienvenido al sistema, " + nick;
                $.cookie("nick", data.nick, { expires: 7 });
            } else {
                console.log("El nick ya está ocupado");
            }
            cw.mostrarMensaje(msg);
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
                    $.cookie("nick", data.nick);
                    cw.limpiar();
                    cw.mostrarMensaje("Bienvenido al sistema, " + data.nick);
                } else {
                    console.log("No se pudo registrar el usuario");
                    cw.mostrarMensaje("Error: El usuario ya existe");
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("Status: " + textStatus);
                console.log("Error: " + errorThrown);
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
                    $.cookie("nick", data.nick);
                    ws.email = data.nick;
                    cw.limpiar();
                    cw.mostrarHome();
                }
                else {
                    console.log("Usuario o clave incorrectos");
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("Status: " + textStatus);
                console.log("Error: " + errorThrown);
            },
            contentType: 'application/json'
        });
    }

    this.numeroUsuarios = function () {
        $.getJSON("/numeroUsuarios", function (data) {
            console.log("Datos recibidos del servidor:", data);
            let numero = data && data.num !== undefined ? data.num : 0;
            $("#resultadoNumero").html("Número total de usuarios: <strong>" + numero + "</strong>");
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error("Error al obtener número de usuarios:", textStatus, errorThrown);
            $("#resultadoNumero").html("Error al obtener número de usuarios");
        });
    }

    this.usuarioActivo = function (nick) {
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
            } else {
                console.log("No se pudo eliminar el usuario " + nick);
            }
        });
    }
} 