import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inicio-estudiantes',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './inicio-estudiantes.component.html',
  styleUrls: ['./inicio-estudiantes.component.css']
})
export class InicioEstudiantesComponent {
  constructor() {}
  ngOnInit(): void {}
}
