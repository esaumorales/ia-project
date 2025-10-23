import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';

import RouteDataLoader from './shared/RouteDataLoader';
import NavBar from './components/NavBar';
import StudentPage from './pages/StudendPage';
import ProfessorPage from './pages/ProfesorPage';

/**
 * App monta un cargador de datos (misma lógica de HomePage para fetch y setSelectedId)
 * y define las rutas navegables. La barra superior permite avanzar/retroceder.
 */
export default function App() {
  return (
    <>
      <NavBar />
      <RouteDataLoader />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/alumno" element={<StudentPage />} />
        <Route path="/profesor" element={<ProfessorPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
