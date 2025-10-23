import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../shared/store';

export default function StudentPage() {
  const navigate = useNavigate();
  const { setRole } = useAppStore();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold">Modo Alumno</h2>
      <p className="text-gray-600">Próxima sección…</p>

      <div className="mt-6 flex items-center gap-4">
        <button
          className="text-sm underline"
          onClick={() => {
            setRole('Profesor');
            navigate('/profesor');
          }}
        >
          Ir a Vista Profesor
        </button>
        <Link className="text-sm underline text-gray-600" to="/">
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
