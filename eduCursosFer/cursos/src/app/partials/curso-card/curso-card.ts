import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Curso } from '../../core/models/curso.model';

@Component({
  selector: 'app-curso-card',
  imports: [CommonModule, RouterLink],
  templateUrl: './curso-card.html'
})
export class CursoCard {
  @Input({ required: true }) curso!: Curso;
}
