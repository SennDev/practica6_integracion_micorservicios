import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from 'src/app/layout/navbar/navbar.component';
import { HeroComponent } from '../hero/hero.component';
import { ProductGridComponent } from '../product-grid/product-grid.component';
import { ContactFormComponent } from '../contact-form/contact-form.component';
import { AlertComponent } from 'src/app/shared/alert/alert.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    CommonModule,
    HeroComponent,
    ProductGridComponent,
    ContactFormComponent,
    AlertComponent,


  ]
})
export class HomeComponent {
  alert: { message: string; type: 'success' | 'error' } | null = null;

  showAlert(message: string, type: 'success' | 'error') {
    this.alert = { message, type };
  }

  closeAlert() {
    this.alert = null;
  }

}
