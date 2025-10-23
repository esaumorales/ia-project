import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';

import RouteDataLoader from './shared/RouteDataLoader';
import StudentPage from './pages/StudendPage';
import ProfessorPage from './pages/ProfesorPage';
import Sidebar from './components/Sidebar';
import { useAppStore } from './shared/store';

/**
 * Layout principal: Sidebar visible sólo si el rol ≠ 'Landing'.
 * Protege rutas según el rol actual.
 */
export default function App() {
  const role = useAppStore((s) => s.role);
  const showSidebar = role !== 'Landing';

  return (
    <div className="flex min-h-screen">
      {showSidebar && <Sidebar />}

      <div className="flex-1">
        <RouteDataLoader />
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route
            path="/alumno"
            element={
              role === 'Alumno' ? <StudentPage /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/profesor"
            element={
              role === 'Profesor' ? <ProfessorPage /> : <Navigate to="/" replace />
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
