document.addEventListener("DOMContentLoaded", () => {
  mostrarResultadosGuardados();
  mostrarBoletinGuardado();
});

function guardarNota() {
  const estudiante = document.getElementById("estudiante").value.trim();
  const materia = document.getElementById("materia").value.trim();
  const nota = document.getElementById("nota").value.trim();
  const observacion = document.getElementById("observacion").value.trim();

  if (!estudiante || !materia || !nota) {
    alert("Por favor completa todos los campos requeridos.");
    return;
  }

  const nuevaNota = {
    estudiante,
    materia,
    nota,
    observacion
  };

  let notasGuardadas = JSON.parse(localStorage.getItem("notas")) || [];
  notasGuardadas.push(nuevaNota);
  localStorage.setItem("notas", JSON.stringify(notasGuardadas));

  mostrarResultadosGuardados();
  limpiarFormulario();
}

function enviarAnuncio() {
  const anuncio = document.getElementById("anuncio").value.trim();
  if (!anuncio) {
    alert("El boletín no puede estar vacío.");
    return;
  }

  localStorage.setItem("boletin", anuncio);
  mostrarBoletinGuardado();
  document.getElementById("anuncio").value = "";
}

function mostrarResultadosGuardados() {
  const contenedor = document.getElementById("resultado");
  const notas = JSON.parse(localStorage.getItem("notas")) || [];

  if (notas.length === 0) {
    contenedor.innerHTML = '<div class="alert alert-info">Aún no hay notas registradas.</div>';
    return;
  }

  let contenido = '<h5>Notas Registradas:</h5>';
  contenido += '<ul class="list-group">';
  notas.forEach((n, i) => {
    contenido += `
      <li class="list-group-item">
        <strong>${n.estudiante}</strong> - <em>${n.materia}</em><br>
        Nota: <strong>${n.nota}</strong><br>
        Observación: ${n.observacion || "Sin observación"}
      </li>
    `;
  });
  contenido += '</ul>';
  contenedor.innerHTML = contenido;
}

function mostrarBoletinGuardado() {
  const boletin = localStorage.getItem("boletin");
  if (boletin) {
    const contenedor = document.getElementById("resultado");
    contenedor.innerHTML += `
      <div class="mt-4 alert alert-secondary">
        <h5>Último Boletín:</h5>
        <p>${boletin}</p>
      </div>
    `;
  }
}

function limpiarFormulario() {
  document.getElementById("estudiante").value = "";
  document.getElementById("materia").value = "";
  document.getElementById("nota").value = "";
  document.getElementById("observacion").value = "";
}
