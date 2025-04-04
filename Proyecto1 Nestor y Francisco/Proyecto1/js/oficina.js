function cargarOficinas() {
    let oficinas = JSON.parse(localStorage.getItem("oficinas")) || [];
    let tbody = document.getElementById("oficinas-list");
    tbody.innerHTML = "";

    if (oficinas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center">No hay datos disponibles</td></tr>`;
        return;
    }

    const esVisor = JSON.parse(localStorage.getItem("permisos") || "[]").includes("ver") && !JSON.parse(localStorage.getItem("permisos") || "[]").includes("editar");

    oficinas.forEach((oficina, index) => {
        let fila = `<tr>
      <td>${oficina.nombreOficina}</td>
      <td>${oficina.ubicacion}</td>
      <td>${oficina.capacidad}</td>
      <td>`;

        if (!esVisor) {
            fila += `<button onclick="editarOficina(${index})" class="btn btn-warning btn-sm"><i class="bi bi-pencil"></i>Editar</button>
            <button onclick="confirmarEliminarOficina(${index})" class="btn btn-danger btn-sm"><i class="bi bi-trash"></i>Eliminar</button>`;
        }

        fila += `</td></tr>`;
        tbody.innerHTML += fila;
    });
}

function confirmarEliminarOficina(index) {
    if (confirm("¿Estás seguro de eliminar esta oficina?")) {
        eliminarOficina(index);
    }
}

function eliminarOficina(index) {
    let oficinas = JSON.parse(localStorage.getItem("oficinas")) || [];
    oficinas.splice(index, 1);
    localStorage.setItem("oficinas", JSON.stringify(oficinas));
    cargarOficinas();
}

function editarOficina(index) {
    localStorage.setItem("editOficinaIndex", index);
    window.location.href = "office_form.html";
}

function guardarOficina(event) {
    event.preventDefault();

    let form = event.target;

    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    let nombreOficina = document.getElementById("nombreOficina").value.trim();
    let ubicacion = document.getElementById("ubicacion").value.trim();
    let capacidad = document.getElementById("capacidad").value.trim();

    if (!nombreOficina || !ubicacion || !capacidad) {
        alert("Todos los campos son obligatorios");
        return;
    }

    let oficina = { nombreOficina, ubicacion, capacidad };
    let oficinas = JSON.parse(localStorage.getItem("oficinas")) || [];
    let index = localStorage.getItem("editOficinaIndex");

    if (index !== null) {
        oficinas[index] = oficina;
    } else {
        oficinas.push(oficina);
    }

    localStorage.setItem("oficinas", JSON.stringify(oficinas));
    window.location.href = "office.html";
}