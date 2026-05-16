import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CarritoService } from 'src/app/services/carrito.service';
import { Product, ProductosService } from 'src/app/services/productos.service';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  templateUrl: './product-grid.component.html',
  styleUrls: ['./product-grid.component.scss'],
  imports: [CommonModule, ProductCardComponent]
})
export class ProductGridComponent implements OnInit {
  @Output() showAlert = new EventEmitter<{ message: string, type: 'success' | 'error' }>();

  products: Product[] = [];

  constructor(
    private productosService: ProductosService,
    private carritoService: CarritoService
  ) {}

  ngOnInit(): void {
    this.productosService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: () => {
        this.showAlert.emit({
          message: 'No se pudo cargar el catalogo de productos',
          type: 'error'
        });
      }
    });
  }

  addToCart(product: Product) {
    this.carritoService.addProduct(product).subscribe({
      next: () => {
        this.showAlert.emit({
          message: `${product.name} agregado al carrito`,
          type: 'success'
        });
      },
      error: () => {
        this.showAlert.emit({
          message: 'No se pudo agregar el producto al carrito',
          type: 'error'
        });
      }
    });
  }
}
