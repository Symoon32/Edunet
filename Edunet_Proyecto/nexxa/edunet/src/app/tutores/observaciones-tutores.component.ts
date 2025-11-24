
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-inicio-observaciones-tutores',
	templateUrl: './observaciones-tutores.component.html',
	styleUrls: ['./observaciones-tutores.component.css'],
	standalone: true,
	imports: [FormsModule]
})
export class ObservacionesTutoresComponent {
	estudianteSeleccionado: string = '';
	observaciones: { [key: string]: string[] } = {
		juan: [
			'Tiene buen desempeño en matemáticas.',
			'Debe mejorar su puntualidad.',
			'Participa activamente en clase.'
		],
		camila: [
			'Presentó tareas incompletas la última semana.',
			'Destaca en actividades artísticas.',
			'Necesita reforzar comprensión lectora.'
		]
	};
}
