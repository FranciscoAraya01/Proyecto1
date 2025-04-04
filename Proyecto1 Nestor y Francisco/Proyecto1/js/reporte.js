document.addEventListener("DOMContentLoaded", function () {
    function obtenerDatosReporte() {
        const datosString = localStorage.getItem('datosReporte');
        return datosString ? JSON.parse(datosString) : null;
    }

    const datosReporte = obtenerDatosReporte();

    if (datosReporte) {
        renderizarGraficoPersonasMasIngresos(datosReporte.personasMasIngresos.slice(0, 5)); // Mostrar top 5
        renderizarGraficoOcupacionesOficinas(datosReporte.ocupacionesOficinas.slice(0, 5)); // Mostrar top 5
        listarPersonasEnOficinas(datosReporte.personasEnOficinas);
    } else {
        console.error("No se pudieron obtener los datos para el reporte.");
        const container = document.querySelector('.container');
        const mensajeError = document.createElement('div');
        mensajeError.className = 'alert alert-warning text-center';
        mensajeError.textContent = 'No hay datos de registros disponibles para generar el reporte.';
        container.insertBefore(mensajeError, container.firstChild);
    }

    function renderizarGraficoPersonasMasIngresos(datos) {
        const ctx = document.getElementById('personasMasIngresosChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: datos.map(item => item.persona),
                datasets: [{
                    label: 'Número de Ingresos',
                    data: datos.map(item => item.conteo),
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        precision: 0
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Top 5 Personas con Más Ingresos'
                    }
                }
            }
        });
    }

    function renderizarGraficoOcupacionesOficinas(datos) {
        const ctx = document.getElementById('ocupacionesOficinasChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: datos.map(item => item.oficina),
                datasets: [{
                    label: 'Número de Ingresos',
                    data: datos.map(item => item.conteo),
                    backgroundColor: 'rgba(255, 99, 132, 0.8)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        precision: 0
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Top 5 Oficinas con Más Ingresos'
                    }
                }
            }
        });
    }

    function listarPersonasEnOficinas(personas) {
        const lista = document.getElementById('personasEnOficinasList');
        lista.innerHTML = '';

        if (personas.length > 0) {
            personas.forEach(persona => {
                const listItem = document.createElement('li');
                listItem.classList.add('list-group-item');
                listItem.textContent = `${persona.nombre} (Oficina: ${persona.oficina}, Ingreso: ${persona.horaIngreso} - ${persona.fechaIngreso})`;
                lista.appendChild(listItem);
            });
        } else {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item');
            listItem.textContent = 'No hay personas actualmente en las oficinas (sin registro de salida hoy).';
            lista.appendChild(listItem);
        }
    }
});