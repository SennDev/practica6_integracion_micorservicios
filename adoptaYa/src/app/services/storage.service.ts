import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Application,
  CreateApplicationDTO,
  ApplicationStatus,
  DashboardStatistics,
} from '../models/application.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(private readonly http: HttpClient) {}

  saveApplication(applicationData: CreateApplicationDTO): Observable<Application> {
    return this.http.post<Application>('/api/applications', applicationData);
  }

  getAllApplications(): Observable<Application[]> {
    return this.http.get<Application[]>('/api/applications');
  }

  getStatistics(): Observable<DashboardStatistics> {
    return this.http.get<DashboardStatistics>('/api/applications/stats');
  }

  updateApplicationStatus(applicationId: number, newStatus: ApplicationStatus): Observable<Application> {
    return this.http.patch<Application>(`/api/applications/${applicationId}/status`, {
      status: newStatus,
    });
  }
}
