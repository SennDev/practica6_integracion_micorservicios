import { Component } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent {
  scrollToProducts() {
    const element = document.getElementById('productos');
    element?.scrollIntoView({ behavior: 'smooth' });
  }

}
