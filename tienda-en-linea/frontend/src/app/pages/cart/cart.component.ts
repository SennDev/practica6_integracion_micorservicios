import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from 'src/app/layout/navbar/navbar.component';
import { CarritoService, CartItem } from 'src/app/services/carrito.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  imports: [CommonModule, RouterModule, NavbarComponent]
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  backendSubtotal = 0;
  envio = 25;

  constructor(private carritoService: CarritoService) {}

  ngOnInit(): void {
    this.loadCart();
  }

  get subtotal(): number {
    return this.backendSubtotal;
  }

  get total(): number {
    return this.subtotal + this.envio;
  }

  loadCart() {
    this.carritoService.getCart().subscribe((cart) => {
      this.cartItems = cart.products;
      this.backendSubtotal = cart.subtotal;
    });
  }

  removeItem(id: string) {
    this.carritoService.removeProduct(id).subscribe((cart) => {
      this.cartItems = cart.products;
      this.backendSubtotal = cart.subtotal;
    });
  }

  clearCart() {
    this.carritoService.clearCart().subscribe((cart) => {
      this.cartItems = cart.products;
      this.backendSubtotal = cart.subtotal;
    });
  }
}
