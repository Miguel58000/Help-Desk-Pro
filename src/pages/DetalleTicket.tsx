import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Divider, Button,
  Select, MenuItem, FormControl, InputLabel,
  TextField, Chip, Grid
} from '@mui/material';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'react-i18next';

import { useTickets } from '../hooks/useTickets';
import { useOrg } from '../context/useOrg';
import type { EstadoTicket, Ticket } from '../types/ticket';

export default function DetalleTicket() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dateLocale = i18n.language === 'es' ? es : enUS;

  const { tickets, actualizarTicket } = useTickets();
  const { agentes } = useOrg();

  const ticket = tickets.find(t => t.id === id);

  const [estado, setEstado] = useState<EstadoTicket>(ticket?.estado || 'Abierto');
  const [solucion, setSolucion] = useState(ticket?.solucion || '');
  const [agenteId, setAgenteId] = useState<string>(ticket?.agenteId || '');

  if (!ticket) return <Typography>{t('detail.notFound')}</Typography>;

  const getEstadoStyles = () => {
    switch (ticket.estado) {
      case 'Cerrado':
        return { backgroundColor: '#22c55e', color: '#fff' };
      case 'En Progreso':
        return { backgroundColor: '#a855f7', color: '#fff' };
      default:
        return { backgroundColor: '#3b82f6', color: '#fff' };
    }
  };

  const handleGuardarCambios = () => {
    const updates: Partial<Ticket> = {
      estado,
      agenteId: agenteId || null
    };

    if (estado === 'Cerrado') {
      updates.solucion = solucion;
      if (ticket.estado !== 'Cerrado') {
        updates.fechaCierre = Date.now();
      }
    } else {
      updates.solucion = '';
      updates.fechaCierre = null;
    }

    actualizarTicket(ticket.id, updates);
    navigate('/');
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>

      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 3 }}
      >
        {t('detail.back')}
      </Button>

      <Paper sx={{ p: 4 }}>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h4">{ticket.titulo}</Typography>

          <Chip
            label={ticket.estado === 'Abierto' ? t('status.open') : ticket.estado === 'En Progreso' ? t('status.inProgress') : t('status.closed')}
            sx={{
              fontWeight: 'bold',
              ...getEstadoStyles()
            }}
          />
        </Box>

        <Grid container spacing={2}>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle2">{t('detail.area')}</Typography>
            <Typography>{ticket.area}</Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle2">{t('detail.sector')}</Typography>
            <Typography>{ticket.sector}</Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle2">{t('create.priority')}</Typography>
            <Typography>{ticket.prioridad === 'Alta' ? t('priority.high') : ticket.prioridad === 'Media' ? t('priority.medium') : t('priority.low')}</Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2">{t('detail.caller')}</Typography>
            <Typography>{ticket.solicitante || '-'}</Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2">{t('filter.agent')}</Typography>
            <Typography>
              {agentes.find(a => a.id === ticket.agenteId)?.nombre || '-'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2">{t('detail.creationDate')}</Typography>
            <Typography>
              {format(ticket.fechaCreacion, "PPpp", { locale: dateLocale })}
            </Typography>
          </Grid>

          {ticket.fechaCierre && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2">{t('detail.closeDate')}</Typography>
              <Typography>
                {format(ticket.fechaCierre, "PPpp", { locale: dateLocale })}
              </Typography>
            </Grid>
          )}

        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle2">{t('create.description')}</Typography>
        <Typography sx={{ mb: 3 }}>{ticket.descripcion}</Typography>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>{t('filter.status')}</InputLabel>
              <Select
                value={estado}
                label={t('filter.status')}
                onChange={(e) => setEstado(e.target.value as EstadoTicket)}
              >
                <MenuItem value="Abierto">{t('status.open')}</MenuItem>
                <MenuItem value="En Progreso">{t('status.inProgress')}</MenuItem>
                <MenuItem value="Cerrado">{t('status.closed')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>{t('filter.agent')}</InputLabel>
              <Select
                value={agenteId}
                label={t('filter.agent')}
                onChange={(e) => setAgenteId(e.target.value)}
              >
                <MenuItem value="">{t('filter.all')}</MenuItem>
                {agentes.map(a => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {estado === 'Cerrado' && (
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={t('detail.solution')}
                multiline
                rows={3}
                value={solucion}
                onChange={(e) => setSolucion(e.target.value)}
              />
            </Grid>
          )}

          <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/')}>
              {t('create.cancel')}
            </Button>

            <Button
              variant="contained"
              onClick={handleGuardarCambios}
              disabled={estado === 'Cerrado' && !solucion.trim()}
            >
              {t('detail.save')}
            </Button>
          </Grid>

        </Grid>

      </Paper>
    </Box>
  );
}