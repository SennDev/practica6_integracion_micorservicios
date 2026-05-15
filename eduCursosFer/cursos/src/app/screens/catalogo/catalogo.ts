import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Curso } from '../../core/models/curso.model';
import { CursosApiService } from '../../core/services/cursos-api.service';
import { CursoCard } from '../../partials/curso-card/curso-card';

@Component({
  selector: 'app-catalogo',
  imports: [CommonModule, FormsModule, CursoCard],
  templateUrl: './catalogo.html'
})
export class Catalogo implements OnInit {
  private readonly coursesApi = inject(CursosApiService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly cursos = signal<Curso[]>([]);
  readonly categorias = signal<string[]>([]);
  readonly cargando = signal(false);
  readonly error = signal('');

  terminoBusqueda = '';
  categoriaSeleccionada = '';

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.cargarCategorias();
    this.cargarCursos();
  }

  cargarCursos() {
    this.cargando.set(true);
    this.error.set('');

    this.coursesApi
      .listarCursos({
        search: this.terminoBusqueda.trim(),
        category: this.categoriaSeleccionada,
      })
      .subscribe({
        next: (cursos) => {
          this.cursos.set(cursos);
          this.cargando.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.error.set(error.error?.message ?? 'No fue posible cargar el catalogo de cursos.');
          this.cargando.set(false);
        },
      });
  }

  cargarCategorias() {
    this.coursesApi.listarCategorias().subscribe({
      next: (categorias) => this.categorias.set(categorias),
      error: () => this.categorias.set([]),
    });
  }
}
