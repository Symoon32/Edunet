document.addEventListener("DOMContentLoaded", mostrarCalificaciones);

function guardarCalificacion() {
  const estudiante = document.getElementById("estudiante").value.trim();
  const actividad = document.getElementById("actividad").value.trim();
  const nota = document.getElementById("nota").value.trim();

  if (estudiante && actividad && nota) {
    const nuevaCalificacion = { estudiante, actividad, nota };
    
    let calificaciones = JSON.parse(localStorage.getItem("calificaciones")) || [];
    calificaciones.push(nuevaCalificacion);
    localStorage.setItem("calificaciones", JSON.stringify(calificaciones));

    mostrarCalificaciones();

    document.getElementById("estudiante").value = "";
    document.getElementById("actividad").value = "";
    document.getElementById("nota").value = "";
  } else {
    alert("Por favor, completa todos los campos.");
  }
}

function mostrarCalificaciones() {
  const lista = document.getElementById("listaCalificaciones");
  lista.innerHTML = "";

  const calificaciones = JSON.parse(localStorage.getItem("calificaciones")) || [];

  calificaciones.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card card-custom p-3 shadow-sm";
    card.innerHTML = `
      <p><strong>Estudiante:</strong> ${item.estudiante}</p>
      <p><strong>Actividad:</strong> ${item.actividad}</p>
      <p><strong>Nota:</strong> ${item.nota}</p>
    `;
    lista.appendChild(card);
  });
}
