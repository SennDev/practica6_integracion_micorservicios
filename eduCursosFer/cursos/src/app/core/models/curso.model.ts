export interface ModuloCurso {
  titulo: string;
  descripcion: string;
}

export interface Curso {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  nivel: string;
  duracion: string;
  modalidad: string;
  imagenUrl: string;
  temario: ModuloCurso[];
}

export interface FiltrosCurso {
  search?: string;
  category?: string;
}
