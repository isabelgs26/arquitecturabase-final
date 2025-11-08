function ControlWeb() {
    let cw = this;

    this.comprobarSesion = function () {
        $.ajax({
            type: 'GET',
            url: '/sesion',
            success: function (data) {
                if (data.autenticado) {
                    cw.limpiar();
                    cw.mostrarMensaje("Bienvenido de nuevo, " + data.usuario.nombre, "exito");
                    cw.mostrarBotonCerrarSesion();
                } else {
                    cw.mostrarAcceso();
                    cw.ocultarBotonCerrarSesion();
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                console.error("Error al comprobar sesion:", errorThrown);
                cw.mostrarAcceso();
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

    this.mostrarAcceso = function () {
        this.limpiar();
        this.ocultarBotonCerrarSesion();

        let html = `
    <div class="card mt-3">
        <div class="card-body">
            <h5>Acceder al Sistema</h5>
            
            <div class="form-group">
                <label for="emailAcceso">Email:</label>
                <input type="email" class="form-control" id="emailAcceso" placeholder="tu@email.com">
            </div>
            
            <div class="form-group">
                <label for="passwordAcceso">Contraseña:</label>
                <input type="password" class="form-control" id="passwordAcceso" placeholder="Tu contraseña">
            </div>

            <button id="btnLogin" class="btn btn-primary mr-2">Iniciar Sesión</button>
            <button id="btnMostrarRegistro" class="btn btn-outline-secondary">Quiero Registrarme</button>

            <hr>
            
            <div style="text-align:center">
                <p>O inicia sesión con:</p>
                <a href="/auth/google">
                    <img src="/img/inicioGoogle.png" style="height:40px;">
                </a>
            </div>
        </div>
    </div>`;

        $("#au").append(html);

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

        $("#btnMostrarRegistro").on("click", function (e) {
            e.preventDefault();
            cw.mostrarRegistro();
        });
    };

    this.mostrarHome = function () {
        this.limpiar();
        this.mostrarBotonCerrarSesion();
        cw.comprobarSesion();
    };

    this.salir = function () {
        $.ajax({
            type: 'GET',
            url: '/cerrarSession',
            success: function (data) {
                if (data.success) {
                    location.reload();
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

    this.mostrarObtenerUsuarios = function () {
        this.limpiar();
        this.mostrarBotonCerrarSesion();
        let html = `
        <div id="mOU" class="form-group">
            <button id="btnOU" class="btn btn-info">Obtener Lista de Usuarios (de MongoDB)</button>
            <div id="listaUsuarios" class="mt-3"></div>
        </div>`;
        $("#au").html(html);

        $("#btnOU").on("click", function () {
            $.getJSON("/obtenerUsuarios", function (data) {
                let listaDiv = $("#listaUsuarios");
                listaDiv.empty();

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

                    data.forEach(function (u) {
                        tabla += `<tr><td>${u.nombre || u.nick}</td><td>${u.email}</td><td>${u._id}</td></tr>`;
                    });

                    tabla += `</tbody></table></div></div>`;
                    listaDiv.html(tabla);
                }
            });
        });
    };


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
            rest.numeroUsuarios();
        });
    };

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
                $.getJSON("/usuarioActivo/" + nick, function (data) {
                    let resultado = data.activo
                        ? `<div class="alert alert-success">El usuario <strong>${nick}</strong> está ACTIVO</div>`
                        : `<div class="alert alert-danger">El usuario <strong>${nick}</strong> no existe</div>`;
                    $("#resultadoEstado").html(resultado);
                });
            } else cw.mostrarMensaje("Introduce un nick válido", "error");
        });
    };

    this.limpiar = function () {
        $("#au").empty();
    };

    this.mostrarMensaje = function (msg, tipo = "info") {
        let claseAlerta = "alert-info";
        if (tipo === "exito") {
            claseAlerta = "alert-success";
        } else if (tipo === "error") {
            claseAlerta = "alert-danger";
        }

        $("#msg").remove();

        let html = `<div id="msg" class="alert ${claseAlerta} alert-dismissible fade show" role="alert">
                            ${msg}
                            <button type.button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>`;

        $("#au").prepend(html);
    };
}