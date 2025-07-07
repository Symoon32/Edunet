document.addEventListener('DOMContentLoaded', () => {
    const datosUsuario = {
      nombre: "Sara Ruiz",
      correo: "sara@gmail.com",
      programa: "Análisis y Desarrollo de Software",
      semestre: 5
    };
  
    document.getElementById('nombre').textContent = datosUsuario.nombre;
    document.getElementById('correo').textContent = datosUsuario.correo;
    document.getElementById('programa').textContent = datosUsuario.programa;
    document.getElementById('semestre').textContent = datosUsuario.semestre;
  });
  