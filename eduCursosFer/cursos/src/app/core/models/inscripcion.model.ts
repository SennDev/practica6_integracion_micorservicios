export type EstadoInscripcion = 'Registrado' | 'Cancelada';

export interface Inscripcion {
  id: number;
  codigo: string;
  nombreEstudiante: string;
  email: string;
  cursoId: number;
  cursoNombre: string;
  modalidad: string;
  comentarios: string;
  estado: EstadoInscripcion;
  fechaRegistro: string;
}

export interface CrearInscripcionRequest {
  nombreEstudiante: string;
  email: string;
  cursoId: number;
  modalidad: string;
  comentarios: string;
}

export interface EstadisticaInscripciones {
  cursoNombre: string;
  totalActivas: number;
}
