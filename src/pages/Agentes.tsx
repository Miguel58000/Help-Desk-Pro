import { useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ManageAgentsIcon from '@mui/icons-material/Group';
import InboxIcon from '@mui/icons-material/Inbox';
import { useTranslation } from 'react-i18next';
import { useOrg } from '../context/useOrg';
import type { Agente } from '../types';

export default function Agentes() {
  const { t } = useTranslation();
  const { agentes, agregarAgente, eliminarAgente, organizacionActual } = useOrg();

  const [openDialog, setOpenDialog] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const handleAgregar = () => {
    setError('');

    if (!nombre.trim()) {
      setError(t('agents.errorName'));
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError(t('agents.errorEmail'));
      return;
    }

    agregarAgente({ nombre: nombre.trim(), email: email.trim() });
    setNombre('');
    setEmail('');
    setOpenDialog(false);
    setSnackbar({ open: true, message: t('agents.successAdd') });
  };

  const handleEliminar = (id: string) => {
    eliminarAgente(id);
    setSnackbar({ open: true, message: t('agents.successDelete') });
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ManageAgentsIcon />
          {t('agents.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          disabled={!organizacionActual}
        >
          {t('agents.add')}
        </Button>
      </Box>

      {agentes.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center', bgcolor: 'transparent', border: '1px dashed', borderColor: 'divider' }}>
          <Box sx={{ color: 'text.secondary', mb: 2 }}>
            <InboxIcon sx={{ fontSize: 64, opacity: 0.5 }} />
          </Box>
          <Typography variant="h6" color="text.secondary">
            {t('agents.noAgents')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('agents.addFirst')}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('agents.name')}</TableCell>
                <TableCell>{t('agents.email')}</TableCell>
                <TableCell align="right">{t('agents.delete')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agentes.map((agente: Agente) => (
                <TableRow key={agente.id} hover>
                  <TableCell>{agente.nombre}</TableCell>
                  <TableCell>{agente.email}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="error"
                      onClick={() => handleEliminar(agente.id)}
                      title={t('agents.confirmDelete')}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{t('agents.add')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('agents.name')}
            fullWidth
            variant="outlined"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label={t('agents.email')}
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>{t('create.cancel')}</Button>
          <Button variant="contained" onClick={handleAgregar}>{t('agents.add')}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
