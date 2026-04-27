import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Typography, Paper, TextField, Button,
  Container, Alert, CircularProgress, useTheme
} from '@mui/material';
import { useOrg } from '../context/useOrg';
import { alpha } from '@mui/material/styles';
import DomainAddIcon from '@mui/icons-material/DomainAdd';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';

export default function Registro() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { agregarOrganizacion } = useOrg();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!nombre.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Todos los campos son requeridos');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 600));

    const success = agregarOrganizacion({
      nombre: nombre.trim(),
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (success) {
      navigate('/');
    } else {
      setError('Ya existe una organización con ese nombre o correo electrónico');
    }
  };

  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 4, sm: 6 },
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 50%, ${alpha(theme.palette.secondary.main, 0.08)} 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 40%),
                      radial-gradient(circle at 40% 80%, ${alpha('#f59e0b', 0.05)} 0%, transparent 40%)`,
          zIndex: -1,
        },
      }}
    >
      <Box
        sx={{
          width: '100%',
          animation: 'fadeIn 0.6s ease-out',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            boxShadow: `0 20px 60px -12px ${alpha(theme.palette.common.black, 0.15)}`,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Box
              sx={{
                width: { xs: 80, sm: 100 },
                height: { xs: 80, sm: 100 },
                borderRadius: '24px',
                background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                boxShadow: `0 12px 32px -8px ${alpha(theme.palette.secondary.main, 0.4)}`,
              }}
            >
              <DomainAddIcon sx={{ fontSize: { xs: 40, sm: 48 }, color: 'white' }} />
            </Box>
            <Typography
              component="h1"
              variant="h3"
              sx={{
                fontWeight: 800,
                background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
                letterSpacing: '-0.03em',
              }}
            >
              Crear Organización
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
              Configura tu espacio de trabajo en minutos
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                animation: 'slideInRight 0.3s ease-out',
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Nombre de la organización"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              variant="outlined"
              slotProps={{
                input: {
                  startAdornment: <DomainAddIcon sx={{ mr: 1.5, color: 'text.secondary', fontSize: 20 }} />,
                },
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255,255,255,0.6)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                  },
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              slotProps={{
                input: {
                  startAdornment: <EmailIcon sx={{ mr: 1.5, color: 'text.secondary', fontSize: 20 }} />,
                },
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255,255,255,0.6)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                  },
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              slotProps={{
                input: {
                  startAdornment: <LockIcon sx={{ mr: 1.5, color: 'text.secondary', fontSize: 20 }} />,
                },
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255,255,255,0.6)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                  },
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirmar contraseña"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              variant="outlined"
              slotProps={{
                input: {
                  startAdornment: <LockIcon sx={{ mr: 1.5, color: 'text.secondary', fontSize: 20 }} />,
                },
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255,255,255,0.6)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                  },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                py: 1.75,
                mb: 2,
                fontSize: '1rem',
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                boxShadow: `0 8px 24px -4px ${alpha(theme.palette.secondary.main, 0.4)}`,
                '&:hover': {
                  boxShadow: `0 12px 32px -8px ${alpha(theme.palette.secondary.main, 0.5)}`,
                  transform: 'translateY(-2px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Crear Organización'
              )}
            </Button>
          </Box>

          <Box
            sx={{
              mt: 3,
              textAlign: 'center',
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              ¿Ya tienes una organización?{' '}
              <Link
                to="/login"
                style={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 700,
                }}
              >
                Inicia sesión
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}