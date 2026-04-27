import { useState, useEffect, type ReactNode, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { OrgContext, type OrgContextType, type OrganizacionInfo } from './OrgContextDef';
import type { Agente } from '../types';

const AGENTES_KEY = 'helpdesk_agents';
const ORG_KEY = 'helpdesk_orgs_v2';
const AUTH_KEY = 'helpdesk_auth';

const migrarOrganizaciones = (): OrganizacionInfo[] => {
  const guardadas = localStorage.getItem('helpdesk_orgs');
  if (!guardadas) return [];

  try {
    const parsed = JSON.parse(guardadas);
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
      const orgs = parsed.map((nombre: string) => ({
        nombre,
        email: `${nombre.toLowerCase().replace(/\s/g, '')}@local`,
        password: 'password',
      }));
      localStorage.setItem(ORG_KEY, JSON.stringify(orgs));
      localStorage.removeItem('helpdesk_orgs');
      return orgs;
    } else if (Array.isArray(parsed)) {
      return parsed as OrganizacionInfo[];
    }
  } catch (e) {
    console.error('Error migrando organizaciones', e);
  }
  return [];
};

export function OrgProvider({ children }: { children: ReactNode }) {
  const [organizaciones, setOrganizaciones] = useState<OrganizacionInfo[]>(() => {
    const guardadas = localStorage.getItem(ORG_KEY);
    if (guardadas) {
      try {
        return JSON.parse(guardadas) as OrganizacionInfo[];
      } catch {
        return migrarOrganizaciones();
      }
    }
    return migrarOrganizaciones();
  });

  const [authOrg, setAuthOrg] = useState<string | null>(() => {
    return localStorage.getItem(AUTH_KEY) || null;
  });

  const [agentes, setAgentes] = useState<Agente[]>(() => {
    const guardados = localStorage.getItem(AGENTES_KEY);
    return guardados ? JSON.parse(guardados) : [];
  });

  useEffect(() => {
    localStorage.setItem(ORG_KEY, JSON.stringify(organizaciones));
  }, [organizaciones]);

  useEffect(() => {
    localStorage.setItem(AGENTES_KEY, JSON.stringify(agentes));
  }, [agentes]);

  useEffect(() => {
    if (authOrg) {
      localStorage.setItem(AUTH_KEY, authOrg);
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [authOrg]);

  const organizacionActual = authOrg || '';

  const login = (email: string, password: string): boolean => {
    const org = organizaciones.find(o => o.email === email && o.password === password);
    if (org) {
      setAuthOrg(org.nombre);
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuthOrg(null);
  };

  const agregarOrganizacion = (org: OrganizacionInfo): boolean => {
    const nombreLimpio = org.nombre.trim();
    if (!nombreLimpio) return false;
    if (organizaciones.some(o => o.nombre === nombreLimpio)) {
      return false;
    }
    if (organizaciones.some(o => o.email === org.email)) {
      return false;
    }
    setOrganizaciones(prev => [...prev, { ...org, nombre: nombreLimpio }]);
    setAuthOrg(nombreLimpio);
    return true;
  };

  const agregarAgente = (datos: Omit<Agente, 'id' | 'organizacion'>) => {
    if (!organizacionActual) return;
    const nuevoAgente: Agente = {
      ...datos,
      id: uuidv4(),
      organizacion: organizacionActual,
    };
    setAgentes(prev => [...prev, nuevoAgente]);
  };

  const eliminarAgente = (id: string) => {
    setAgentes(prev => prev.filter(a => a.id !== id));
  };

  const agentesPorOrg = useMemo(() => {
    return agentes.filter(a => a.organizacion === organizacionActual);
  }, [agentes, organizacionActual]);

  const value: OrgContextType = {
    organizacionActual,
    organizaciones,
    agregarOrganizacion,
    agentes: agentesPorOrg,
    agregarAgente,
    eliminarAgente,
    isAuthenticated: !!authOrg,
    login,
    logout,
  };

  return (
    <OrgContext.Provider value={value}>
      {children}
    </OrgContext.Provider>
  );
}
