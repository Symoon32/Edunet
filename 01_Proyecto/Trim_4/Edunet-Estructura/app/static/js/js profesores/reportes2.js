document.getElementById("formReporte").addEventListener("submit", function(e) {
    e.preventDefault();
  
    const estudiante = document.getElementById("estudiante").value.trim();
    const grado = document.getElementById("grado").value;
    const detalle = document.getElementById("detalle").value.trim();
  
    const resultado = document.getElementById("resultadoReporte");
    resultado.style.display = "block";
    resultado.innerHTML = `
      <h3>Reporte generado:</h3>
      <p><strong>Estudiante:</strong> ${estudiante}</p>
      <p><strong>Grado:</strong> ${grado}</p>
      <p><strong>Observaciones:</strong> ${detalle || "Sin observaciones adicionales."}</p>
    `;
 
    this.reset();
  });
  