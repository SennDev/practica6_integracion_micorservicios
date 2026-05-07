/**
 * application.model.ts
 * Define las interfaces para las postulaciones de AdoptaYA
 */

export type ApplicationStatus = 'En revisión' | 'Aprobada' | 'Rechazada';

export interface Application {
  id: number;
  applicantName: string;
  email: string;
  petId: number;
  petName: string;
  petSpecies?: 'Perro' | 'Gato';
  experience: string;
  homeEvidence: string;
  status: ApplicationStatus;
  date: string;
}

export interface CreateApplicationDTO {
  applicantName: string;
  email: string;
  petId: number;
  petName: string;
  petSpecies?: 'Perro' | 'Gato';
  experience: string;
  homeEvidence: string;
}

export interface ApplicationIdentifier {
  applicantName: string;
  petId: number;
}

export interface DashboardStatistics {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  dogAdoptions: number;
  catAdoptions: number;
}
