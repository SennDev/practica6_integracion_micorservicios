import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Curso } from '../../core/models/curso.model';
import { CursosApiService } from '../../core/services/cursos-api.service';

@Component({
  selector: 'app-curso-detalle',
  imports: [CommonModule, RouterLink],
  templateUrl: './curso-detalle.html'
})
export class CursoDetalle implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly coursesApi = inject(CursosApiService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly curso = signal<Curso | null>(null);
  readonly cargando = signal(true);
  readonly error = signal('');

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isFinite(id) || id <= 0) {
      this.error.set('El curso solicitado no es valido.');
      this.cargando.set(false);
      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      this.cargando.set(false);
      return;
    }

    this.coursesApi.obtenerCursoPorId(id).subscribe({
      next: (curso) => {
        this.curso.set(curso);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(error.error?.message ?? 'No fue posible cargar el detalle del curso.');
        this.cargando.set(false);
      },
    });
  }
}
