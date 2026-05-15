import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '../config/api.config';
import {
  CrearInscripcionRequest,
  EstadisticaInscripciones,
  Inscripcion,
} from '../models/inscripcion.model';

@Injectable({ providedIn: 'root' })
export class InscripcionesApiService {
  private readonly http = inject(HttpClient);

  listarInscripciones(email?: string) {
    let params = new HttpParams();

    if (email) {
      params = params.set('email', email);
    }

    return this.http.get<Inscripcion[]>(API_ROUTES.enrollments, { params });
  }

  crearInscripcion(payload: CrearInscripcionRequest) {
    return this.http.post<Inscripcion>(API_ROUTES.enrollments, payload);
  }

  cancelarInscripcion(id: number) {
    return this.http.patch<Inscripcion>(`${API_ROUTES.enrollments}/${id}/cancel`, {});
  }

  obtenerEstadisticas() {
    return this.http.get<EstadisticaInscripciones[]>(API_ROUTES.enrollmentStats);
  }
}
