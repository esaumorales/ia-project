import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAppStore } from '../shared/store';

export default function Sidebar() {
  const { pathname, search } = useLocation();
  const role = useAppStore((s) => s.role);
  const setRole = useAppStore((s) => s.setRole);

  const isActive = (to: string) => {
    const [linkBase, linkQuery] = to.split('?');
    const linkTab = new URLSearchParams(linkQuery || '').get('tab');
    const curTab = new URLSearchParams(search).get('tab');
    if (!linkTab) return pathname === linkBase && curTab === null;
    const baseMatch = pathname.startsWith(linkBase);
    return baseMatch && curTab === linkTab;
  };

  const items =
    role === 'Alumno'
      ? [
          { to: '/alumno', label: 'Panel Alumno', icon: 'mdi:school-outline' },
          { to: '/alumno?tab=habitos', label: 'Hábitos', icon: 'mdi:chart-line' },
          { to: '/alumno?tab=reco', label: 'Recomendaciones', icon: 'mdi:star-outline' },
        ]
      : [
          { to: '/profesor?tab=panel', label: 'Panel Profesor', icon: 'mdi:account-tie-outline' },
          { to: '/profesor?tab=clusters', label: 'Grupos/Clusters', icon: 'mdi:account-group-outline' },
          { to: '/profesor?tab=pca', label: 'PCA', icon: 'mdi:scatter-plot' },
          { to: '/profesor?tab=insights', label: 'Insights', icon: 'mdi:lightbulb-on-outline' },
        ];

  return (
    <aside className="w-60   p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">
        {role === 'Alumno' ? 'Alumno' : 'Profesor'}
      </h2>

      <nav className="flex flex-col gap-2">
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-200 ${isActive(it.to) ? 'bg-gray-200 font-medium' : ''}`}
          >
            <Icon icon={it.icon} className="text-xl" />
            {it.label}
          </Link>
        ))}
      </nav>

      <Link
        to="/"
        onClick={() => setRole('Landing')}
        className="mt-auto text-sm text-gray-500 hover:text-gray-700"
      >
        ← Volver al inicio
      </Link>
    </aside>
  );
}
