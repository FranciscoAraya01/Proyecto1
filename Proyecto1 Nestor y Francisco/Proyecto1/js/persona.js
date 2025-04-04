// Variables para paginación
let paginaActual = 1;
const registrosPorPagina = 5;

function cargarPersonas() {
    let personas = JSON.parse(localStorage.getItem("personas")) || [];
    let busqueda = document.getElementById("busqueda").value.toLowerCase();

    // Filtrar personas por búsqueda
    personas = personas.filter(persona => {
        return Object.values(persona).some(valor => String(valor).toLowerCase().includes(busqueda));
    });

    // Paginación
    const totalPaginas = Math.ceil(personas.length / registrosPorPagina);
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const personasPagina = personas.slice(inicio, fin);

    // Mostrar personas
    let tbody = document.getElementById("personas-list");
    tbody.innerHTML = "";

    if (personasPagina.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="text-center">No hay datos disponibles</td></tr>`;
        return;
    }

    personasPagina.forEach((persona, index) => {
        let fila = `<tr>
      <td>${persona.id}</td>
      <td>${persona.nombre}</td>
      <td>${persona.email}</td>
      <td>${persona.direccion}</td>
      <td>${persona.birth}</td>
      <td>${persona.telefono}</td>
      <td>${persona.cargo}</td>
      <td>${persona.estado}</td>
      <td>${persona.oficina}</td>
      <td>
        <button onclick="editarPersona(${index})" class="btn btn-warning btn-sm"><i class="bi bi-pencil"></i>Editar</button>
        <button onclick="eliminarPersona(${index})" class="btn btn-danger btn-sm"><i class="bi bi-trash"></i>Eliminar</button>
      </td>
    </tr>`;
        tbody.innerHTML += fila;
    });

    // Mostrar paginación
    let pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    for (let i = 1; i <= totalPaginas; i++) {
        let li = `<li class="page-item ${i === paginaActual ? 'active' : ''}"><a class="page-link" href="#">${i}</a></li>`;
        pagination.innerHTML += li;
    }

    // Eventos de paginación
    pagination.addEventListener("click", function (event) {
        if (event.target.tagName === "A") {
            paginaActual = parseInt(event.target.textContent);
            cargarPersonas();
        }
    });
}

function eliminarPersona(index) {
    if (confirm("¿Estás seguro de eliminar esta persona?")) {
        let personas = JSON.parse(localStorage.getItem("personas")) || [];
        personas.splice(index, 1);
        localStorage.setItem("personas", JSON.stringify(personas));
        cargarPersonas();
    }
}

function editarPersona(index) {
    localStorage.setItem("editIndex", index);
    window.location.href = "form.html";
}

function guardarPersona(event) {
    event.preventDefault();

    let form = event.target;

    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    let id = document.getElementById("id").value;
    let nombre = document.getElementById("nombre").value;
    let email = document.getElementById("email").value;
    let direccion = document.getElementById("direccion").value;
    let birth = document.getElementById("birth").value;
    let telefono = document.getElementById("telefono").value;
    let cargo = document.getElementById("cargo").value;
    let estado = document.getElementById("estado").value;
    let oficina = document.getElementById("oficina").value;

    if (!id || !nombre || !email || !direccion || !birth || !telefono || !cargo || !estado || !oficina) {
        alert("Todos los campos son obligatorios");
        return;
    } else {
        let persona = { id, nombre, email, direccion, birth, telefono, cargo, estado, oficina };
        let personas = JSON.parse(localStorage.getItem("personas")) || [];

        let index = localStorage.getItem("editIndex");
        if (index !== null) {
            personas[index] = persona;
        } else {
            personas.push(persona);
        }

        localStorage.setItem("personas", JSON.stringify(personas));
        window.location.href = "index.html";
    }
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