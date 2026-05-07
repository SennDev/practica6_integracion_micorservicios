import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { Application, ApplicationStatus, DashboardStatistics } from '../../models/application.model';

@Component({
  selector: 'app-postulaciones-lista-screen',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './postulaciones-lista-screen.html',
  styleUrl: './postulaciones-lista-screen.scss',
})
export class PostulacionesListaScreen implements OnInit {
  applications = signal<Application[]>([]);
  remoteStats = signal<DashboardStatistics | null>(null);

  stats = computed<DashboardStatistics>(() => {
    return this.remoteStats() || {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      dogAdoptions: 0,
      catAdoptions: 0,
    };
  });

  constructor(private storageService: StorageService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.storageService.getAllApplications().subscribe({
      next: (data) => this.applications.set(data),
    });

    this.storageService.getStatistics().subscribe({
      next: (stats) => this.remoteStats.set(stats),
    });
  }

  handleStatusChange(id: number, newStatus: ApplicationStatus): void {
    this.storageService.updateApplicationStatus(id, newStatus).subscribe({
      next: () => this.loadData(),
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'En revisión': return 'bg-warning text-dark';
      case 'Aprobada': return 'bg-success';
      case 'Rechazada': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  exportToTXT(): void {
    const apps = this.applications();
    let content = 'REPORTE COMPLETO DE POSTULACIONES - ADOPTAYA\n';
    content += `Generado el: ${new Date().toLocaleString()}\n`;
    content += '==============================================\n\n';

    apps.forEach((app) => {
      content += `ID: #${app.id} | Solicitante: ${app.applicantName}\n`;
      content += `Mascota: ${app.petName} | Estado: ${app.status}\n`;
      content += `Email: ${app.email}\n`;
      content += `Fecha: ${app.date}\n`;
      content += '----------------------------------------------\n';
    });

    this.downloadFile(content, `postulaciones_completo_${Date.now()}.txt`);
  }

  exportSummary(): void {
    const s = this.stats();
    let content = 'RESUMEN EJECUTIVO - ADOPTAYA\n';
    content += `Total: ${s.total} | Aprobadas: ${s.approved}\n`;
    content += `Perros Adoptados: ${s.dogAdoptions} | Gatos Adoptados: ${s.catAdoptions}\n`;

    this.downloadFile(content, `resumen_adopciones_${Date.now()}.txt`);
  }

  private downloadFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
