import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import TicketsListPage from './pages/TicketsListPage';
import CrearTicket from './pages/CrearTicket';
import DetalleTicket from './pages/DetalleTicket';
import Agentes from './pages/Agentes';
import Stock from './pages/Stock';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/tickets" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tickets" element={<TicketsListPage />} />
        <Route path="nuevo" element={<CrearTicket />} />
        <Route path="ticket/:id" element={<DetalleTicket />} />
        <Route path="agentes" element={<Agentes />} />
        <Route path="stock" element={<Stock />} />
      </Route>
    </Routes>
  );
}

export default App;
