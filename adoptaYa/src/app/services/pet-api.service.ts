import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Mascota } from '../models/pet.model';

interface PetApiResponse {
  id: number;
  nombre: string;
  especie: string;
  edad: string;
  tamano: string;
  descripcion: string;
  imagen: string;
  requisitos: string;
}

@Injectable({
  providedIn: 'root',
})
export class PetApiService {
  constructor(private readonly http: HttpClient) {}

  getPets(): Observable<Mascota[]> {
    return this.http.get<PetApiResponse[]>('/api/pets').pipe(
      map((pets) => pets.map((pet) => this.mapPet(pet)))
    );
  }

  getPetById(id: number): Observable<Mascota | undefined> {
    return this.http.get<PetApiResponse | null>(`/api/pets/${id}`).pipe(
      map((pet) => (pet ? this.mapPet(pet) : undefined))
    );
  }

  private mapPet(pet: PetApiResponse): Mascota {
    return {
      id: pet.id,
      nombre: pet.nombre,
      especie: pet.especie,
      edad: Number(String(pet.edad).match(/\d+/)?.[0] || 0),
      tamano: (pet.tamano === 'Pequenio' ? 'PequeÃ±o' : pet.tamano) as Mascota['tamano'],
      descripcion: pet.descripcion,
      imagen: pet.imagen,
      requisitos: pet.requisitos,
    };
  }
}
