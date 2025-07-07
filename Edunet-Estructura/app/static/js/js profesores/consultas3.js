document.getElementById("formBusqueda").addEventListener("submit", function (event) {
    event.preventDefault();
  
    const nombre = document.getElementById("docente").value.toLowerCase();
    const resultados = document.getElementById("resultados");
  
    const docentes = [
      {
        nombre: "maría rodríguez",
        materias: ["Matemáticas", "Física"],
        cursos: ["6A", "7B"]
      },
      {
        nombre: "juan pérez",
        materias: ["Biología", "Química"],
        cursos: ["8A", "9C"]
      },
      {
        nombre: "laura gómez",
        materias: ["Lengua Castellana", "Literatura"],
        cursos: ["10B", "11A"]
      }
    ];
  
    resultados.innerHTML = "";
  
    const encontrados = docentes.filter((doc) => doc.nombre.includes(nombre));
  
    if (encontrados.length > 0) {
      encontrados.forEach((doc) => {
        const div = document.createElement("div");
        div.className = "resultado-item";
        div.innerHTML = `
          <h3>${doc.nombre.charAt(0).toUpperCase() + doc.nombre.slice(1)}</h3>
          <p><strong>Materias:</strong> ${doc.materias.join(", ")}</p>
          <p><strong>Cursos:</strong> ${doc.cursos.join(", ")}</p>
        `;
        resultados.appendChild(div);
      });
    } else {
      resultados.innerHTML = "<p>No se encontraron docentes con ese nombre.</p>";
    }
  });
  
  
  