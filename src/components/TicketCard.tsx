import { Card, CardContent, Typography, Box, Chip, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import type { Ticket, PrioridadTicket, EstadoTicket } from '../types/ticket';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useTranslation } from 'react-i18next';
import { useOrg } from '../context/useOrg';
import { useTheme, alpha } from '@mui/material/styles';

interface Props {
  ticket: Ticket;
}

const getPrioridadColor = (prioridad: PrioridadTicket) => {
  switch (prioridad) {
    case 'Alta': return '#ef4444';
    case 'Media': return '#f59e0b';
    case 'Baja': return '#10b981';
    default: return '#64748b';
  }
};

const getEstadoColor = (estado: EstadoTicket) => {
  switch (estado) {
    case 'Abierto': return { main: '#3b82f6', light: '#dbeafe', text: '#1d4ed8' };
    case 'En Progreso': return { main: '#8b5cf6', light: '#ede9fe', text: '#7c3aed' };
    case 'Cerrado': return { main: '#10b981', light: '#d1fae5', text: '#059669' };
    default: return { main: '#64748b', light: '#f1f5f9', text: '#475569' };
  }
};

export default function TicketCard({ ticket }: Props) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const estadoColors = getEstadoColor(ticket.estado);
  const prioridadColor = getPrioridadColor(ticket.prioridad);
  const dateLocale = i18n.language === 'es' ? es : enUS;
  const { agentes } = useOrg();

  const assignedAgent = ticket.agenteId
    ? agentes.find(a => a.id === ticket.agenteId)
    : null;

  const translateStatus = (s: string) => {
    if (s === 'Abierto') return t('status.open');
    if (s === 'En Progreso') return t('status.inProgress');
    if (s === 'Cerrado') return t('status.closed');
    return s;
  };

  const translatePriority = (p: string) => {
    if (p === 'Alta') return t('priority.high');
    if (p === 'Media') return t('priority.medium');
    if (p === 'Baja') return t('priority.low');
    return p;
  };

  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        border: `1px solid ${estadoColors.light}30`,
        bgcolor: 'background.paper',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          bgcolor: estadoColors.main,
          transition: 'height 0.3s ease',
        },
        '&:hover': {
          transform: { xs: 'none', sm: 'translateY(-8px) scale(1.01)' },
          boxShadow: { xs: 'none', sm: `0 20px 40px -12px ${estadoColors.light}40, 0 8px 16px -8px rgba(0,0,0,0.1)` },
          borderColor: { xs: 'transparent', sm: estadoColors.main },
          '&::before': {
            height: { xs: 4, sm: 6 },
          },
        },
      }}
      onClick={() => navigate(`/ticket/${ticket.id}`)}
    >
      <CardContent sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 1.5, sm: 2.5 },
        position: 'relative',
        zIndex: 1,
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 2,
          gap: 1,
        }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1rem', sm: '1.1rem' },
              lineHeight: 1.3,
              flex: 1,
              pr: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {ticket.titulo}
          </Typography>
          <Chip
            label={translateStatus(ticket.estado)}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              px: 1,
              bgcolor: theme.palette.mode === 'dark' ? estadoColors.main : `${estadoColors.light}50`,
              color: theme.palette.mode === 'dark' ? '#fff' : estadoColors.text,
              border: `1px solid ${estadoColors.light}`,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          />
        </Box>

        <Box sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          mb: { xs: 2, sm: 2.5 },
        }}>
          <Chip
            size="small"
            label={`${t('filter.priority')}: ${translatePriority(ticket.prioridad)}`}
            sx={{
              fontWeight: 600,
              fontSize: '0.75rem',
              bgcolor: `${prioridadColor}15`,
              color: prioridadColor,
              border: `1px solid ${prioridadColor}30`,
              '&:hover': {
                bgcolor: `${prioridadColor}25`,
              },
            }}
          />
          <Chip
            size="small"
            label={ticket.area}
            sx={{
              fontWeight: 500,
              fontSize: '0.75rem',
              bgcolor: 'rgba(37, 99, 235, 0.08)',
              color: '#2563eb',
              border: '1px solid rgba(37, 99, 235, 0.2)',
            }}
          />
          <Chip
            size="small"
            label={ticket.sector}
            sx={{
              fontWeight: 500,
              fontSize: '0.75rem',
              bgcolor: 'rgba(124, 58, 237, 0.08)',
              color: '#7c3aed',
              border: '1px solid rgba(124, 58, 237, 0.2)',
            }}
          />
          {ticket.solicitante && (
            <Chip
              size="small"
              icon={<Avatar sx={{ width: 14, height: 14, fontSize: '0.5rem', bgcolor: 'secondary.main' }}>
                {ticket.solicitante.charAt(0).toUpperCase()}
              </Avatar>}
              label={ticket.solicitante.length > 10 ? ticket.solicitante.substring(0, 9) + '...' : ticket.solicitante}
              sx={{
                fontWeight: 500,
                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                bgcolor: 'rgba(139, 92, 246, 0.08)',
                color: '#8b5cf6',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                height: { xs: 22, sm: 24 },
                maxWidth: { xs: 100, sm: 140 },
                overflow: 'hidden',
                '& .MuiChip-label': { px: 0.5, overflow: 'hidden', textOverflow: 'ellipsis' },
              }}
            />
          )}

          <Chip
            size="small"
            icon={assignedAgent ? (
              <Avatar sx={{ width: 14, height: 14, fontSize: '0.5rem', bgcolor: theme.palette.info.dark }}>
                {assignedAgent.nombre.charAt(0).toUpperCase()}
              </Avatar>
            ) : (
              <Avatar sx={{ width: 14, height: 14, fontSize: '0.5rem', bgcolor: theme.palette.action.disabledBackground }}>
                ?
              </Avatar>
            )}
            label={assignedAgent ? assignedAgent.nombre : t('common.unassigned')}
            sx={{
              fontWeight: 500,
              fontSize: { xs: '0.65rem', sm: '0.75rem' },
              bgcolor: assignedAgent ? alpha(theme.palette.info.main, 0.08) : alpha(theme.palette.action.disabledBackground, 0.5),
              color: assignedAgent ? theme.palette.info.main : theme.palette.text.secondary,
              border: `1px solid ${assignedAgent ? alpha(theme.palette.info.main, 0.2) : alpha(theme.palette.action.disabledBackground, 0.8)}`,
              height: { xs: 22, sm: 24 },
              maxWidth: { xs: 100, sm: 140 },
              overflow: 'hidden',
              '& .MuiChip-label': { px: 0.5, overflow: 'hidden', textOverflow: 'ellipsis' },
            }}
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pt: 2,
          borderTop: '1px solid rgba(226, 232, 240, 0.6)',
          color: 'text.secondary',
        }}>
          <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
          <Typography variant="caption" color="text.secondary">
            {formatDistanceToNow(new Date(ticket.fechaCreacion), {
              addSuffix: true,
              locale: dateLocale,
            })}
            <Box component="span" sx={{ mx: 0.5 }}>•</Box>
            {format(ticket.fechaCreacion, "d MMM yyyy, HH:mm", { locale: dateLocale })}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
