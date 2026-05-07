import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Mascota } from '../../models/pet.model';

@Component({
  selector: 'app-pet-card',
  standalone: true,
  imports: [CommonModule, RouterLink], // RouterLink es vital para el botón "Ver Detalles"
  templateUrl: './pet-card.html',
  styleUrl: './pet-card.scss'
})
export class PetCard {
  @Input({ required: true }) pet!: Mascota; // Agregamos 'required' para mejor control

  getSizeBadgeClass(size: string): string {
    switch (size) {
      case 'Pequeño':
        return 'badge-size-small';
      case 'Mediano':
        return 'badge-size-medium';
      case 'Grande':
        return 'badge-size-large';
      default:
        return 'bg-secondary';
    }
  }
}
