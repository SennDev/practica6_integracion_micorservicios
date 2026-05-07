import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { Mascota } from '../../models/pet.model';
import { PetApiService } from '../../services/pet-api.service';

@Component({
  selector: 'app-detalle-screen',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
  ],
  templateUrl: './detalle-screen.html',
  styleUrl: './detalle-screen.scss',
})
export class DetalleScreen implements OnInit {
  pet?: Mascota;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private readonly petApi: PetApiService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.petApi.getPetById(id).subscribe({
      next: (pet) => {
        this.pet = pet;
      },
    });
  }

  goBack(): void {
    this.location.back();
  }

  getSizeBadgeClass(size: string): string {
    switch (size) {
      case 'PequeÃ±o': return 'badge-size-small';
      case 'Mediano': return 'badge-size-medium';
      case 'Grande': return 'badge-size-large';
      default: return 'bg-secondary';
    }
  }
}
