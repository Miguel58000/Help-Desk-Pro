import { createContext } from 'react';
import type { Agente } from '../types';

export interface OrganizacionInfo {
  nombre: string;
  email: string;
  password: string;
}

export interface OrgContextType {
  organizacionActual: string;
  organizaciones: OrganizacionInfo[];
  agregarOrganizacion: (org: OrganizacionInfo) => boolean;
  agentes: Agente[];
  agregarAgente: (agente: Omit<Agente, 'id' | 'organizacion'>) => void;
  eliminarAgente: (id: string) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

export const OrgContext = createContext<OrgContextType | undefined>(undefined);
