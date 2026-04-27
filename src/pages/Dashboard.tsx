import { useState, useMemo } from 'react';
import {
  Box, Paper, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab, Card, CardContent, Chip, useTheme
} from '@mui/material';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTickets } from '../hooks/useTickets';
import { useOrg } from '../context/useOrg';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { tickets } = useTickets();
  const { agentes } = useOrg();
  const [statsTab, setStatsTab] = useState(0);

  const stats = useMemo(() => {
    const normalize = (str?: string) =>
      (str || '').toLowerCase().trim();

    const total = tickets.length;

    const porEstado: Record<string, number> = {};
    const porPrioridad: Record<string, number> = {};
    const porArea: Record<string, number> = {};
    const porAgente: Record<string, number> = {};
    const porAgenteEstado: Record<string, Record<string, number>> = {};

    const agentesMap = Object.fromEntries(
      agentes.map(a => [a.id, a.nombre])
    );

    tickets.forEach(t => {
      const estado = normalize(t.estado);
      const prioridad = normalize(t.prioridad);
      const area = t.area || 'Sin área';

      const estadoKey =
        estado === 'abierto' ? 'Abierto' :
          estado === 'en progreso' ? 'En Progreso' :
            estado === 'cerrado' ? 'Cerrado' :
              'Otro';

      const prioridadKey =
        prioridad === 'alta' ? 'Alta' :
          prioridad === 'media' ? 'Media' :
            prioridad === 'baja' ? 'Baja' :
              'Otra';

      porEstado[estadoKey] = (porEstado[estadoKey] || 0) + 1;
      porPrioridad[prioridadKey] = (porPrioridad[prioridadKey] || 0) + 1;
      porArea[area] = (porArea[area] || 0) + 1;

      const nombre = t.agenteId
        ? agentesMap[t.agenteId] || 'Sin nombre'
        : 'Sin asignar';

      porAgente[nombre] = (porAgente[nombre] || 0) + 1;

      if (!porAgenteEstado[nombre]) {
        porAgenteEstado[nombre] = {
          Abierto: 0,
          'En Progreso': 0,
          Cerrado: 0
        };
      }

      porAgenteEstado[nombre][estadoKey] =
        (porAgenteEstado[nombre][estadoKey] || 0) + 1;
    });

    return {
      total,
      porEstado,
      porPrioridad,
      porArea,
      porAgente,
      porAgenteEstado
    };
  }, [tickets, agentes]);

  const getPercent = (count: number) =>
    stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;

  return (
    <Box>

      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('dashboard.title')}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        {[
          { label: t('stats.total'), value: stats.total, color: theme.palette.primary.main },
          { label: t('stats.open'), value: stats.porEstado['Abierto'] || 0, color: theme.palette.info.main, icon: <RadioButtonUncheckedIcon /> },
          { label: t('stats.inProgress'), value: stats.porEstado['En Progreso'] || 0, color: theme.palette.warning.main, icon: <HourglassEmptyIcon /> },
          { label: t('stats.closed'), value: stats.porEstado['Cerrado'] || 0, color: theme.palette.success.main, icon: <CheckCircleIcon /> },
        ].map(stat => (
          <Card key={stat.label} sx={{ flex: '1 1 200px', textAlign: 'center' }}>
            <CardContent>
              {stat.icon}
              <Typography>{stat.label}</Typography>
              <Typography variant="h4" sx={{ color: stat.color }}>
                {stat.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Paper>
        <Tabs value={statsTab} onChange={(_, v) => setStatsTab(v)}>
          <Tab label={t('filter.priority')} />
          <Tab label={t('filter.area')} />
          <Tab label={t('filter.status')} />
          <Tab label={t('filter.agent')} />
          <Tab label={t('stats.byAgent')} />
        </Tabs>

        <Box sx={{ p: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('common.name')}</TableCell>
                  {statsTab === 4 ? (
                    <>
                      <TableCell align="right">{t('stats.open')}</TableCell>
                      <TableCell align="right">{t('stats.inProgress')}</TableCell>
                      <TableCell align="right">{t('stats.closed')}</TableCell>
                      <TableCell align="right">{t('stats.total')}</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell align="right">{t('stats.total')}</TableCell>
                      <TableCell align="right">%</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>

              <TableBody>

                {statsTab === 4 &&
                  Object.entries(stats.porAgenteEstado)
                    .sort((a, b) =>
                      (b[1].Abierto + b[1]['En Progreso'] + b[1].Cerrado) -
                      (a[1].Abierto + a[1]['En Progreso'] + a[1].Cerrado)
                    )
                    .map(([nombre, estados]) => {
                      const total = estados.Abierto + estados['En Progreso'] + estados.Cerrado;

                      return (
                        <TableRow key={nombre}>
                          <TableCell>{nombre}</TableCell>
                          <TableCell align="right">{estados.Abierto}</TableCell>
                          <TableCell align="right">{estados['En Progreso']}</TableCell>
                          <TableCell align="right">{estados.Cerrado}</TableCell>
                          <TableCell align="right">{total}</TableCell>
                        </TableRow>
                      );
                    })}

                {statsTab !== 4 &&
                  Object.entries(
                    statsTab === 0 ? stats.porPrioridad :
                      statsTab === 1 ? stats.porArea :
                        statsTab === 2 ? stats.porEstado :
                          stats.porAgente
                  )
                    .sort((a, b) => b[1] - a[1])
                    .map(([key, count]) => (
                      <TableRow key={key}>
                        <TableCell>{key}</TableCell>
                        <TableCell align="right">{count}</TableCell>
                        <TableCell align="right">
                          <Chip label={`${getPercent(count)}%`} />
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>

            </Table>
          </TableContainer>
        </Box>
      </Paper>

    </Box>
  );
}