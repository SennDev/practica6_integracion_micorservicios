export interface MensajeContacto {
  id: number;
  nombre: string;
  correo: string;
  mensaje: string;
  fechaRegistro: string;
}

export interface CrearMensajeContactoRequest {
  nombre: string;
  correo: string;
  mensaje: string;
}
