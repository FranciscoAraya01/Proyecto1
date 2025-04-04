// Variables para paginación
let paginaActual = 1;
const registrosPorPagina = 5;

function cargarRegistros() {
    let registros = JSON.parse(localStorage.getItem("registros")) || [];
    actualizarDatosReporte(registros); // Actualizar datos para el reporte

    // Paginación (el resto del código de cargarRegistros queda igual)
    const totalPaginas = Math.ceil(registros.length / registrosPorPagina);
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const registrosPagina = registros.slice(inicio, fin);

    let tbody = document.getElementById("registros-list");
    tbody.innerHTML = "";

    if (registrosPagina.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center">No hay registros disponibles</td></tr>`;
        return;
    }

    registrosPagina.forEach((registro, index) => {
        let fila = `<tr>
      <td>${registro.persona}</td>
      <td>${registro.tipo}</td>
      <td>${registro.fecha}</td>
      <td>${registro.hora}</td>
      <td>
        <button onclick="editarRegistro(${index})" class="btn btn-warning btn-sm"><i class="bi bi-pencil"></i>Editar</button>
        <button onclick="eliminarRegistro(${index})" class="btn btn-danger btn-sm"><i class="bi bi-trash"></i>Eliminar</button>
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
            cargarRegistros();
        }
    });
}

function guardarRegistro(event) {
    event.preventDefault();

    let form = event.target;

    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    let persona = document.getElementById("persona").value;
    let tipo = document.getElementById("tipo").value;
    let fecha = document.getElementById("fecha").value;
    let hora = document.getElementById("hora").value;

    // Validación de capacidad máxima de personas en una oficina
    let registros = JSON.parse(localStorage.getItem("registros")) || [];
    let personaData = JSON.parse(localStorage.getItem("personas")).find(p => p.id === persona);
    let oficina = personaData ? personaData.oficina : null;
    if (oficina) {
        let oficinaData = JSON.parse(localStorage.getItem("oficinas")).find(o => o.nombreOficina === oficina);
        let capacidadOficina = oficinaData ? oficinaData.capacidad : 0;
        let personasEnOficinaActual = registros.filter(r => r.fecha === fecha && r.tipo === "Ingreso" && JSON.parse(localStorage.getItem("personas")).find(p => p.id === r.persona)?.oficina === oficina).length;

        if (personasEnOficinaActual >= capacidadOficina) {
            alert("Se ha superado la capacidad máxima de personas en esta oficina.");
            return;
        }
    }


    // Validación del flujo de entradas y salidas de una persona
    let registrosPersona = registros.filter(r => r.persona === persona);
    let ultimoRegistro = registrosPersona[registrosPersona.length - 1];

    if (ultimoRegistro && ultimoRegistro.tipo === tipo) {
        alert("No se puede registrar una salida sin un ingreso previo o un ingreso sin una salida previa.");
        return;
    }

    let registro = { persona, tipo, fecha, hora };
    let index = localStorage.getItem("editRegistroIndex");

    if (index !== null) {
        registros[index] = registro;
        localStorage.removeItem("editRegistroIndex"); // Limpiar el índice de edición
    } else {
        registros.push(registro);
    }

    localStorage.setItem("registros", JSON.stringify(registros));
    actualizarDatosReporte(registros); // Actualizar datos después de guardar
    window.location.href = "registros.html";
}

function editarRegistro(index) {
    localStorage.setItem("editRegistroIndex", index);
    window.location.href = "registro.html";
}

function eliminarRegistro(index) {
    if (confirm("¿Estás seguro de eliminar este registro?")) {
        let registros = JSON.parse(localStorage.getItem("registros")) || [];
        registros.splice(index, 1);
        localStorage.setItem("registros", JSON.stringify(registros));
        actualizarDatosReporte(registros); // Actualizar datos después de eliminar
        cargarRegistros();
    }
}

function exportarTabla(formato) {
    let registros = JSON.parse(localStorage.getItem("registros")) || [];
    let data = registros.map(registro => [registro.persona, registro.tipo, registro.fecha, registro.hora]);
    let encabezados = ["Persona", "Tipo", "Fecha", "Hora"];

    if (formato === 'csv') {
        const csvData = [encabezados.join(','), ...data.map(row => row.join(','))].join('\n');
        const link = document.createElement('a');
        link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvData));
        link.setAttribute('download', 'registros.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else if (formato === 'pdf') {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        pdf.autoTable({
            head: [encabezados],
            body: data
        });
        pdf.save('registros.pdf');
    }
}

function actualizarDatosReporte(registros) {
    const personas = JSON.parse(localStorage.getItem("personas")) || [];
    const oficinas = JSON.parse(localStorage.getItem("oficinas")) || [];

    // 1. Personas con más ingresos
    const ingresosPorPersona = registros.filter(r => r.tipo === 'Ingreso').reduce((acc, registro) => {
        acc[registro.persona] = (acc[registro.persona] || 0) + 1;
        return acc;
    }, {});

    const personasConIngresos = Object.entries(ingresosPorPersona)
        .map(([personaId, conteo]) => ({ persona: personas.find(p => p.id === personaId)?.nombre || 'Desconocido', conteo }))
        .sort((a, b) => b.conteo - a.conteo);

    // 2. Ocupaciones máximas de oficinas (oficinas a que reportan más ingresos)
    const ingresosPorOficina = registros.filter(r => r.tipo === 'Ingreso').reduce((acc, registro) => {
        const oficinaNombre = personas.find(p => p.id === registro.persona)?.oficina;
        if (oficinaNombre) {
            acc[oficinaNombre] = (acc[oficinaNombre] || 0) + 1;
        }
        return acc;
    }, {});

    const oficinasConIngresos = Object.entries(ingresosPorOficina)
        .map(([oficina, conteo]) => ({ oficina, conteo }))
        .sort((a, b) => b.conteo - a.conteo);

    // 3. Personas que actualmente se encuentran en una oficina
    const ingresosActivos = registros.filter(r => r.tipo === 'Ingreso');
    const salidasRegistradas = registros.filter(r => r.tipo === 'Salida');

    const personasEnOficinas = ingresosActivos.filter(ingreso =>
        !salidasRegistradas.some(salida => salida.persona === ingreso.persona && salida.fecha === ingreso.fecha)
    ).map(ingreso => {
        const personaData = personas.find(p => p.id === ingreso.persona);
        return {
            nombre: personaData?.nombre || 'Desconocido',
            oficina: personaData?.oficina || 'Desconocida',
            horaIngreso: ingreso.hora,
            fechaIngreso: ingreso.fecha
        };
    });

    const datosReporte = {
        personasMasIngresos: personasConIngresos,
        ocupacionesOficinas: oficinasConIngresos,
        personasEnOficinas: personasEnOficinas
    };

    localStorage.setItem('datosReporte', JSON.stringify(datosReporte));
}

// Cargar registros al cargar la página
document.addEventListener("DOMContentLoaded", cargarRegistros);