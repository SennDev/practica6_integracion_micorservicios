import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ContactoService } from 'src/app/services/contacto.service';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class ContactFormComponent {
  @Output() showAlert = new EventEmitter<{ message: string, type: 'success' | 'error' }>();

  constructor(
    private fb: FormBuilder,
    private contactoService: ContactoService
  ) {}

  form = this.fb.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    mensaje: ['', Validators.required]
  });

  submit() {
    if (this.form.invalid) {
      this.showAlert.emit({
        message: 'Por favor completa todos los campos correctamente',
        type: 'error'
      });
      return;
    }

    const { nombre, email, mensaje } = this.form.getRawValue();

    this.contactoService.sendMessage({
      nombre: nombre || '',
      correo: email || '',
      mensaje: mensaje || ''
    }).subscribe({
      next: () => {
        this.showAlert.emit({
          message: 'Mensaje enviado exitosamente',
          type: 'success'
        });
        this.form.reset();
      },
      error: () => {
        this.showAlert.emit({
          message: 'No se pudo enviar el mensaje',
          type: 'error'
        });
      }
    });
  }
}
