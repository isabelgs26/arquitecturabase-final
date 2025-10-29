function ControlWeb() {

    // === COMPROBAR SESIÓN ===
    this.comprobarSesion = function () {
        let nick = $.cookie("nick");
        if (nick) {
            this.limpiar();
            this.mostrarMensaje("Bienvenido de nuevo, " + nick);
            this.mostrarBotonCerrarSesion();
        } else {
            this.mostrarAcceso();
        }
    };

    // === MOSTRAR/OCULTAR BOTÓN CERRAR SESIÓN ===
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

    // === FORMULARIO UNIFICADO DE ACCESO ===
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
                    <input type="email" class="form-control" id="emailAcceso" placeholder="tu@email.com" required>
                </div>
                
                <div class="form-group">
                    <label for="passwordAcceso">Contraseña:</label>
                    <input type="password" class="form-control" id="passwordAcceso" placeholder="Tu contraseña" required>
                </div>

                <!-- Botones de acción -->
                <button id="btnLogin" class="btn btn-primary">Iniciar Sesión</button>
                <button id="btnRegistro" class="btn btn-success">Registrarse</button>

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
                alert("Por favor, completa todos los campos");
            }
        });

        // Evento para REGISTRARSE
        $("#btnRegistro").on("click", function (e) {
            e.preventDefault();
            let email = $("#emailAcceso").val().trim();
            let password = $("#passwordAcceso").val().trim();

            if (email && password) {
                if (password.length < 6) {
                    alert("La contraseña debe tener al menos 6 caracteres");
                    return;
                }
                let usuario = {
                    email: email,
                    password: password
                };
                rest.registrarUsuario(usuario);
            } else {
                alert("Por favor, completa todos los campos");
            }
        });
    };

    // === HOME DESPUÉS DE LOGIN ===
    this.mostrarHome = function () {
        this.limpiar();
        this.mostrarBotonCerrarSesion();
        this.mostrarMensaje("Has iniciado sesión correctamente");
    };

    // === SALIR ===
    this.salir = function () {
        $.removeCookie("nick");
        this.ocultarBotonCerrarSesion();
        alert("Sesión cerrada correctamente. ¡Hasta pronto!");
        location.reload();
    };

    // === VER USUARIOS ===
    this.mostrarObtenerUsuarios = function () {
        this.limpiar();
        let html = `
        <div id="mOU" class="form-group">
            <button id="btnOU" class="btn btn-info">Obtener Lista de Usuarios</button>
            <div id="listaUsuarios" class="mt-3"></div>
        </div>`;
        $("#au").html(html);

        $("#btnOU").on("click", function () {
            $.getJSON("/obtenerUsuarios", function (data) {
                let listaDiv = $("#listaUsuarios");
                listaDiv.empty();

                if (Object.keys(data).length === 0) {
                    listaDiv.html('<div class="alert alert-warning">No hay usuarios registrados</div>');
                } else {
                    let tabla = `
                    <div class="card mt-3">
                        <div class="card-header"><h5>Usuarios Registrados</h5></div>
                        <div class="card-body">
                            <table class="table table-striped">
                                <thead><tr><th>Nick</th><th>Email</th></tr></thead>
                                <tbody>`;
                    for (let nick in data) {
                        let u = data[nick];
                        tabla += `<tr><td>${u.nick}</td><td>${u.email || 'No especificado'}</td></tr>`;
                    }
                    tabla += `</tbody></table></div></div>`;
                    listaDiv.html(tabla);
                }
            });
        });
    };

    // === ELIMINAR USUARIO ===
    this.mostrarEliminarUsuario = function () {
        this.limpiar();
        let html = `
        <div id="mEU" class="form-group">
            <label for="nickEliminar">Nick a eliminar:</label>
            <input type="text" class="form-control" id="nickEliminar">
            <button id="btnEU" class="btn btn-danger mt-2">Eliminar Usuario</button>
        </div>`;
        $("#au").html(html);

        $("#btnEU").on("click", function () {
            let nick = $("#nickEliminar").val().trim();
            if (nick) rest.eliminarUsuario(nick);
            else alert("Por favor, introduce un nick válido");
        });
    };

    // === NÚMERO DE USUARIOS ===
    this.mostrarNumeroUsuarios = function () {
        this.limpiar();
        let html = `
        <div id="mNU" class="form-group">
            <button id="btnNU" class="btn btn-warning">Consultar Número de Usuarios</button>
            <div id="resultadoNumero" class="mt-3 alert alert-info"></div>
        </div>`;
        $("#au").html(html);

        $("#btnNU").on("click", function () {
            rest.numeroUsuarios();
        });
    };

    // === CONSULTAR USUARIO ACTIVO ===
    this.mostrarUsuarioActivo = function () {
        this.limpiar();
        let html = `
        <div id="mUA" class="form-group">
            <label for="nickConsultar">Consultar estado de usuario:</label>
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
            } else alert("Introduce un nick válido");
        });
    };

    // === UTILIDADES ===
    this.limpiar = function () {
        $("#au").empty();
    };

    this.mostrarMensaje = function (msg) {
        let html = `<div class="alert alert-success">${msg}</div>`;
        $("#au").append(html);
    };
}