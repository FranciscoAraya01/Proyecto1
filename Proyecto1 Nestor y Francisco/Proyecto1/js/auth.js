// Función para iniciar sesión
function login(event) {
    event.preventDefault();

    let form = event.target;
    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    // Credenciales de usuario y permisos
    const usuarios = {
        admin: {
            pass: "1234",
            permisos: ["todas", "editar", "eliminar", "agregar", "exportar"]
        },
        visor: {
            pass: "1234",
            permisos: ["ver"]
        },
        registrador: {
            pass: "1234",
            permisos: ["registro", "editar", "eliminar", "agregar", "exportar"]
        },
    };

    if (usuarios[username] && usuarios[username].pass === password) {
        localStorage.setItem("auth", "true");
        localStorage.setItem("user", username);
        localStorage.setItem("permisos", JSON.stringify(usuarios[username].permisos));

        if (username === "registrador") {
            window.location.href = "registros.html";
        } else {
            window.location.href = "index.html";
        }
    } else {
        alert("Usuario o contraseña incorrectos");
    }
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
    localStorage.removeItem("permisos");
    window.location.href = "login.html";
}

// Función para verificar autenticación
function verificarAutenticacion() {
    if (localStorage.getItem("auth") !== "true") {
        window.location.href = "login.html";
        return false;
    }

    // Verificar acceso a la página actual según el rol
    const usuario = localStorage.getItem("user");
    const permisos = JSON.parse(localStorage.getItem("permisos") || "[]");
    const paginaActual = window.location.pathname.split("/").pop();

    // Controlar acceso según la página
    if (usuario === "registrador" &&
        !["index.html", "registros.html", "registro.html", "reporte.html"].includes(paginaActual)) {
        alert("No tienes permiso para acceder a esta página");
        window.location.href = "registros.html";
        return false;
    }

    // Una vez verificada la autenticación, configurar la interfaz según permisos
    configurarInterfaz(permisos);

    return true;
}

// Función para configurar la interfaz según los permisos
function configurarInterfaz(permisos) {
    document.addEventListener("DOMContentLoaded", function() {
        const esVisor = permisos.includes("ver") && !permisos.includes("editar");
        const esRegistrador = permisos.includes("registro");

        // Ocultar elementos de navegación según permisos
        if (esRegistrador) {
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => {
                const link = item.querySelector('.nav-link');
                if (link && !link.getAttribute('href').includes('registro')) {
                    item.style.display = 'none';
                }
            });
        }

        // Desactivar botones de edición, eliminación y adición para usuarios visor
        if (esVisor) {
            // Ocultar el botón "Nuevo Registro" en registros.html
            if (window.location.pathname.includes("registros.html")) {
                const botonNuevoRegistro = document.querySelector('[onclick*="form.html"]');
                if (botonNuevoRegistro) {
                    botonNuevoRegistro.style.display = 'none';
                }
            }

            // Desactivar botones de agregar
            const botonesAgregar = document.querySelectorAll('[onclick*="form.html"], [onclick*="office_form.html"]');
            botonesAgregar.forEach(boton => {
                boton.style.display = 'none';
            });

            // Ocultar acciones de edición y eliminación en las tablas
            setTimeout(() => {
                const botonesEditar = document.querySelectorAll('[onclick*="editar"]');
                const botonesEliminar = document.querySelectorAll('[onclick*="eliminar"]');

                botonesEditar.forEach(boton => boton.style.display = 'none');
                botonesEliminar.forEach(boton => boton.style.display = 'none');

                // Si existe algún formulario, hacerlo de solo lectura
                const inputsFormulario = document.querySelectorAll('input, select, textarea');
                inputsFormulario.forEach(input => {
                    input.setAttribute('readonly', true);
                    if (input.tagName === 'SELECT') {
                        input.setAttribute('disabled', true);
                    }
                });

                // Ocultar botones de guardar en formularios
                const botonesGuardar = document.querySelectorAll('button[type="submit"]');
                botonesGuardar.forEach(boton => boton.style.display = 'none');

            }, 500); // Pequeño retraso para asegurar que los elementos dinámicos estén cargados
        }
    });
}

// Función para verificar si el usuario tiene un permiso específico
function tienePermiso(permiso) {
    const permisos = JSON.parse(localStorage.getItem("permisos") || "[]");
    return permisos.includes(permiso);
}

// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }

                form.classList.add('was-validated')
            }, false)
        })
})()