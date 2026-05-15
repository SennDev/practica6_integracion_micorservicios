import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '../config/api.config';
import { CrearMensajeContactoRequest, MensajeContacto } from '../models/contacto.model';

@Injectable({ providedIn: 'root' })
export class ContactoApiService {
  private readonly http = inject(HttpClient);

  enviarMensaje(payload: CrearMensajeContactoRequest) {
    return this.http.post<MensajeContacto>(API_ROUTES.contactMessages, payload);
  }

  listarMensajes() {
    return this.http.get<MensajeContacto[]>(API_ROUTES.contactMessages);
  }
}
