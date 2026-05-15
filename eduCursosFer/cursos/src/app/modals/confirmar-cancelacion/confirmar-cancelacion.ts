import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirmar-cancelacion',
  imports: [],
  templateUrl: './confirmar-cancelacion.html'
})
export class ConfirmarCancelacion {
  @Input() cursoNombre = '';
  @Output() confirmar = new EventEmitter<void>();
}
