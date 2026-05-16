import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ContactMessage {
  nombre: string;
  correo: string;
  mensaje: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactoService {
  private readonly apiUrl = '/api/contacto';

  constructor(private http: HttpClient) {}

  sendMessage(message: ContactMessage): Observable<ContactMessage> {
    return this.http.post<ContactMessage>(this.apiUrl, message);
  }
}
