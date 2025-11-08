function ControlWeb() {
    let cw = this; // Guardar 'this'

    // -----------------------------------------------------------------
    // 🟢 FUNCIÓN CORREGIDA (LÓGICA SPRINT 2)
    // Comprueba la sesión contra el servidor, no contra la cookie
    // -----------------------------------------------------------------
    this.comprobarSesion = function () {
        $.ajax({
            type: 'GET',
            url: '/sesion', // Ruta de servidor que usa Passport
            success: function (data) {
                if (data.autenticado) {
                    // SÍ está logueado
                    cw.limpiar();
                    // Usamos 'data.usuario.nombre' que viene de la sesión
                    cw.mostrarMensaje("Bienvenido de nuevo, " + data.usuario.nombre, "exito");
                    cw.mostrarBotonCerrarSesion();
                } else {
                    // NO está logueado
                    cw.mostrarAcceso();
                    cw.ocultarBotonCerrarSesion(); // Ocultar botones
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                console.error("Error al comprobar sesion:", errorThrown);
                cw.mostrarAcceso(); // Si hay error, mostrar login
            }
        });
    };

    this.mostrarRegistro = function () {
        $("#fmRegistro").remove();

        $("#au").load("./registro.html", function () {

            $("#btnRegistro").on("click", function (e) {
                e.preventDefault();
                let email = $("#email").val().trim();
                let pwd = $("#pwd").val().trim();
                let nombre = $("#nombre").val().trim();
                let apellidos = $("#apellidos").val().trim();

                if (email && pwd) {
                    rest.registrarUsuario(email, pwd, nombre, apellidos);
                } else {
                    cw.mostrarMensaje("Por favor, rellena todos los campos. El email y la contraseña son obligatorios.");
                }
            });
        });
    };

    // === MOSTRAR/OCULTAR BOTÓN CERRAR SESIÓN === (Sin cambios)
    this.mostrarBotonCerrarSesion = function () {
        $(".nav-item").hide();
        $("#cerrarSesionItem").show();
        $(".nav-item").not(':first').show();
        $("#navInicio").show();
    };

    this.ocultarBotonCerrarSesion = function () {
        $(".nav-item").hide();
        $(".nav-item").first().show();
        $("#cerrarSesionItem").hide();
        $("#navInicio").show();
    };

    // === FORMULARIO UNIFICADO DE ACCESO === (Sin cambios)
    this.mostrarAcceso = function () {
        this.limpiar();
        this.ocultarBotonCerrarSesion();

        let html = `
    <div class="card mt-3">
        <div class="card-body">
            <h5>Acceder al Sistema</h5>
            
            <!-- Campos para registro/login -->
            <div class="form-group">
                <label for="emailAcceso">Email:</label>
                <input type="email" class="form-control" id="emailAcceso" placeholder="tu@email.com">
            </div>
            
            <div class="form-group">
                <label for="passwordAcceso">Contraseña:</label>
                <input type="password" class="form-control" id="passwordAcceso" placeholder="Tu contraseña">
            </div>

            <!-- Botones de acción -->
            <button id="btnLogin" class="btn btn-primary mr-2">Iniciar Sesión</button>
            <button id="btnMostrarRegistro" class="btn btn-outline-secondary">Quiero Registrarme</button>

            <hr>
            
            <!-- Login con Google -->
            <div style="text-align:center">
                <p>O inicia sesión con:</p>
                <a href="/auth/google">
                    <img src="/img/inicioGoogle.png" style="height:40px;">
                </a>
            </div>
        </div>
    </div>`;

        $("#au").append(html);

        // Evento para INICIAR SESIÓN
        $("#btnLogin").on("click", function (e) {
            e.preventDefault();
            let email = $("#emailAcceso").val().trim();
            let password = $("#passwordAcceso").val().trim();

            if (email && password) {
                rest.loginUsuario(email, password);
            } else {
                cw.mostrarMensaje("Por favor, completa todos los campos para iniciar sesión");
            }
        });

        // Evento para MOSTRAR REGISTRO
        $("#btnMostrarRegistro").on("click", function (e) {
            e.preventDefault();
            cw.mostrarRegistro();
        });
    };

    // === HOME DESPUÉS DE LOGIN === (Sin cambios)
    this.mostrarHome = function () {
        this.limpiar();
        this.mostrarBotonCerrarSesion();
        // 🟢 CORREGIDO: Llama a comprobarSesion para mostrar el mensaje de bienvenida
        cw.comprobarSesion();
    };

    // -----------------------------------------------------------------
    // 🟢 FUNCIÓN CORREGIDA (LÓGICA SPRINT 2)
    // Llama al servidor para destruir la sesión, no borra la cookie
    // -----------------------------------------------------------------
    this.salir = function () {
        $.ajax({
            type: 'GET',
            url: '/cerrarSession', // Llama a la ruta del servidor
            success: function (data) {
                if (data.success) {
                    location.reload(); // Recarga la página
                } else {
                    cw.mostrarMensaje("Error al cerrar sesión", "error");
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                console.error("Error al cerrar sesion:", errorThrown);
                cw.mostrarMensaje("Error de red al cerrar sesión", "error");
            }
        });
    };

    // -----------------------------------------------------------------
    // 🟢 "VER USUARIOS" (CORREGIDO PARA LEER ARRAY DE BD)
    // -----------------------------------------------------------------
    this.mostrarObtenerUsuarios = function () {
        this.limpiar();
        this.mostrarBotonCerrarSesion(); // Asegurarse de que los botones de nav están bien
        let html = `
        <div id="mOU" class="form-group">
            <button id="btnOU" class="btn btn-info">Obtener Lista de Usuarios (de MongoDB)</button>
            <div id="listaUsuarios" class="mt-3"></div>
        </div>`;
        $("#au").html(html);

        $("#btnOU").on("click", function () {
            // Llama a la ruta del servidor (que ahora lee de la BD)
            $.getJSON("/obtenerUsuarios", function (data) {
                let listaDiv = $("#listaUsuarios");
                listaDiv.empty();

                // 🟢 CORREGIDO: 'data' ahora es un ARRAY, no un objeto
                if (data.length === 0) {
                    listaDiv.html('<div class="alert alert-warning">No hay usuarios registrados en la base de datos</div>');
                } else {
                    let tabla = `
                    <div class="card mt-3">
                        <div class="card-header"><h5>Usuarios Registrados en MongoDB</h5></div>
                        <div class="card-body">
                            <table class="table table-striped">
                                <thead><tr><th>Nombre</th><th>Email</th><th>ID</th></tr></thead>
                                <tbody>`;

                    // 🟢 CORREGIDO: Iterar sobre el array 'data'
                    data.forEach(function (u) {
                        tabla += `<tr><td>${u.nombre || u.nick}</td><td>${u.email}</td><td>${u._id}</td></tr>`;
                    });

                    tabla += `</tbody></table></div></div>`;
                    listaDiv.html(tabla);
                }
            });
        });
    };

    // -----------------------------------------------------------------
    // 🟢 FUNCIONES ANTIGUAS (SPRINT 1) MANTENIDAS
    // -----------------------------------------------------------------

    // === ELIMINAR USUARIO (SPRINT 1) ===
    this.mostrarEliminarUsuario = function () {
        this.limpiar();
        this.mostrarBotonCerrarSesion();
        let html = `
        <div id="mEU" class="form-group">
            <label for="nickEliminar">Nick a eliminar (de la memoria):</label>
            <input type="text" class="form-control" id="nickEliminar">
            <button id="btnEU" class="btn btn-danger mt-2">Eliminar Usuario</button>
        </div>`;
        $("#au").html(html);

        $("#btnEU").on("click", function () {
            let nick = $("#nickEliminar").val().trim();
            if (nick) rest.eliminarUsuario(nick);
            else cw.mostrarMensaje("Por favor, introduce un nick válido", "error");
        });
    };

    // === NÚMERO DE USUARIOS (SPRINT 1) ===
    this.mostrarNumeroUsuarios = function () {
        this.limpiar();
        this.mostrarBotonCerrarSesion();
        let html = `
        <div id="mNU" class="form-group">
            <button id="btnNU" class="btn btn-warning">Consultar Número de Usuarios (en memoria)</button>
            <div id="resultadoNumero" class="mt-3 alert alert-info" style="display:none;"></div>
        </div>`;
        $("#au").html(html);

        $("#btnNU").on("click", function () {
            rest.numeroUsuarios(); // Llama a la ruta antigua
        });
    };

    // === CONSULTAR USUARIO ACTIVO (SPRINT 1) ===
    this.mostrarUsuarioActivo = function () {
        this.limpiar();
        this.mostrarBotonCerrarSesion();
        let html = `
        <div id="mUA" class="form-group">
            <label for="nickConsultar">Consultar estado de usuario (en memoria):</label>
            <input type="text" class="form-control" id="nickConsultar" placeholder="Introduce el nick">
            <button id="btnUA" class="btn btn-secondary mt-2">Consultar Estado</button>
            <div id="resultadoEstado" class="mt-3"></div>
        </div>`;
        $("#au").html(html);

        $("#btnUA").on("click", function () {
            let nick = $("#nickConsultar").val().trim();
            if (nick) {
                // Llama a la ruta antigua
                $.getJSON("/usuarioActivo/" + nick, function (data) {
                    let resultado = data.activo
                        ? `<div class="alert alert-success">El usuario <strong>${nick}</strong> está ACTIVO</div>`
                        : `<div class="alert alert-danger">El usuario <strong>${nick}</strong> no existe</div>`;
                    $("#resultadoEstado").html(resultado);
                });
            } else cw.mostrarMensaje("Introduce un nick válido", "error");
        });
    };

    // === UTILIDADES === (Sin cambios)
    this.limpiar = function () {
        $("#au").empty();
    };

    this.mostrarMensaje = function (msg, tipo = "info") {
        let claseAlerta = "alert-info"; // Por defecto
        if (tipo === "exito") {
            claseAlerta = "alert-success";
        } else if (tipo === "error") {
            claseAlerta = "alert-danger";
        }

        $("#msg").remove();

        let html = `<div id="msg" class="alert ${claseAlerta} alert-dismissible fade show" role="alert">
                            ${msg}
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>`;

        $("#au").prepend(html);
    };
}