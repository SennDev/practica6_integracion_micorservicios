import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

interface Movie {
  id: number;
  name: string;
  genre: string;
  duration: number;
  poster: string;
  synopsis: string;
  trailer: string;
  base_price: string;
}

interface Showtime {
  id: number;
  movie_name: string;
  show_date: string;
  show_time: string;
  room: string;
}

interface SeatStatus {
  seat: string;
  occupied: boolean;
}

interface Ticket {
  id: number;
  seat: string;
  ticket_code: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, CurrencyPipe, DatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  movies: Movie[] = [];
  filteredMovies: Movie[] = [];
  showtimes: Showtime[] = [];
  seats: SeatStatus[] = [];
  selectedSeats: string[] = [];
  tickets: Ticket[] = [];

  selectedGenre = 'Todas';
  selectedMovie?: Movie;
  selectedShowtime?: Showtime;
  coupon = '';
  statusMessage = 'Selecciona una pelicula para iniciar tu compra.';
  contactMessage = '';
  loading = false;

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.loadMovies();
  }

  get genres(): string[] {
    return ['Todas', ...Array.from(new Set(this.movies.map((movie) => movie.genre)))];
  }

  get subtotal(): number {
    return this.selectedMovie ? this.selectedSeats.length * Number(this.selectedMovie.base_price) : 0;
  }

  loadMovies(): void {
    this.loading = true;
    this.http.get<Movie[]>('/api/movies').subscribe({
      next: (movies) => {
        this.movies = movies;
        this.applyGenreFilter();
        this.loading = false;
      },
      error: () => {
        this.statusMessage = 'No se pudo cargar la cartelera. Revisa que Docker este corriendo.';
        this.loading = false;
      }
    });
  }

  applyGenreFilter(): void {
    this.filteredMovies = this.selectedGenre === 'Todas'
      ? this.movies
      : this.movies.filter((movie) => movie.genre === this.selectedGenre);
  }

  selectMovie(movie: Movie): void {
    this.selectedMovie = movie;
    this.selectedShowtime = undefined;
    this.selectedSeats = [];
    this.seats = [];
    this.tickets = [];
    this.statusMessage = `Cargando funciones para ${movie.name}.`;

    this.http.get<Showtime[]>(`/api/showtimes?movieName=${encodeURIComponent(movie.name)}`).subscribe({
      next: (showtimes) => {
        this.showtimes = showtimes;
        this.statusMessage = showtimes.length
          ? 'Elige una funcion disponible.'
          : 'No hay funciones registradas para esta pelicula.';
      },
      error: () => {
        this.statusMessage = 'No se pudieron cargar las funciones.';
      }
    });
  }

  selectShowtime(showtime: Showtime): void {
    this.selectedShowtime = showtime;
    this.selectedSeats = [];
    this.tickets = [];
    this.statusMessage = 'Cargando asientos disponibles.';

    this.http.get<{ seats: SeatStatus[] }>(`/api/seats/availability/${showtime.id}`).subscribe({
      next: (response) => {
        this.seats = response.seats;
        this.statusMessage = 'Selecciona tus asientos.';
      },
      error: () => {
        this.statusMessage = 'No se pudo consultar la disponibilidad de asientos.';
      }
    });
  }

  toggleSeat(seat: SeatStatus): void {
    if (seat.occupied) return;
    this.selectedSeats = this.selectedSeats.includes(seat.seat)
      ? this.selectedSeats.filter((current) => current !== seat.seat)
      : [...this.selectedSeats, seat.seat];
  }

  confirmPurchase(): void {
    if (!this.selectedMovie || !this.selectedShowtime || this.selectedSeats.length === 0) {
      this.statusMessage = 'Selecciona pelicula, funcion y al menos un asiento.';
      return;
    }

    this.loading = true;
    const reservationBody = {
      showtime_id: this.selectedShowtime.id,
      movie_name: this.selectedMovie.name,
      show_date: this.selectedShowtime.show_date,
      show_time: this.selectedShowtime.show_time,
      seats: this.selectedSeats
    };

    const purchaseBody = {
      movie_name: this.selectedMovie.name,
      showtime_id: this.selectedShowtime.id,
      seats: this.selectedSeats,
      base_price: Number(this.selectedMovie.base_price),
      coupon: this.coupon
    };

    this.http.post('/api/seats/reservations', reservationBody).subscribe({
      next: () => {
        this.http.post<{ tickets: Ticket[] }>('/api/purchases', purchaseBody).subscribe({
          next: (response) => {
            this.tickets = response.tickets;
            this.statusMessage = 'Compra confirmada. Tus boletos fueron generados.';
            this.loading = false;
            this.selectedSeats = [];
            this.refreshSeats(this.selectedShowtime as Showtime);
          },
          error: () => {
            this.statusMessage = 'Se reservaron los asientos, pero fallo el registro de compra.';
            this.loading = false;
          }
        });
      },
      error: (error) => {
        const occupied = error.error?.occupied?.join(', ');
        this.statusMessage = occupied
          ? `Esos asientos ya se ocuparon: ${occupied}. Elige otros.`
          : 'No se pudo reservar. Intenta de nuevo.';
        this.loading = false;
        this.selectShowtime(this.selectedShowtime as Showtime);
      }
    });
  }

  private refreshSeats(showtime: Showtime): void {
    this.http.get<{ seats: SeatStatus[] }>(`/api/seats/availability/${showtime.id}`).subscribe({
      next: (response) => this.seats = response.seats
    });
  }

  validateCoupon(): void {
    if (!this.coupon.trim()) {
      this.statusMessage = 'Escribe un cupon. Prueba CINE10 o ESTUDIANTE15.';
      return;
    }

    this.http.get(`/api/purchases/coupons/${encodeURIComponent(this.coupon)}`).subscribe({
      next: () => this.statusMessage = 'Cupon valido. Se aplicara al confirmar la compra.',
      error: () => this.statusMessage = 'Cupon no valido.'
    });
  }

  sendContact(): void {
    this.contactMessage = 'Mensaje preparado. El apartado CinePlus no solicita microservicio de contacto, por eso queda como formulario visual.';
  }

  refreshAll(): void {
    forkJoin({
      movies: this.http.get<Movie[]>('/api/movies'),
      purchases: this.http.get('/api/purchases')
    }).subscribe({
      next: ({ movies }) => {
        this.movies = movies;
        this.applyGenreFilter();
        this.statusMessage = 'Datos actualizados desde los microservicios.';
      },
      error: () => this.statusMessage = 'No se pudo actualizar la informacion.'
    });
  }
}
