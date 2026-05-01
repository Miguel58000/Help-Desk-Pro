import { useState } from 'react';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  Chip, Alert, Snackbar, Tooltip, Grid, Card, CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Remove as RemoveIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useInventory } from '../hooks/useInventory';
import { useOrg } from '../context/useOrg';
import type { Producto } from '../types/ticket';

export default function Stock() {
  const { t } = useTranslation();
  const { organizacionActual } = useOrg();
  const {
    productos,
    error,
    agregarProducto,
    actualizarCantidad,
  } = useInventory();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    cantidad: 1,
    precioUnitario: '',
    categoria: ''
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleOpenDialog = (producto?: Producto) => {
    if (producto) {
      setEditingProducto(producto);
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        cantidad: producto.cantidad,
        precioUnitario: producto.precioUnitario?.toString() || '',
        categoria: producto.categoria || ''
      });
    } else {
      setEditingProducto(null);
      setFormData({
        nombre: '',
        descripcion: '',
        cantidad: 1,
        precioUnitario: '',
        categoria: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProducto(null);
  };

  const handleSubmit = async () => {
    if (!organizacionActual) {
      setSnackbar({ open: true, message: 'No hay organización seleccionada', severity: 'error' });
      return;
    }
    if (!formData.nombre.trim()) {
      setSnackbar({ open: true, message: 'El nombre es requerido', severity: 'error' });
      return;
    }
    if (formData.cantidad < 0) {
      setSnackbar({ open: true, message: 'La cantidad no puede ser negativa', severity: 'error' });
      return;
    }

    try {
      if (editingProducto) {
        await actualizarCantidad(editingProducto.id, formData.cantidad);
        setSnackbar({ open: true, message: 'Producto actualizado', severity: 'success' });
      } else {
        await agregarProducto({
          nombre: formData.nombre,
          descripcion: formData.descripcion || undefined,
          cantidad: formData.cantidad,
          precioUnitario: formData.precioUnitario ? parseFloat(formData.precioUnitario) : undefined,
          categoria: formData.categoria || undefined,
          organizacion: organizacionActual || '',
        });
        setSnackbar({ open: true, message: 'Producto agregado', severity: 'success' });
      }
      handleCloseDialog();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al guardar producto', severity: 'error' });
    }
  };

  const handleAdjustStock = async (producto: Producto, delta: number) => {
    const newCantidad = producto.cantidad + delta;
    if (newCantidad < 0) {
      setSnackbar({ open: true, message: 'No se puede reducir más el stock', severity: 'error' });
      return;
    }
    try {
      await actualizarCantidad(producto.id, newCantidad);
      setSnackbar({ open: true, message: `Stock ${delta > 0 ? 'aumentado' : 'disminuido'}`, severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al ajustar stock', severity: 'error' });
    }
  };

  const totalItems = productos.reduce((sum, p) => sum + p.cantidad, 0);
  const productosSinStock = productos.filter(p => p.cantidad === 0).length;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {t('nav.stock')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona el inventario de productos y materiales
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <InventoryIcon color="primary" />
                <Box>
                  <Typography variant="h6">{productos.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Productos totales</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <InventoryIcon color="success" />
                <Box>
                  <Typography variant="h6">{totalItems}</Typography>
                  <Typography variant="body2" color="text.secondary">Unidades en stock</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {productosSinStock > 0 ? (
                  <WarningIcon color="error" />
                ) : (
                  <InventoryIcon color="success" />
                )}
                <Box>
                  <Typography variant="h6">{productosSinStock}</Typography>
                  <Typography variant="body2" color="text.secondary">Productos sin stock</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Inventario</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Agregar Producto
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Nombre</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Descripción</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Stock</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Precio Unit.</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 700 }}>Estado</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 700 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No hay productos registrados. Agrega tu primer producto.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              productos.map((producto) => (
                <TableRow
                  key={producto.id}
                  sx={{
                    '&:hover': { bgcolor: 'action.hover' },
                    bgcolor: producto.cantidad === 0 ? 'error.5' : producto.cantidad <= 5 ? 'warning.5' : 'inherit'
                  }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>{producto.nombre}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{producto.descripcion || '-'}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={producto.cantidad}
                      color={producto.cantidad === 0 ? 'error' : producto.cantidad <= 5 ? 'warning' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {producto.precioUnitario ? `$${producto.precioUnitario.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell align="center">
                    {producto.cantidad === 0 ? (
                      <Chip label="Sin stock" color="error" size="small" />
                    ) : producto.cantidad <= 5 ? (
                      <Chip label="Bajo" color="warning" size="small" />
                    ) : (
                      <Chip label="Disponible" color="success" size="small" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Tooltip title="Disminuir">
                        <IconButton size="small" onClick={() => handleAdjustStock(producto, -1)} disabled={producto.cantidad <= 0}>
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleOpenDialog(producto)} color="primary">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Aumentar">
                        <IconButton size="small" onClick={() => handleAdjustStock(producto, 1)} color="success">
                          <InventoryIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>
          {editingProducto ? 'Editar Producto' : 'Agregar Producto'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Nombre"
              fullWidth
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
            <TextField
              label="Descripción"
              fullWidth
              multiline
              rows={2}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            />
            <TextField
              label="Cantidad"
              type="number"
              fullWidth
              value={formData.cantidad}
              onChange={(e) => setFormData({ ...formData, cantidad: Math.max(0, parseInt(e.target.value) || 0) })}
            />
            <TextField
              label="Precio unitario (opcional)"
              type="number"
              fullWidth
              value={formData.precioUnitario}
              onChange={(e) => setFormData({ ...formData, precioUnitario: e.target.value })}
              slotProps={{
                input: {
                  startAdornment: <span>$</span>
                }
              }}
            />
            <TextField
              label="Categoría (opcional)"
              fullWidth
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProducto ? 'Guardar' : 'Agregar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
