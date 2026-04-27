import { Box, Paper, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import TicketCard from './TicketCard';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { Ticket } from '../types/ticket';

export default function TicketList({ tickets }: { tickets: Ticket[] }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (tickets.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 6 },
          textAlign: 'center',
          borderRadius: 4,
          border: '2px dashed',
          borderColor: 'divider',
          bgcolor: 'rgba(37, 99, 235, 0.02)',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'rgba(37, 99, 235, 0.04)',
            transform: { xs: 'none', sm: 'translateY(-4px)' },
            boxShadow: { xs: 'none', sm: '0 12px 30px -8px rgba(37, 99, 235, 0.1)' },
          },
        }}
        onClick={() => navigate('/nuevo')}
      >
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 1.5, sm: 2 },
        }}>
          <Box sx={{
            width: { xs: 64, sm: 96 },
            height: { xs: 64, sm: 96 },
            borderRadius: '50%',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
            boxShadow: { xs: '0 6px 16px rgba(37, 99, 235, 0.2)', sm: '0 8px 24px rgba(37, 99, 235, 0.25)' },
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: { xs: 'none', sm: 'scale(1.05)' },
            },
          }}>
            <InboxIcon sx={{ fontSize: { xs: 32, sm: 56 }, color: 'white', opacity: 0.9 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {tickets.length === 0 && t('dashboard.noTickets')}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: { xs: '100%', sm: '500px' }, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            {tickets.length === 0 && t('dashboard.noTicketsDesc')}
          </Typography>
          <Box sx={{
            mt: { xs: 1, sm: 2 },
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'primary.main',
            fontWeight: 600,
            fontSize: { xs: '0.85rem', sm: '0.95rem' },
          }}>
            <AddCircleIcon />
            {t('dashboard.createFirst')}
          </Box>
        </Box>
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: { xs: 2, sm: 3, md: 3 },
        mt: 1,
      }}
    >
      {tickets.map((ticket, index) => (
        <Box
          key={ticket.id}
          sx={{
            flex: '1 1 300px',
            minWidth: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.333% - 16px)' },
            animation: 'fadeInUp 0.5s ease-out',
            animationFillMode: 'both',
            animationDelay: `${index * 0.05}s`,
          }}
        >
          <TicketCard ticket={ticket} />
        </Box>
      ))}
    </Box>
  );
}