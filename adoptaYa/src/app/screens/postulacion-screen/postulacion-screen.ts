import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { PetApiService } from '../../services/pet-api.service';
import { CreateApplicationDTO } from '../../models/application.model';
import { Mascota } from '../../models/pet.model';

@Component({
  selector: 'app-postulacion-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './postulacion-screen.html',
  styleUrl: './postulacion-screen.scss',
})
export class PostulacionScreen implements OnInit {
  formData = signal({
    fullName: '',
    email: '',
    petId: '',
    experience: '',
    homeEvidence: ''
  });

  isSubmitting = signal(false);
  showSuccess = signal(false);
  showError = signal(false);
  errorMessage = signal('');

  petsData: Mascota[] = [
  ];

  selectedPet = computed(() => {
    const idBusqueda = Number(this.formData().petId);
    return this.petsData.find((pet) => pet.id === idBusqueda);
  });

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private storageService: StorageService,
    private readonly petApi: PetApiService,
  ) { }

  ngOnInit(): void {
    this.petApi.getPets().subscribe({
      next: (pets) => {
        this.petsData = pets;
        const petId = this.route.snapshot.queryParamMap.get('petId');
        if (petId) {
          this.formData.update((prev) => ({ ...prev, petId }));
        }
      },
    });
  }

  handleSubmit(): void {
    if (this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.showError.set(false);

    const currentPet = this.selectedPet();

    if (!currentPet) {
      this.errorMessage.set('Por favor, selecciona una mascota valida.');
      this.showError.set(true);
      this.isSubmitting.set(false);
      return;
    }

    const applicationData: CreateApplicationDTO = {
      applicantName: this.formData().fullName,
      email: this.formData().email,
      petId: currentPet.id,
      petName: currentPet.nombre,
      petSpecies: currentPet.especie as 'Perro' | 'Gato',
      experience: this.formData().experience,
      homeEvidence: this.formData().homeEvidence
    };

    this.storageService.saveApplication(applicationData).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showSuccess.set(true);
        setTimeout(() => {
          this.showSuccess.set(false);
          this.router.navigate(['/postulaciones']);
        }, 2500);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.errorMessage.set(`Ya existe una postulacion activa para ${currentPet.nombre} con este correo.`);
        this.showError.set(true);
      },
    });
  }
}
