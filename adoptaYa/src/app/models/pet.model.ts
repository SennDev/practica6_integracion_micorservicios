export interface Mascota {
  id: number;
  nombre: string;
  especie: string;
  edad: number;
  tamano: 'Pequeño' | 'Mediano' | 'Grande';
  descripcion: string;
  imagen: string;
  requisitos: string;
}
