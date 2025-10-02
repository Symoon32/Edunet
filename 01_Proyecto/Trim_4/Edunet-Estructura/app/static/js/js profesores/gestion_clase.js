document.addEventListener('DOMContentLoaded', function () {
  const contenedorClases = document.querySelector('.clases');

  // Cargar clases desde localStorage
  function cargarClases() {
    const clasesGuardadas = JSON.parse(localStorage.getItem('clases')) || [];
    clasesGuardadas.forEach(clase => {
      crearTarjetaClase(clase.titulo, clase.horario);
    });
  }

  // Guardar clases en localStorage
  function guardarClases() {
    const tarjetas = document.querySelectorAll('.clase-card');
    const clases = [];
    tarjetas.forEach(tarjeta => {
      const titulo = tarjeta.querySelector('h3').innerText;
      const horario = tarjeta.querySelector('p').innerText;
      clases.push({ titulo, horario });
    });
    localStorage.setItem('clases', JSON.stringify(clases));
  }

  // Crear tarjeta HTML de clase
  function crearTarjetaClase(titulo, horario) {
    const div = document.createElement('div');
    div.className = 'clase-card';
    div.innerHTML = `
      <h3>${titulo}</h3>
      <p>${horario}</p>
      <button class="btn-editar btn btn-warning me-2">Editar</button>
      <button class="eliminar btn btn-danger">Eliminar</button>
    `;
    contenedorClases.appendChild(div);
    activarBotones(div);
  }

  // Funcionalidad de botones Editar y Eliminar
  function activarBotones(tarjeta) {
    const btnEditar = tarjeta.querySelector('.btn-editar');
    const btnEliminar = tarjeta.querySelector('.eliminar');

    btnEditar.addEventListener('click', () => {
      const titulo = tarjeta.querySelector('h3');
      const horario = tarjeta.querySelector('p');

      const nuevoTitulo = prompt("Editar nombre de la clase:", titulo.innerText);
      const nuevoHorario = prompt("Editar horario:", horario.innerText);

      if (nuevoTitulo !== null && nuevoTitulo.trim() !== "") {
        titulo.innerText = nuevoTitulo;
      }
      if (nuevoHorario !== null && nuevoHorario.trim() !== "") {
        horario.innerText = nuevoHorario;
      }

      guardarClases();
    });

    btnEliminar.addEventListener('click', () => {
      if (confirm("¿Estás seguro de eliminar esta clase?")) {
        tarjeta.remove();
        guardarClases();
      }
    });
  }

  // Inicializar
  cargarClases();
});
