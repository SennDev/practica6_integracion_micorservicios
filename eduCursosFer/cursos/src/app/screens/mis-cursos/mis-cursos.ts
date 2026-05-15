import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, Inject, PLATFORM_ID, ViewChild, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ConfirmarCancelacion } from '../../modals/confirmar-cancelacion/confirmar-cancelacion';
import { EstadisticaInscripciones, Inscripcion } from '../../core/models/inscripcion.model';
import { InscripcionesApiService } from '../../core/services/inscripciones-api.service';

@Component({
  selector: 'app-mis-cursos',
  imports: [CommonModule, ConfirmarCancelacion],
  templateUrl: './mis-cursos.html'
})
export class MisCursos implements AfterViewInit {
  private readonly enrollmentsApi = inject(InscripcionesApiService);
  @ViewChild('graficaCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private viewReady = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  readonly inscripciones = signal<Inscripcion[]>([]);
  readonly estadisticas = signal<EstadisticaInscripciones[]>([]);
  readonly error = signal('');
  readonly cargando = signal(true);
  readonly cancelando = signal(false);
  readonly inscripcionSeleccionada = signal<Inscripcion | null>(null);

  ngAfterViewInit() {
    this.viewReady = true;

    if (isPlatformBrowser(this.platformId)) {
      this.cargarInformacion();
    }
  }

  cargarInformacion() {
    this.cargando.set(true);
    this.error.set('');

    this.enrollmentsApi.listarInscripciones().subscribe({
      next: (inscripciones) => {
        this.inscripciones.set(inscripciones);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(error.error?.message ?? 'No fue posible cargar tus inscripciones.');
        this.cargando.set(false);
      },
    });

    this.enrollmentsApi.obtenerEstadisticas().subscribe({
      next: (estadisticas) => {
        this.estadisticas.set(estadisticas);
        this.redibujarGrafica();
      },
      error: () => {
        this.estadisticas.set([]);
        this.redibujarGrafica();
      },
    });
  }

  seleccionarInscripcion(inscripcion: Inscripcion) {
    this.inscripcionSeleccionada.set(inscripcion);
  }

  cancelarSeleccionada() {
    const inscripcion = this.inscripcionSeleccionada();

    if (!inscripcion || inscripcion.estado === 'Cancelada') {
      return;
    }

    this.cancelando.set(true);

    this.enrollmentsApi.cancelarInscripcion(inscripcion.id).subscribe({
      next: () => {
        this.cancelando.set(false);
        this.inscripcionSeleccionada.set(null);
        this.cargarInformacion();
      },
      error: () => {
        this.cancelando.set(false);
        this.error.set('No fue posible cancelar la inscripcion seleccionada.');
      },
    });
  }

  exportarTxt() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const lines = this.inscripciones().map(
      (inscripcion) =>
        `${inscripcion.codigo} | ${inscripcion.nombreEstudiante} | ${inscripcion.cursoNombre} | ${inscripcion.modalidad} | ${inscripcion.estado}`,
    );
    const content = ['Reporte de inscripciones EduCursos', ...lines].join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = 'mis-cursos.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  redibujarGrafica() {
    if (!this.viewReady || !isPlatformBrowser(this.platformId)) {
      return;
    }

    setTimeout(() => this.dibujarGrafica(), 50);
  }

  dibujarGrafica() {
    if (!this.canvasRef) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    const datos = this.estadisticas();

    if (ctx) {
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#e9ecef';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 6; i++) {
        const y = 40 + (i * 40);
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(width - 30, y);
        ctx.stroke();
      }

      if (datos.length === 0) {
        ctx.fillStyle = '#6c757d';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Aun no hay inscripciones activas para graficar.', width / 2, height / 2);
        return;
      }

      const colores = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1', '#0dcaf0'];
      const maxValue = Math.max(...datos.map((dato) => dato.totalActivas), 1);
      const barWidth = 60;
      const separacion = width / datos.length;

      datos.forEach((dato, index) => {
        const x = (index * separacion) + (separacion / 2) - (barWidth / 2);
        const alturaBarra = (dato.totalActivas / maxValue) * 200;
        const yPos = height - 50 - alturaBarra;

        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 3;

        ctx.fillStyle = colores[index % colores.length];
        ctx.fillRect(x, yPos, barWidth, alturaBarra);

        ctx.shadowColor = 'transparent';

        ctx.fillStyle = '#495057';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(dato.totalActivas.toString(), x + (barWidth / 2), yPos - 10);

        ctx.fillStyle = '#212529';
        ctx.font = '13px Arial';
        ctx.fillText(dato.cursoNombre.slice(0, 12), x + (barWidth / 2), height - 20);
      });
    }
  }
}
