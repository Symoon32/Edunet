const usuarios = [
  { correo: "estudiante@colegio.edu", contraseña: "1234", tipo: "Estudiante" },
  { correo: "profesor@colegio.edu", contraseña: "1234", tipo: "Profesor" },
  { correo: "admin@colegio.edu", contraseña: "1234", tipo: "Administrador" },
  { correo: "padre@colegio.edu", contraseña: "1234", tipo: "Padre" }
];

document.getElementById("loginForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const correo = document.querySelector('input[type="email"]').value.trim();
  const contraseña = document.querySelector('input[type="password"]').value.trim();

  const usuarioEncontrado = usuarios.find(
    user => user.correo === correo && user.contraseña === contraseña
  );

  if (usuarioEncontrado) {
    localStorage.setItem("usuarioLogueado", JSON.stringify(usuarioEncontrado));

    switch (usuarioEncontrado.tipo) {
      case "Estudiante":
        window.location.href = "/app/templates/html estudiantes/paginaprincipal.html";
        break;
      case "Profesor":
        window.location.href = "/app/templates/html profesores/index pagina principal Profesores.html";
        break;
      case "Administrador":
        window.location.href = "/app/templates/html admin/principal.html";
        break;
      case "Padre":
        window.location.href = "/app/templates/html tutores/principal acudiente.html";
        break;
    }
  } else {
    alert("Usuario no encontrado o datos incorrectos.\nPor favor revise el correo y contraseña");
  }
});
