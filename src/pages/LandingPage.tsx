import { useNavigate } from 'react-router-dom';
import Landing from '../components/Landing';
import { useAppStore } from '../shared/store';

export default function LandingPage() {
  const navigate = useNavigate();
  const { setRole } = useAppStore();

  return (
    <Landing
      onAlumno={() => {
        setRole('Alumno');
        navigate('/alumno');
      }}
      onProfesor={() => {
        setRole('Profesor');
        navigate('/profesor');
      }}
    />
  );
}
