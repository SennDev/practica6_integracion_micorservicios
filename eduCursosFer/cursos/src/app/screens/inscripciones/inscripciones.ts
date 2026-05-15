import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Curso } from '../../core/models/curso.model';
import { CursosApiService } from '../../core/services/cursos-api.service';
import { InscripcionesApiService } from '../../core/services/inscripciones-api.service';

@Component({
  selector: 'app-inscripciones',
  imports: [CommonModule, FormsModule],
  templateUrl: './inscripciones.html'
})
export class Inscripciones implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly coursesApi = inject(CursosApiService);
  private readonly enrollmentsApi = inject(InscripcionesApiService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly cursos = signal<Curso[]>([]);
  readonly cargandoCursos = signal(true);
  readonly enviando = signal(false);
  readonly mensajeExito = signal('');
  readonly error = signal('');

  formData = {
    nombreEstudiante: '',
    email: '',
    cursoId: '',
    modalidad: 'Online',
    comentarios: '',
  };

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      this.cargandoCursos.set(false);
      return;
    }

    this.coursesApi.listarCursos().subscribe({
      next: (cursos) => {
        this.cursos.set(cursos);
        this.cargandoCursos.set(false);

        const courseIdFromQuery = this.route.snapshot.queryParamMap.get('cursoId');
        if (courseIdFromQuery && cursos.some((curso) => curso.id === Number(courseIdFromQuery))) {
          this.formData.cursoId = courseIdFromQuery;
        }
      },
      error: () => {
        this.error.set('No fue posible cargar el catalogo para registrar la inscripcion.');
        this.cargandoCursos.set(false);
      },
    });
  }

  enviarInscripcion(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.enviando.set(true);
    this.error.set('');
    this.mensajeExito.set('');

    this.enrollmentsApi
      .crearInscripcion({
        nombreEstudiante: this.formData.nombreEstudiante.trim(),
        email: this.formData.email.trim(),
        cursoId: Number(this.formData.cursoId),
        modalidad: this.formData.modalidad,
        comentarios: this.formData.comentarios.trim(),
      })
      .subscribe({
        next: (inscripcion) => {
          this.enviando.set(false);
          this.mensajeExito.set(
            `Inscripcion confirmada con folio ${inscripcion.codigo} para el curso ${inscripcion.cursoNombre}.`,
          );
          form.resetForm({
            nombreEstudiante: '',
            email: '',
            cursoId: '',
            modalidad: 'Online',
            comentarios: '',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.enviando.set(false);
          this.error.set(error.error?.message ?? 'No fue posible registrar la inscripcion.');
        },
      });
  }
}
