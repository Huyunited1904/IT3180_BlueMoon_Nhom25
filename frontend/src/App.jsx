import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ApiHealthPage from './pages/ApiHealthPage';
import DashboardPage from './pages/DashboardPage';
import FeesPage from './pages/FeesPage';
import HouseholdsPage from './pages/HouseholdsPage';
import LoginPage from './pages/LoginPage';
import ResidentsPage from './pages/ResidentsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/api-test" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/households" element={<HouseholdsPage />} />
        <Route path="/residents" element={<ResidentsPage />} />
        <Route path="/fees" element={<FeesPage />} />
        <Route path="/api-test" element={<ApiHealthPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/api-test" replace />} />
    </Routes>
  );
}
