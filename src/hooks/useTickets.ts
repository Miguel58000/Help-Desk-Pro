import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Ticket } from '../types/ticket';
import { useOrg } from '../context/useOrg';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTranslation } from 'react-i18next';

const STORAGE_KEY = 'helpdesk_tickets';

export function useTickets() {
  const { t, i18n } = useTranslation();
  const { organizacionActual } = useOrg();

  const [allTickets, setAllTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allTickets));
  }, [allTickets]);

  const tickets = useMemo(() => {
    return allTickets.filter(
      t => (t.organizacion || '') === organizacionActual
    );
  }, [allTickets, organizacionActual]);

  const agregarTicket = (ticket: Omit<Ticket, 'organizacion'>) => {
    const nuevo = {
      ...ticket,
      organizacion: organizacionActual,
    } as Ticket;

    setAllTickets(prev => [nuevo, ...prev]);
  };

  const actualizarTicket = (id: string, updates: Partial<Ticket>) => {
    setAllTickets(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const exportarCSV = useCallback((ticketsToExport: Ticket[] = tickets) => {
    if (!ticketsToExport.length) return;

    const headers = [
      t('export.id'),
      t('export.field.title'),
      t('filter.area'),
      t('filter.priority'),
      t('filter.status'),
      t('export.date')
    ];

    const rows = ticketsToExport.map(ticketItem => [
      ticketItem.id,
      `"${(ticketItem.titulo || '').replace(/"/g, '""')}"`,
      ticketItem.area || '',
      t(`priority.${ticketItem.prioridad === 'Alta' ? 'high' : ticketItem.prioridad === 'Media' ? 'medium' : 'low'}`),
      ticketItem.estado === 'Abierto' ? t('status.open') : ticketItem.estado === 'En Progreso' ? t('status.inProgress') : t('status.closed'),
      new Date(ticketItem.fechaCreacion).toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US'),
    ]);

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'tickets-en-csv.csv';
    link.click();

    URL.revokeObjectURL(url);
  }, [tickets]);

  const exportarPDF = useCallback((ticketsToExport: Ticket[] = tickets) => {
    if (!ticketsToExport.length) return;

    const doc = new jsPDF();

    doc.text(t('detail.title'), 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [[
        t('export.id'),
        t('export.field.title'),
        t('filter.area'),
        t('filter.status')
      ]],
      body: ticketsToExport.map(ticketItem => [
        ticketItem.id,
        ticketItem.titulo || '',
        ticketItem.area || '',
        ticketItem.estado === 'Abierto' ? t('status.open') : ticketItem.estado === 'En Progreso' ? t('status.inProgress') : t('status.closed'),
      ]),
    });

    doc.save('tickets-en-pdf.pdf');
  }, [tickets]);

  return {
    tickets,
    agregarTicket,
    actualizarTicket,
    exportarCSV,
    exportarPDF,
  };
}