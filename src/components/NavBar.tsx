import { Link, useLocation } from 'react-router-dom';

export default function NavBar() {
  const { pathname } = useLocation();

  const isActive = (p: string) =>
    pathname === p ? 'text-blue-600 font-semibold' : 'text-gray-700';

  return (
    <header className="w-full bg-white/70 backdrop-blur sticky top-0 z-50 flex justify-center">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <nav className="ml-4 flex items-center gap-4 text-sm  justify-center">
          <Link className={isActive('/')} to="/">
            Inicio
          </Link>
          <Link className={isActive('/alumno')} to="/alumno">
            Alumno
          </Link>
          <Link className={isActive('/profesor')} to="/profesor">
            Profesor
          </Link>
        </nav>
      </div>
    </header>
  );
}
