import { useState, useEffect, useCallback } from 'react';
import type { Ticket } from '../types/ticket';
import { useOrg } from '../context/useOrg';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTranslation } from 'react-i18next';
import { db } from '../lib/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore';

export function useTickets() {
  const { t, i18n } = useTranslation();
  const { organizacionActual } = useOrg();
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    if (!organizacionActual) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTickets([]);
      return;
    }

    const q = query(
      collection(db, 'tickets'),
      where('organizacion', '==', organizacionActual),
      orderBy('fechaCreacion', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Ticket[];
      setTickets(docs);
    }, (error) => {
      console.error('Error fetching tickets:', error);
    });

    return () => unsubscribe();
  }, [organizacionActual]);

  const agregarTicket = async (ticket: Omit<Ticket, 'organizacion' | 'id'>) => {
    if (!organizacionActual) throw new Error('No organization selected');
    await addDoc(collection(db, 'tickets'), {
      ...ticket,
      organizacion: organizacionActual,
    });
  };

  const actualizarTicket = async (id: string, updates: Partial<Ticket>) => {
    const ticketRef = doc(db, 'tickets', id);
    await updateDoc(ticketRef, updates);
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
  }, [tickets, t, i18n]);

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
  }, [tickets, t]);

  return {
    tickets,
    agregarTicket,
    actualizarTicket,
    exportarCSV,
    exportarPDF,
  };
}
