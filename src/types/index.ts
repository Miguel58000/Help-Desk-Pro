export type PrioridadTicket = 'Baja' | 'Media' | 'Alta';
export type EstadoTicket = 'Abierto' | 'En Progreso' | 'Cerrado';

export interface Agente {
  id: string;
  nombre: string;
  email: string;
  organizacion: string;
}

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
}

export interface EstadisticasArea {
  area: string;
  count: number;
}

export interface EstadisticasSector {
  sector: string;
  count: number;
}

export interface EstadisticasPrioridad {
  prioridad: PrioridadTicket;
  count: number;
}

export interface EstadisticasEstado {
  estado: EstadoTicket;
  count: number;
}

export interface EstadisticasAgente {
  agenteId: string;
  nombre: string;
  count: number;
}
