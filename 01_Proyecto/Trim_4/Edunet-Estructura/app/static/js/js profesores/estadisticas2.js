function generarInforme() {
    const grupo = document.getElementById("grupo").value;
    const tipo = document.getElementById("tipo").value;
    const resultado = document.getElementById("resultado");
  
    let informe = "";
  
    if (tipo === "rendimiento") {
      informe = `
        <h3>Informe de Rendimiento Escolar - Grupo ${grupo}</h3>
        <ul>
          <li>Promedio general: 4.1</li>
          <li>Estudiantes con bajo desempeño: 3</li>
          <li>Estudiantes destacados: 5</li>
        </ul>
      `;
    } else if (tipo === "asistencia") {
      informe = `
        <h3>Informe de Asistencia - Grupo ${grupo}</h3>
        <ul>
          <li>Asistencia promedio: 91%</li>
          <li>Estudiantes con más inasistencias: Juan Pérez, Laura Díaz</li>
          <li>Días con mayor ausentismo: Lunes</li>
        </ul>
      `;
    }
  
    resultado.innerHTML = informe;
    resultado.style.display = "block";
  }
  