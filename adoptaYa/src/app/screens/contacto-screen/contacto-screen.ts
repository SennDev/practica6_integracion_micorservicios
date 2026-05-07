import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacto-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './contacto-screen.html',
  styleUrl: './contacto-screen.scss',
})
export class ContactoScreen {
  private http = inject(HttpClient);

  formData = {
    name: '',
    email: '',
    message: ''
  };

  isSubmitting = false;
  showSuccess = false;

  handleSubmit() {
    this.isSubmitting = true;

    this.http.post('/api/contact/messages', {
      nombre: this.formData.name,
      correo: this.formData.email,
      mensaje: this.formData.message,
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showSuccess = true;
        this.formData = { name: '', email: '', message: '' };

        setTimeout(() => {
          this.showSuccess = false;
        }, 5000);
      },
      error: () => {
        this.isSubmitting = false;
      },
    });
  }

  closeAlert() {
    this.showSuccess = false;
  }
}
