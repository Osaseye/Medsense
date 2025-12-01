import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Medications from './pages/Medications';
import Reminders from './pages/Reminders';
import Adherence from './pages/Adherence';
import Prescriptions from './pages/Prescriptions';
import Caregiver from './pages/Caregiver';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="medications" element={<Medications />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="adherence" element={<Adherence />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="caregiver" element={<Caregiver />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
