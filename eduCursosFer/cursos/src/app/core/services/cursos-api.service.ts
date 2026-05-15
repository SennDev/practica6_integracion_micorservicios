import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '../config/api.config';
import { Curso, FiltrosCurso } from '../models/curso.model';

@Injectable({ providedIn: 'root' })
export class CursosApiService {
  private readonly http = inject(HttpClient);

  listarCursos(filters: FiltrosCurso = {}) {
    let params = new HttpParams();

    if (filters.search) {
      params = params.set('search', filters.search);
    }

    if (filters.category) {
      params = params.set('category', filters.category);
    }

    return this.http.get<Curso[]>(API_ROUTES.courses, { params });
  }

  listarCategorias() {
    return this.http.get<string[]>(API_ROUTES.categories);
  }

  obtenerCursoPorId(id: number) {
    return this.http.get<Curso>(`${API_ROUTES.courses}/${id}`);
  }
}
