export type PrioridadTicket = 'Baja' | 'Media' | 'Alta';
export type EstadoTicket = 'Abierto' | 'En Progreso' | 'Cerrado';

export interface Ticket {
  id: string;
  titulo: string;
  descripcion: string;
  area: string;
  sector: string;
  prioridad: PrioridadTicket;
  estado: EstadoTicket;
  fechaCreacion: number;
  fechaCierre?: number | null;
  solucion?: string;
  organizacion: string;
  agenteId?: string | null;
  solicitante?: string;
}

export interface Agente {
  id: string;
  nombre: string;
  email: string;
  organizacion: string;
}
