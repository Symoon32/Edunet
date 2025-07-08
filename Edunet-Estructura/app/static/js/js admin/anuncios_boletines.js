// Obtener elementos
const tituloInput = document.querySelector('input[placeholder="Título del anuncio o boletín"]');
const contenidoInput = document.querySelector('textarea');
const listaBoletines = document.querySelector('.list-group');

const botonPublicar = document.getElementById('btn-publicar');
const botonEditar = document.getElementById('btn-editar');
const botonEliminar = document.getElementById('btn-eliminar');

let boletines = JSON.parse(localStorage.getItem('boletines')) || [];
let seleccionado = null;

// Mostrar boletines al cargar
document.addEventListener('DOMContentLoaded', renderBoletines);

// Publicar nuevo boletín
botonPublicar.addEventListener('click', () => {
  const titulo = tituloInput.value.trim();
  const contenido = contenidoInput.value.trim();

  if (!titulo || !contenido) {
    alert('Por favor, completa el título y el contenido.');
    return;
  }

  const fecha = new Date().toLocaleDateString('es-CO');
  const nuevoBoletin = { titulo, contenido, fecha };

  boletines.unshift(nuevoBoletin);
  guardarBoletines();
  limpiarCampos();
  renderBoletines();
});

// Editar boletín seleccionado
botonEditar.addEventListener('click', () => {
  if (seleccionado === null) {
    alert('Selecciona un boletín para editar.');
    return;
  }

  const nuevoTitulo = tituloInput.value.trim();
  const nuevoContenido = contenidoInput.value.trim();

  if (!nuevoTitulo || !nuevoContenido) {
    alert('Por favor, completa ambos campos para editar.');
    return;
  }

  boletines[seleccionado].titulo = nuevoTitulo;
  boletines[seleccionado].contenido = nuevoContenido;

  guardarBoletines();
  limpiarCampos();
  renderBoletines();
  seleccionado = null;
});

// Eliminar boletín seleccionado
botonEliminar.addEventListener('click', () => {
  if (seleccionado === null) {
    alert('Selecciona un boletín para eliminar.');
    return;
  }

  const confirmado = confirm('¿Estás seguro de eliminar este boletín?');
  if (!confirmado) return;

  boletines.splice(seleccionado, 1);
  seleccionado = null;
  guardarBoletines();
  limpiarCampos();
  renderBoletines();
});

// Mostrar boletines
function renderBoletines() {
  listaBoletines.innerHTML = '';

  boletines.forEach((boletin, index) => {
    const li = document.createElement('li');
    li.className = 'list-group-item list-group-item-action';
    li.innerHTML = `
      <strong>${boletin.titulo}</strong> - ${boletin.fecha}
      <br>
      <span>${boletin.contenido}</span>
    `;

    li.addEventListener('click', () => {
      seleccionado = index;
      tituloInput.value = boletin.titulo;
      contenidoInput.value = boletin.contenido;

      // Marcar como seleccionado visualmente
      const items = document.querySelectorAll('.list-group-item');
      items.forEach(item => item.classList.remove('active'));
      li.classList.add('active');
    });

    listaBoletines.appendChild(li);
  });
}

// Guardar en localStorage
function guardarBoletines() {
  localStorage.setItem('boletines', JSON.stringify(boletines));
}

// Limpiar campos y selección
function limpiarCampos() {
  tituloInput.value = '';
  contenidoInput.value = '';
  const items = document.querySelectorAll('.list-group-item');
  items.forEach(item => item.classList.remove('active'));
}