let mensajeSeleccionadoIndex = null;

document.addEventListener("DOMContentLoaded", function () {
  cargarMensajes();
});

function enviarMensaje() {
  const destinatario = document.getElementById("destinatario").value;
  const nombre = document.getElementById("nombre").value.trim();
  const mensajeTexto = document.getElementById("mensaje").value.trim();

  if (!destinatario || !nombre || !mensajeTexto) {
    alert("Por favor completa todos los campos.");
    return;
  }

  const nuevoMensaje = { destinatario, nombre, mensajeTexto };
  const mensajesGuardados = JSON.parse(localStorage.getItem("mensajesChat")) || [];
  mensajesGuardados.push(nuevoMensaje);
  localStorage.setItem("mensajesChat", JSON.stringify(mensajesGuardados));

  agregarMensajeAlChat(nuevoMensaje, mensajesGuardados.length - 1);
  limpiarFormulario();
}

function agregarMensajeAlChat({ destinatario, nombre, mensajeTexto }, index) {
  const chatContainer = document.getElementById("chatContainer");
  const mensajeDiv = document.createElement("div");
  mensajeDiv.classList.add("mensaje");
  mensajeDiv.dataset.index = index;
  mensajeDiv.innerHTML = `
    <strong>${destinatario === "padre" ? "Acudiente" : "Estudiante"}: ${nombre}</strong>
    ${mensajeTexto}
  `;
  mensajeDiv.addEventListener("click", () => abrirModal(index));
  chatContainer.appendChild(mensajeDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function cargarMensajes() {
  const mensajesGuardados = JSON.parse(localStorage.getItem("mensajesChat")) || [];
  mensajesGuardados.forEach((msg, index) => {
    agregarMensajeAlChat(msg, index);
  });
}

function limpiarFormulario() {
  document.getElementById("mensaje").value = "";
  document.getElementById("nombre").value = "";
  document.getElementById("destinatario").selectedIndex = 0;
}

function abrirModal(index) {
  mensajeSeleccionadoIndex = index;
  const mensajes = JSON.parse(localStorage.getItem("mensajesChat")) || [];
  document.getElementById("mensajeEditado").value = mensajes[index].mensajeTexto;

  const modal = new bootstrap.Modal(document.getElementById("mensajeModal"));
  modal.show();
}

document.getElementById("btnGuardar").addEventListener("click", () => {
  const mensajes = JSON.parse(localStorage.getItem("mensajesChat")) || [];
  mensajes[mensajeSeleccionadoIndex].mensajeTexto = document.getElementById("mensajeEditado").value;
  localStorage.setItem("mensajesChat", JSON.stringify(mensajes));
  recargarMensajes();
  bootstrap.Modal.getInstance(document.getElementById("mensajeModal")).hide();
});

document.getElementById("btnEliminar").addEventListener("click", () => {
  const mensajes = JSON.parse(localStorage.getItem("mensajesChat")) || [];
  mensajes.splice(mensajeSeleccionadoIndex, 1);
  localStorage.setItem("mensajesChat", JSON.stringify(mensajes));
  recargarMensajes();
  bootstrap.Modal.getInstance(document.getElementById("mensajeModal")).hide();
});

function recargarMensajes() {
  const chatContainer = document.getElementById("chatContainer");
  chatContainer.innerHTML = "";
  cargarMensajes();
}

  