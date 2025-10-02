  function cargarTablaLocalStorage(idTabla, clavePrefix) {
  const tabla = document.getElementById(idTabla);
  let i = 1;
  while (true) {
    const datosGuardados = localStorage.getItem(clavePrefix + i);
    if (!datosGuardados) break;
    const datos = JSON.parse(datosGuardados);
    const fila = document.createElement('tr');
    datos.forEach(dato => {
      const celda = document.createElement('td');
      celda.textContent = dato;
      celda.contentEditable = "false";
      fila.appendChild(celda);
    });

    const celdaAcciones = document.createElement('td');
    celdaAcciones.innerHTML = `
      <button class="btn-editar btn btn-warning">Editar</button>
      <button class="btn-eliminar btn btn-warning">Eliminar</button>
      <button class="btn-guardar btn btn-success d-none">Guardar</button>
    `;
    fila.appendChild(celdaAcciones);
    tabla.appendChild(fila);
    i++;
  }
}

function activarBotonesEdicion(tablaID, clavePrefix) {
  document.querySelectorAll(`#${tablaID} .btn-editar`).forEach(boton => {
    boton.addEventListener('click', () => {
      const fila = boton.closest('tr');
      const celdas = fila.querySelectorAll('td');
      celdas.forEach((celda, index) => {
        if (index < celdas.length - 1) {
          celda.contentEditable = "true";
          celda.classList.add('bg-warning-subtle');
        }
      });
      fila.querySelector('.btn-guardar').classList.remove('d-none');
      boton.classList.add('d-none');
    });
  });

  document.querySelectorAll(`#${tablaID} .btn-guardar`).forEach(boton => {
    boton.addEventListener('click', () => {
      const fila = boton.closest('tr');
      const datos = [];
      const celdas = fila.querySelectorAll('td');
      celdas.forEach((celda, index) => {
        if (index < celdas.length - 1) {
          celda.contentEditable = "false";
          celda.classList.remove('bg-warning-subtle');
          datos.push(celda.innerText);
        }
      });
      localStorage.setItem(clavePrefix + fila.rowIndex, JSON.stringify(datos));
      fila.querySelector('.btn-editar').classList.remove('d-none');
      boton.classList.add('d-none');
    });
  });

  document.querySelectorAll(`#${tablaID} .btn-eliminar`).forEach(boton => {
    boton.addEventListener('click', () => {
      const fila = boton.closest('tr');
      localStorage.removeItem(clavePrefix + fila.rowIndex);
      fila.remove();
    });
  });
}

function agregarFilaYGuardar(datos, idTabla, clavePrefix) {
  const tabla = document.getElementById(idTabla);
  const fila = document.createElement('tr');
  datos.forEach(d => {
    const celda = document.createElement('td');
    celda.textContent = d;
    celda.contentEditable = "false";
    fila.appendChild(celda);
  });

  const celdaAcciones = document.createElement('td');
  celdaAcciones.innerHTML = `
    <button class="btn-editar btn btn-warning">Editar</button>
    <button class="btn-eliminar btn btn-warning">Eliminar</button>
    <button class="btn-guardar btn btn-success d-none">Guardar</button>
  `;
  fila.appendChild(celdaAcciones);
  tabla.appendChild(fila);

  const nuevaClave = clavePrefix + (tabla.rows.length - 1);
  localStorage.setItem(nuevaClave, JSON.stringify(datos));

  activarBotonesEdicion(idTabla, clavePrefix);
}

window.addEventListener('DOMContentLoaded', () => {
  cargarTablaLocalStorage('tabla-rendimiento', 'rendimiento-');
  cargarTablaLocalStorage('tabla-asistencia', 'asistencia-');
  activarBotonesEdicion('tabla-rendimiento', 'rendimiento-');
  activarBotonesEdicion('tabla-asistencia', 'asistencia-');

  new Chart(document.getElementById('graficoRendimiento'), {
    type: 'bar',
    data: {
      labels: ['Matemáticas', 'Ciencias'],
      datasets: [{
        label: 'Promedio',
        data: [4.2, 2.9],
        backgroundColor: ['#4e73df', '#e74a3b']
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 5
        }
      }
    }
  });

  new Chart(document.getElementById('graficoAsistencia'), {
    type: 'doughnut',
    data: {
      labels: ['Asistencias', 'Ausencias'],
      datasets: [{
        data: [53, 7],
        backgroundColor: ['#1cc88a', '#f6c23e']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
});

document.getElementById('buscador-estudiantes').addEventListener('submit', function (e) {
  e.preventDefault();
  const valor = document.getElementById('busqueda').value.toLowerCase();
  const filas = document.querySelectorAll("tbody tr");
  filas.forEach(fila => {
    const textoFila = fila.innerText.toLowerCase();
    fila.style.display = textoFila.includes(valor) ? "" : "none";
  });
});

document.getElementById('form-rendimiento').addEventListener('submit', function (e) {
  e.preventDefault();
  const datos = [
    document.getElementById("nuevo-nombre").value,
    document.getElementById("nuevo-curso").value,
    document.getElementById("nueva-materia").value,
    parseFloat(document.getElementById("nuevo-promedio").value).toFixed(1),
    document.getElementById("nuevo-estado").value
  ];
  if (datos.some(d => d === "")) {
    alert("Completa todos los campos.");
    return;
  }
  agregarFilaYGuardar(datos, 'tabla-rendimiento', 'rendimiento-');
  this.reset();
});

document.getElementById('form-asistencia').addEventListener('submit', function (e) {
  e.preventDefault();
  const datos = [
    document.getElementById("asis-nombre").value,
    document.getElementById("asis-curso").value,
    document.getElementById("asis-dias").value,
    document.getElementById("asis-ausencias").value
  ];
  if (datos.some(d => d === "")) {
    alert("Completa todos los campos.");
    return;
  }
  agregarFilaYGuardar(datos, 'tabla-asistencia', 'asistencia-');
  this.reset();
});
