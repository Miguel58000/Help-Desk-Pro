import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, TextField, MenuItem, Button,
  Select, FormControl, InputLabel, Grid, Stepper, Step, StepLabel,
  Divider, Alert, Chip, Avatar, Checkbox, FormControlLabel
} from '@mui/material';

import { useTickets } from '../hooks/useTickets';
import { useInventory } from '../hooks/useInventory';
import { useOrg } from '../context/useOrg';
import { useTranslation } from 'react-i18next';
import type { Ticket, PrioridadTicket, Agente, Producto } from '../types/ticket';

const AREAS_PREDEFINIDAS = ['Hardware', 'Software', 'Redes', 'Otro'];
const SECTORES_PREDEFINIDOS = ['Ventas', 'Administración', 'Soporte', 'TI', 'Marketing', 'Otro'];

export default function CrearTicket() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { agregarTicket, tickets } = useTickets();
  const { agentes } = useOrg();
  const { productos, disminuirStock } = useInventory();

  const agentesDisponibles = agentes.filter((a): a is Agente & { id: string } => !!a.id);

  const areasDisponibles = useMemo(() => {
    const customAreas = tickets.map(t => t.area).filter(a => !AREAS_PREDEFINIDAS.includes(a));
    const uniqueCustomAreas = Array.from(new Set(customAreas));
    const predefinedWithoutOtro = AREAS_PREDEFINIDAS.filter(a => a !== 'Otro');
    return [...predefinedWithoutOtro, ...uniqueCustomAreas, 'Otro'];
  }, [tickets]);

  const sectoresDisponibles = useMemo(() => {
    const customSectores = tickets.map(t => t.sector).filter(s => !SECTORES_PREDEFINIDOS.includes(s));
    const uniqueCustomSectores = Array.from(new Set(customSectores));
    const predefinedWithoutOtro = SECTORES_PREDEFINIDOS.filter(s => s !== 'Otro');
    return [...predefinedWithoutOtro, ...uniqueCustomSectores, 'Otro'];
  }, [tickets]);

  const [activeStep, setActiveStep] = useState(0);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const [areaSelect, setAreaSelect] = useState('');
  const [areaCustom, setAreaCustom] = useState('');

  const [sectorSelect, setSectorSelect] = useState('');
  const [sectorCustom, setSectorCustom] = useState('');

  const [prioridad, setPrioridad] = useState<PrioridadTicket>('Media');
  const [agenteId, setAgenteId] = useState<string>('');
  const [solicitante, setSolicitante] = useState('');

  const [usarMaterial, setUsarMaterial] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [cantidadUsada, setCantidadUsada] = useState(1);

  const [error, setError] = useState('');

  const getFinalArea = () => areaSelect === 'Otro' ? areaCustom.trim() : areaSelect;
  const getFinalSector = () => sectorSelect === 'Otro' ? sectorCustom.trim() : sectorSelect;

  const steps = [
    t('create.problemTitle'),
    t('create.description'),
    t('create.area') + ' / ' + t('create.sector'),
    t('create.priority'),
    t('agents.title'),
    t('nav.stock'),
  ];

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return titulo.trim().length >= 5;
      case 1:
        return descripcion.trim().length >= 10;
      case 2: {
        const area = getFinalArea();
        const sector = getFinalSector();
        return area && sector;
      }
      case 3:
        return true;
      case 4:
        return true;
      case 5:
        if (usarMaterial) {
          return productoSeleccionado !== null && cantidadUsada > 0 && cantidadUsada <= productoSeleccionado.cantidad;
        }
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (activeStep === 1) {
      if (descripcion.trim().length < 10) {
        setError(t('create.errorDescription'));
        return;
      }
    }
    if (activeStep === 2) {
      const area = getFinalArea();
      const sector = getFinalSector();
      if (!area || !sector) {
        setError(t('create.errorAreaSector'));
        return;
      }
    }
    setError('');
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const area = getFinalArea();
    const sector = getFinalSector();

    // Validate stock availability
    if (usarMaterial && productoSeleccionado) {
      if (cantidadUsada > productoSeleccionado.cantidad) {
        setError('Stock insuficiente para el producto seleccionado');
        return;
      }
    }

    if (!titulo || !descripcion || !area || !sector) {
      setError(t('create.required'));
      return;
    }

      // Build ticket data, omitting undefined fields
      const nuevoTicket: Omit<Ticket, 'organizacion' | 'id'> = {
        titulo,
        descripcion,
        area,
        sector,
        prioridad,
        estado: 'Abierto',
        fechaCreacion: Date.now(),
        agenteId: agenteId || null,
      };
     
     if (solicitante.trim()) {
       nuevoTicket.solicitante = solicitante;
     }
     
     if (usarMaterial && productoSeleccionado) {
       nuevoTicket.productosUsados = [{
         productoId: productoSeleccionado.id,
         cantidad: cantidadUsada,
         productoNombre: productoSeleccionado.nombre,
       }];
     }

     try {
       // Deduct stock if material was used
       if (usarMaterial && productoSeleccionado) {
         await disminuirStock(productoSeleccionado.id, cantidadUsada);
       }

       await agregarTicket(nuevoTicket);
      navigate('/');
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError('Error al crear ticket');
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ py: 2 }}>
            <TextField
              fullWidth
              label={t('create.problemTitle')}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder={t('create.titlePlaceholder')}
              multiline
              rows={3}
              helperText={`${titulo.length}/50 ${t('create.maxChars')}`}
              slotProps={{
                input: {
                  sx: {
                    bgcolor: 'background.paper',
                  }
                }
              }}
              autoFocus
            />
            <TextField
              fullWidth
              label={t('create.caller')}
              value={solicitante}
              onChange={(e) => setSolicitante(e.target.value)}
              placeholder={t('create.callerPlaceholder')}
              sx={{ mt: 2 }}
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ py: 2 }}>
            <TextField
              fullWidth
              label={t('create.description')}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder={t('create.descriptionPlaceholder')}
              multiline
              rows={6}
              helperText={t('create.descriptionHelp')}
              slotProps={{
                input: {
                  sx: {
                    bgcolor: 'background.paper',
                  }
                }
              }}
            />
          </Box>
        );
      case 2:
        return (
          <Box sx={{ py: 2 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>{t('create.area')}</InputLabel>
                  <Select
                    value={areaSelect}
                    label={t('create.area')}
                    onChange={(e) => setAreaSelect(e.target.value as string)}
                    MenuProps={{ sx: { maxHeight: 200 } }}
                  >
                    {areasDisponibles.map(a => (
                      <MenuItem key={a} value={a}>{a}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                {areaSelect === 'Otro' ? (
                  <TextField
                    fullWidth
                    label={t('create.specifyArea')}
                    value={areaCustom}
                    onChange={(e) => setAreaCustom(e.target.value)}
                    required
                  />
                ) : (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'success.main',
                    flexDirection: 'column',
                    gap: 1
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('create.selectedArea')}:
                    </Typography>
                    <Chip
                      label={areaSelect || t('filter.all')}
                      color="primary"
                      size="medium"
                      sx={{ fontSize: '1rem', py: 2 }}
                    />
                  </Box>
                )}
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>{t('create.sector')}</InputLabel>
                  <Select
                    value={sectorSelect}
                    label={t('create.sector')}
                    onChange={(e) => setSectorSelect(e.target.value as string)}
                    MenuProps={{ sx: { maxHeight: 200 } }}
                  >
                    {sectoresDisponibles.map(s => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                {sectorSelect === 'Otro' ? (
                  <TextField
                    fullWidth
                    label={t('create.specifySector')}
                    value={sectorCustom}
                    onChange={(e) => setSectorCustom(e.target.value)}
                    required
                  />
                ) : (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'success.main',
                    flexDirection: 'column',
                    gap: 1
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('create.selectedSector')}:
                    </Typography>
                    <Chip
                      label={sectorSelect || t('filter.all')}
                      color="secondary"
                      size="medium"
                      sx={{ fontSize: '1rem', py: 2 }}
                    />
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        );
       case 3:
         return (
           <Box sx={{ py: 2 }}>
             <FormControl fullWidth>
               <InputLabel>{t('create.priority')}</InputLabel>
               <Select
                 value={prioridad}
                 label={t('create.priority')}
                 onChange={(e) => setPrioridad(e.target.value as PrioridadTicket)}
                 sx={{ fontSize: '1.1rem' }}
               >
                 <MenuItem value="Baja">
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                     <Chip label={t('priority.low')} color="success" size="small" sx={{ fontWeight: 'bold' }} />
                     <span>{t('priority.low')} - {t('priority.lowDesc')}</span>
                   </Box>
                 </MenuItem>
                 <MenuItem value="Media">
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                     <Chip label={t('priority.medium')} color="warning" size="small" sx={{ fontWeight: 'bold' }} />
                     <span>{t('priority.medium')} - {t('priority.mediumDesc')}</span>
                   </Box>
                 </MenuItem>
                 <MenuItem value="Alta">
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                     <Chip label={t('priority.high')} color="error" size="small" sx={{ fontWeight: 'bold' }} />
                     <span>{t('priority.high')} - {t('priority.highDesc')}</span>
                   </Box>
                 </MenuItem>
               </Select>
             </FormControl>
             <Box sx={{ mt: 3 }}>
               <Typography variant="body2" color="text.secondary">
                 {prioridad === 'Baja' && t('priority.lowLongDesc')}
                 {prioridad === 'Media' && t('priority.mediumLongDesc')}
                 {prioridad === 'Alta' && t('priority.highLongDesc')}
               </Typography>
             </Box>
           </Box>
         );
      case 4:
        return (
          <Box sx={{ py: 2 }}>
            <FormControl fullWidth>
              <InputLabel>{t('filter.agent')}</InputLabel>
              <Select
                value={agenteId}
                label={t('filter.agent')}
                onChange={(e) => setAgenteId(e.target.value as string)}
              >
                <MenuItem value="">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>⚪</span>
                    {t('filter.all')}
                  </Box>
                </MenuItem>
                {agentesDisponibles.map(agente => (
                  <MenuItem key={agente.id} value={agente.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        {agente.nombre.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body1">{agente.nombre}</Typography>
                        <Typography variant="body2" color="text.secondary">{agente.email}</Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {agentesDisponibles.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                {t('agents.noAgents')}. {t('create.noAgentsInfo') || ''}
              </Alert>
            )}
          </Box>
        );
      case 5:
        return (
          <Box sx={{ py: 2 }}>
            <FormControlLabel
              control={<Checkbox checked={usarMaterial} onChange={(e) => setUsarMaterial(e.target.checked)} />}
              label={t('stock.addMaterial') || 'Usar material / inventario'}
            />
            {usarMaterial && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <FormControl fullWidth>
                    <InputLabel>{t('stock.select') || 'Seleccionar producto'}</InputLabel>
                    <Select
                      value={productoSeleccionado?.id || ''}
                      label={t('stock.select') || 'Seleccionar producto'}
                      onChange={(e) => {
                        const prod = productos.find(p => p.id === e.target.value);
                        setProductoSeleccionado(prod || null);
                        setCantidadUsada(1);
                      }}
                    >
                      {productos.map(p => (
                        <MenuItem 
                          key={p.id} 
                          value={p.id}
                          disabled={p.cantidad === 0}
                        >
                          {p.nombre} ({p.cantidad} disp.)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Cantidad"
                    value={cantidadUsada}
                    onChange={(e) => setCantidadUsada(Math.max(1, Number(e.target.value)))}
                  />
                </Grid>
                {productoSeleccionado && cantidadUsada > productoSeleccionado.cantidad && (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="error">{t('stock.insufficient') || 'Stock insuficiente'}</Alert>
                  </Grid>
                )}
                {productoSeleccionado && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      Se descontarán {cantidadUsada} unidades de {productoSeleccionado.nombre}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            )}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{
      maxWidth: 900,
      mx: 'auto',
      animation: 'fadeIn 0.3s ease-in'
    }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {t('create.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('create.subtitle')}
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            bgcolor: 'primary.main',
          }
        }}
      >
        <form onSubmit={handleSubmit}>
          {renderStepContent()}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Divider sx={{ my: 4 }} />

          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Button
              variant="outlined"
              onClick={() => activeStep === 0 ? navigate('/') : handleBack()}
              sx={{ minWidth: 120 }}
            >
              {activeStep === 0 ? t('create.cancel') : t('common.back')}
            </Button>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  sx={{ minWidth: 120 }}
                >
                  {t('common.next')}
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{
                    minWidth: 160,
                    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)',
                    }
                  }}
                >
                  {t('create.submit')}
                </Button>
              )}
            </Box>
          </Box>

          {activeStep >= 2 && (
            <Box sx={{ mt: 4, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('create.summary')}
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="body2" color="text.secondary">{t('create.problemTitle')}</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, wordBreak: 'break-word' }}>
                    {titulo || '-'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="body2" color="text.secondary">{t('create.area')}</Typography>
                  <Typography variant="body1">{getFinalArea() || '-'}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="body2" color="text.secondary">{t('create.sector')}</Typography>
                  <Typography variant="body1">{getFinalSector() || '-'}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="body2" color="text.secondary">{t('create.priority')}</Typography>
                  <Chip
                    label={t(`priority.${prioridad.toLowerCase()}`)}
                    color={prioridad === 'Alta' ? 'error' : prioridad === 'Media' ? 'warning' : 'success'}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </form>
      </Paper>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
}
