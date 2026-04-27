import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Collapse
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useTickets } from '../hooks/useTickets';
import { useOrg } from '../context/useOrg';
import TicketList from '../components/TicketList';
import { startOfDay, endOfDay } from 'date-fns';
import { useTranslation } from 'react-i18next';

export default function TicketsListPage() {
  const { t } = useTranslation();
  const { tickets, exportarCSV, exportarPDF } = useTickets();
  const { agentes } = useOrg();

  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [prioridadFilter, setPrioridadFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [agenteFilter, setAgenteFilter] = useState('');

  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  const areas = useMemo(() => [...new Set(tickets.map(t => t.area))], [tickets]);
  const sectores = useMemo(() => [...new Set(tickets.map(t => t.sector))], [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {

      if (search) {
        const s = search.toLowerCase();
        if (
          !t.titulo?.toLowerCase().includes(s) &&
          !t.descripcion?.toLowerCase().includes(s) &&
          !t.solicitante?.toLowerCase().includes(s)
        ) return false;
      }

      if (estadoFilter && t.estado !== estadoFilter) return false;
      if (prioridadFilter && t.prioridad !== prioridadFilter) return false;
      if (areaFilter && t.area !== areaFilter) return false;
      if (sectorFilter && t.sector !== sectorFilter) return false;
      if (agenteFilter && t.agenteId !== agenteFilter) return false;

      if (dateFrom || dateTo) {
        const d = new Date(t.fechaCreacion);
        if (dateFrom && d < startOfDay(dateFrom)) return false;
        if (dateTo && d > endOfDay(dateTo)) return false;
      }

      return true;
    });
  }, [
    tickets,
    search,
    estadoFilter,
    prioridadFilter,
    areaFilter,
    sectorFilter,
    agenteFilter,
    dateFrom,
    dateTo
  ]);

  const clearFilters = () => {
    setSearch('');
    setEstadoFilter('');
    setPrioridadFilter('');
    setAreaFilter('');
    setSectorFilter('');
    setAgenteFilter('');
    setDateFrom(null);
    setDateTo(null);
  };

  const filtrosActivos = Boolean(
    search ||
    estadoFilter ||
    prioridadFilter ||
    areaFilter ||
    sectorFilter ||
    agenteFilter ||
    dateFrom ||
    dateTo
  );

  const cantidadFiltros = [
    search,
    estadoFilter,
    prioridadFilter,
    areaFilter,
    sectorFilter,
    agenteFilter,
    dateFrom,
    dateTo
  ].filter(Boolean).length;

  return (
    <Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {t('tickets.title')}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>

          <Button
            variant="contained"
            onClick={() => exportarCSV(filteredTickets)}
            disabled={!filteredTickets.length}
            sx={{
              background: '#2e7d32 !important',
              color: '#ffffff !important',
              fontWeight: 700
            }}
          >
            {t('export.csv')}
          </Button>

          <Button
            variant="contained"
            onClick={() => exportarPDF(filteredTickets)}
            disabled={!filteredTickets.length}
            sx={{
              background: '#d32f2f !important',
              color: '#ffffff !important',
              fontWeight: 700
            }}
          >
            {t('export.pdf')}
          </Button>

          <Button
            variant="contained"
            onClick={() => setShowFilters(!showFilters)}
            sx={{
              fontWeight: 700,
              px: 3,
              borderRadius: 2,
              background: (filtrosActivos || showFilters) ? '#0052FF !important' : '#475569 !important',
              color: 'white !important',
              boxShadow: (filtrosActivos || showFilters) ? '0 4px 15px rgba(0, 82, 255, 0.4)' : 'none',
              '&:hover': {
                background: (filtrosActivos || showFilters) ? '#003eb3 !important' : '#334155 !important',
              },
            }}
          >
            {filtrosActivos ? `${t('dashboard.filters')} (${cantidadFiltros})` : t('dashboard.filters')}
          </Button>
        </Box>
      </Box>

      <Collapse in={showFilters}>
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 2,
            }}
          >

            <TextField
              label={t('dashboard.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              sx={{ gridColumn: { sm: '1 / -1', md: '1 / -1', lg: '1 / 3' } }}
            />

            <TextField select label={t('filter.status')} value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)} fullWidth>
              <MenuItem value="">{t('filter.all')}</MenuItem>
              <MenuItem value="Abierto">{t('status.open')}</MenuItem>
              <MenuItem value="En Progreso">{t('status.inProgress')}</MenuItem>
              <MenuItem value="Cerrado">{t('status.closed')}</MenuItem>
            </TextField>

            <TextField select label={t('filter.priority')} value={prioridadFilter} onChange={(e) => setPrioridadFilter(e.target.value)} fullWidth>
              <MenuItem value="">{t('filter.all')}</MenuItem>
              <MenuItem value="Alta">{t('priority.high')}</MenuItem>
              <MenuItem value="Media">{t('priority.medium')}</MenuItem>
              <MenuItem value="Baja">{t('priority.low')}</MenuItem>
            </TextField>

            <TextField select label={t('filter.area')} value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} fullWidth>
              <MenuItem value="">{t('filter.all')}</MenuItem>
              {areas.map(a => (
                <MenuItem key={a} value={a}>{a}</MenuItem>
              ))}
            </TextField>

            <TextField select label={t('filter.sector')} value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} fullWidth>
              <MenuItem value="">{t('filter.all')}</MenuItem>
              {sectores.map(s => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>

            <TextField select label={t('filter.agent')} value={agenteFilter} onChange={(e) => setAgenteFilter(e.target.value)} fullWidth>
              <MenuItem value="">{t('filter.all')}</MenuItem>
              {agentes.map(a => (
                <MenuItem key={a.id} value={a.id}>
                  {a.nombre}
                </MenuItem>
              ))}
            </TextField>

            <DatePicker
              label={t('filter.from')}
              value={dateFrom}
              onChange={(v) => setDateFrom(v)}
              slotProps={{ textField: { fullWidth: true } }}
            />

            <DatePicker
              label={t('filter.to')}
              value={dateTo}
              onChange={(v) => setDateTo(v)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={clearFilters}
              sx={{
                fontWeight: 700,
                height: 48,
                px: 4,
                borderRadius: 2
              }}
            >
              {t('dashboard.clearFilters')}
            </Button>
          </Box>
        </Paper>
      </Collapse>

      <Typography sx={{ mb: 2 }}>
        {t('dashboard.showing')} {filteredTickets.length} {t('dashboard.of')} {tickets.length}
      </Typography>

      <TicketList tickets={filteredTickets} />

    </Box>
  );
}