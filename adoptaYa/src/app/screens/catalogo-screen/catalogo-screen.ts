import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Mascota } from '../../models/pet.model';
import { PetCard } from "../../partials/pet-card/pet-card";
import { PetApiService } from '../../services/pet-api.service';

interface PetFilters {
  searchTerm: string;
  species: string;
  size: string;
  ageRange: string;
}

@Component({
  selector: 'app-catalogo-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    PetCard
  ],
  templateUrl: './catalogo-screen.html',
  styleUrl: './catalogo-screen.scss',
})
export class CatalogoScreen implements OnInit {
  private allPets = signal<Mascota[]>([]);

  searchTerm = '';
  filters: PetFilters = {
    searchTerm: '',
    species: 'all',
    size: 'all',
    ageRange: 'all'
  };

  constructor(private readonly petApi: PetApiService) {}

  ngOnInit(): void {
    this.petApi.getPets().subscribe({
      next: (pets) => this.allPets.set(pets),
    });
  }

  filteredPets = computed(() => {
    let pets = this.allPets();

    if (this.filters.searchTerm) {
      pets = pets.filter((pet) =>
        pet.nombre.toLowerCase().includes(this.filters.searchTerm.toLowerCase())
      );
    }

    if (this.filters.species !== 'all') {
      pets = pets.filter((pet) => pet.especie === this.filters.species);
    }

    if (this.filters.size !== 'all') {
      pets = pets.filter((pet) => pet.tamano === this.filters.size);
    }

    if (this.filters.ageRange !== 'all') {
      pets = pets.filter((pet) => this.matchesAgeRange(pet.edad, this.filters.ageRange));
    }

    return pets;
  });

  onSearchChange(): void {
    this.filters.searchTerm = this.searchTerm;
    this.allPets.set([...this.allPets()]);
  }

  onFilterChange(): void {
    this.allPets.set([...this.allPets()]);
  }

  hasActiveFilters(): boolean {
    return (
      this.filters.species !== 'all' ||
      this.filters.size !== 'all' ||
      this.filters.ageRange !== 'all' ||
      this.searchTerm !== ''
    );
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filters = {
      searchTerm: '',
      species: 'all',
      size: 'all',
      ageRange: 'all'
    };
    this.allPets.set([...this.allPets()]);
  }

  private matchesAgeRange(ageNum: number, range: string): boolean {
    switch (range) {
      case 'young':
        return ageNum <= 2;
      case 'adult':
        return ageNum >= 3 && ageNum <= 7;
      case 'senior':
        return ageNum >= 8;
      default:
        return true;
    }
  }
}
