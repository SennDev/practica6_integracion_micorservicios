import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation } from '../interfaces/reservation';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  constructor(private readonly http: HttpClient) {}

  saveReservation(reservation: Reservation): Observable<Reservation> {
    return this.http.post<Reservation>('/api/reservations', reservation);
  }
}
