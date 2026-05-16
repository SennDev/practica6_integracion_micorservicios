import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { HomeComponent } from './pages/home/home.component';
import { CartComponent } from './pages/cart/cart.component';
import { AlertComponent } from './shared/alert/alert.component';
import { ProductGridComponent } from './pages/product-grid/product-grid.component';
import { ContactFormComponent } from './pages/contact-form/contact-form.component';
import { HeroComponent } from './pages/hero/hero.component';

@NgModule({
  declarations: [
    AppComponent,


  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    NavbarComponent,
    HomeComponent,
    AlertComponent,
    ProductGridComponent,
    ContactFormComponent,
    HeroComponent,
    CartComponent,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
