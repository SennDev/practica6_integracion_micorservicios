import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from './productos.service';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Cart {
  idCarrito: string;
  products: CartItem[];
  subtotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private readonly apiUrl = '/api/carrito';

  constructor(private http: HttpClient) {}

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.apiUrl);
  }

  addProduct(product: Product): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/productos`, {
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }

  removeProduct(productId: string): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/productos/${productId}`);
  }

  clearCart(): Observable<Cart> {
    return this.http.delete<Cart>(this.apiUrl);
  }
}
