import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Dish, DishCategory } from '../interfaces/dish';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  readonly dishes = signal<Dish[]>([]);

  constructor(private readonly http: HttpClient) {
    this.http.get<Dish[]>('/api/menu/items').subscribe({
      next: (dishes) => this.dishes.set(dishes),
      error: () => this.dishes.set([]),
    });
  }

  getDishesByCategory(category: DishCategory): Dish[] {
    return this.dishes().filter((dish) => dish.category === category);
  }

  getAllDishes(): Dish[] {
    return this.dishes();
  }
}
