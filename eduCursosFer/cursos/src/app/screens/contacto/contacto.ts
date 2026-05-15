import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ContactoApiService } from '../../core/services/contacto-api.service';

@Component({
  selector: 'app-contacto',
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto.html'
})
export class Contacto {
  private readonly contactApi = inject(ContactoApiService);
  readonly mensajeEnviado = signal(false);
  readonly enviando = signal(false);
  readonly error = signal('');

  enviarMensaje(form: NgForm) {
    if (!form.valid) {
      return;
    }

    this.enviando.set(true);
    this.error.set('');
    this.mensajeEnviado.set(false);

    this.contactApi
      .enviarMensaje({
        nombre: form.value.nombre.trim(),
        correo: form.value.correo.trim(),
        mensaje: form.value.mensaje.trim(),
      })
      .subscribe({
        next: () => {
          this.enviando.set(false);
          this.mensajeEnviado.set(true);
          form.resetForm();
        },
        error: (error: HttpErrorResponse) => {
          this.enviando.set(false);
          this.error.set(error.error?.message ?? 'No fue posible enviar tu mensaje.');
        },
      });
  }
}
