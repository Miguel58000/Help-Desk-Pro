import {
  Box, AppBar, Toolbar, Typography, Container, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Tooltip, Alert,
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, useTheme, alpha
} from '@mui/material';
import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DomainAddIcon from '@mui/icons-material/DomainAdd';
import ManageAgentsIcon from '@mui/icons-material/Group';
import InventoryIcon from '@mui/icons-material/Inventory';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import TranslateIcon from '@mui/icons-material/Translate';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import { useOrg } from '../context/useOrg';
import { useThemeMode } from '../context/useThemeMode';
import { useTranslation } from 'react-i18next';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { mode, toggleTheme } = useThemeMode();
  const { organizacionActual, organizaciones, agregarOrganizacion, logout } = useOrg();
  const theme = useTheme();

  const [dialogOpen, setDialogOpen] = useState(() => organizaciones.length === 0);
  const [nuevaOrg, setNuevaOrg] = useState('');
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevoPassword, setNuevoPassword] = useState('');
  const [orgError, setOrgError] = useState('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleAgregarOrg = () => {
    setOrgError('');
    if (nuevaOrg.trim() && nuevoEmail.trim() && nuevoPassword.trim()) {
      const success = agregarOrganizacion({
        nombre: nuevaOrg.trim(),
        email: nuevoEmail.trim(),
        password: nuevoPassword.trim(),
      });
      if (success) {
        setNuevaOrg('');
        setNuevoEmail('');
        setNuevoPassword('');
        setDialogOpen(false);
      } else {
        setOrgError('Ya existe una organización con ese nombre o correo electrónico');
      }
    } else {
      setOrgError('Complete todos los campos');
    }
  };

  const handleCloseDialog = () => {
    if (organizaciones.length > 0) {
      setDialogOpen(false);
    }
  };

  const toggleLanguage = () => {
    const nuevoIdioma = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(nuevoIdioma);
    localStorage.setItem('helpdesk_lang', nuevoIdioma);
  };

  const navItems = [
    { label: t('nav.dashboard'), icon: <DashboardIcon />, path: '/dashboard' },
    { label: t('nav.newTicket'), icon: <AddIcon />, path: '/nuevo', primary: true },
    { label: t('nav.agents'), icon: <ManageAgentsIcon />, path: '/agentes' },
    { label: t('nav.stock'), icon: <InventoryIcon />, path: '/stock' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.primary.main, 0.08)} 50%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '20%',
            right: '10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.08)} 0%, transparent 70%)`,
            filter: 'blur(60px)',
            animation: 'float 20s ease-in-out infinite',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '10%',
            left: '5%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.success.main, 0.06)} 0%, transparent 70%)`,
            filter: 'blur(80px)',
            animation: 'float 25s ease-in-out infinite reverse',
          },
          transition: 'background 0.5s ease',
        }}
      />

      <AppBar position="fixed" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', backdropFilter: 'blur(10px)', zIndex: 1100 }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="primary"
            aria-label="menu"
            sx={{ mr: 2, display: { xs: 'flex', sm: 'none' } }}
            onClick={() => setMobileDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              flexGrow: { xs: 1, sm: 0 },
            }}
            onClick={() => navigate('/')}
          >
            <InfoIcon sx={{ fontSize: 28, color: 'primary.main' }} />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.8rem', sm: '2.2rem' },
                letterSpacing: '-0.02em',
                textAlign: 'center',
                width: '100%',
              }}
            >
              HelpDesk Pro
            </Typography>
          </Box>

          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, ml: 4 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                color={location.pathname === item.path ? 'primary' : 'inherit'}
                onClick={() => navigate(item.path)}
                startIcon={item.icon}
                sx={{
                  fontWeight: 600,
                  px: 2,
                  ...(item.primary && {
                    variant: 'contained',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    },
                  }),
                }}
                disabled={item.path === '/nuevo' && !organizacionActual}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2, alignItems: 'center', ml: 'auto' }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
              {organizacionActual}
            </Typography>

            <Tooltip title={t('theme.toggle')}>
              <IconButton onClick={toggleTheme} color="primary" size="small">
                {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
              </IconButton>
            </Tooltip>

            <Tooltip title={t('lang.toggle')}>
              <IconButton onClick={toggleLanguage} color="primary" size="small">
                <TranslateIcon />
              </IconButton>
            </Tooltip>

            <Button
              variant="outlined"
              size="small"
              onClick={() => setDialogOpen(true)}
              title={t('org.add')}
              sx={{ minWidth: 'auto', p: 1 }}
              aria-label="Agregar organización"
            >
              <DomainAddIcon />
            </Button>
          </Box>

          <Box sx={{ display: { xs: 'flex', sm: 'none' }, gap: 1, ml: 'auto', alignItems: 'center' }}>
            <Tooltip title={organizacionActual} placement="bottom">
              <Typography variant="body2" sx={{ fontWeight: 500, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {organizacionActual}
              </Typography>
            </Tooltip>

            <IconButton onClick={toggleTheme} color="primary" size="small">
              {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>

            <IconButton onClick={toggleLanguage} color="primary" size="small">
              <TranslateIcon />
            </IconButton>

            <IconButton
              onClick={() => { logout(); navigate('/login'); }}
              color="secondary"
              size="small"
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Toolbar />

      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: 280,
              bgcolor: mode === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
            },
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
            HelpDesk Pro
          </Typography>
          <IconButton onClick={() => setMobileDrawerOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List>
          {navItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setMobileDrawerOpen(false);
                }}
                selected={location.pathname === item.path}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: `${theme.palette.primary.main}15`,
                    '&:hover': { bgcolor: `${theme.palette.primary.main}25` },
                  },
                }}
              >
                <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {organizacionActual}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setDialogOpen(true)}
            startIcon={<DomainAddIcon />}
            fullWidth
            sx={{ mb: 1 }}
          >
            {t('org.add')}
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => { logout(); navigate('/login'); }}
            startIcon={<LogoutIcon />}
            fullWidth
            color="secondary"
          >
            {t('nav.logout')}
          </Button>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, py: { xs: 2, sm: 4 }, backgroundColor: 'background.default' }}>
        <Container maxWidth="xl">
          <Box
            key={location.pathname}
            sx={{
              animation: 'fadeInUp 0.5s ease-out',
            }}
          >
            <Outlet />
          </Box>
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          py: { xs: 2, sm: 3 },
          px: { xs: 2, sm: 3 },
          textAlign: 'center',
          color: 'text.secondary',
          fontSize: '0.875rem',
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: mode === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(8px)',
          mt: 'auto',
        }}
      >
        <Typography variant="body2">
          © {new Date().getFullYear()} HelpDesk Pro. Desarrollado por Miguel Rodríguez. {t('footer.rights')}
        </Typography>
      </Box>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{t('org.addTitle')}</DialogTitle>
        <DialogContent>
          {orgError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {orgError}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label={t('org.name')}
            fullWidth
            variant="outlined"
            value={nuevaOrg}
            onChange={(e) => setNuevaOrg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAgregarOrg()}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Correo electrónico"
            type="email"
            fullWidth
            variant="outlined"
            value={nuevoEmail}
            onChange={(e) => setNuevoEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAgregarOrg()}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Contraseña"
            type="password"
            fullWidth
            variant="outlined"
            value={nuevoPassword}
            onChange={(e) => setNuevoPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAgregarOrg()}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleCloseDialog}>{t('create.cancel')}</Button>
          <Button variant="contained" onClick={handleAgregarOrg}>{t('org.add')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}