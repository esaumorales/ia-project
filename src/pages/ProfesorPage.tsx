import { useSearchParams } from 'react-router-dom';
import ProfessorFilters from '../components/Profesor/ProfessorFilters';
import ProfessorKPIs from '../components/Profesor/ProfessorKPIs';
import StudentsTable from '../components/Profesor/StudentsTable';
import ClusterLegend from '../components/Profesor/ClusterLegend';
import StudentDetailModal from '../components/Profesor/StudentDetailModal';
import PCAScatter from '../components/Profesor/PCAScatter';
import { useFilteredStudents } from '../shared/hooks';
import { useAppStore } from '../shared/store';

export default function ProfessorPage() {
  const [params] = useSearchParams();
  const tab = (params.get('tab') || 'clusters') as 'clusters' | 'pca' | 'insights';

  const filtered = useFilteredStudents();
  const { data } = useAppStore();
  const dataset = filtered.length ? filtered : data;

  return (
    <div className="max-w-[1880px] mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          Vista del Profesor{' '}
          {tab === 'pca' && (
            <span className="text-gray-400 text-sm" title="PCA">○</span>
          )}
        </h2>
        <div className="text-sm text-gray-400">Segmentación de Estudiantes</div>
      </div>

      <div className="mt-4">
        <ProfessorFilters />
      </div>

      <div className="mt-6">
        <ProfessorKPIs data={filtered} />
      </div>

      {/* ==== CONTENIDO SEGÚN TAB ==== */}
      {tab === 'pca' && (
        <div className="mt-6">
          <PCAScatter data={dataset} />
        </div>
      )}

      {tab === 'clusters' && (
        <>
          <div className="mt-6">
            <StudentsTable data={filtered} />
          </div>
          <ClusterLegend />
          <StudentDetailModal allData={dataset} />
        </>
      )}

      {tab === 'insights' && (
        <div className="mt-10 text-gray-500">
          {/* deja tus componentes/insights aquí si ya los tienes */}
          Próximamente: Insights
        </div>
      )}
    </div>
  );
}
