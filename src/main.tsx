import './i18n';
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import CssBaseline from '@mui/material/CssBaseline'
import { BrowserRouter } from 'react-router-dom'
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { ThemeProvider } from './context/ThemeProvider';
import { OrgProvider } from './context/OrgProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <OrgProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <CssBaseline />
            <App />
          </LocalizationProvider>
        </OrgProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
