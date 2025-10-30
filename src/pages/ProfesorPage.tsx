// src/pages/ProfessorPage.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProfessorFilters from '../components/Profesor/ProfessorFilters';
import ProfessorKPIs from '../components/Profesor/ProfessorKPIs';
import StudentsTable from '../components/Profesor/StudentsTable';
import ClusterLegend from '../components/Profesor/ClusterLegend';
import StudentDetailModal from '../components/Profesor/StudentDetailModal';
import PCAScatter from '../components/Profesor/PCAScatter';
import { useFilteredStudents } from '../shared/hooks';
import { useAppStore } from '../shared/store';
import RNA from '../components/Profesor/RNA';

type Tabs = 'panel' | 'clusters' | 'pca' | 'rna' | 'insights';

export default function ProfessorPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // redirige /profesor -> /profesor?tab=panel
  useEffect(() => {
    if (!params.get('tab')) {
      navigate('/profesor?tab=panel', { replace: true });
    }
  }, [params, navigate]);

  const tab = (params.get('tab') || 'panel') as Tabs;

  const filtered = useFilteredStudents();
  const { data } = useAppStore();
  const dataset = filtered.length ? filtered : data;

  return (
    <div className="max-w-[1880px] mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          Vista del Profesor {tab === 'pca' && <span className="text-gray-400 text-sm" title="PCA">○</span>}
        </h2>
        <div className="text-sm text-gray-400">Segmentación de Estudiantes</div>
      </div>

      <div className="mt-4">
        <ProfessorFilters />
      </div>

      {/* Panel: dashboard (KPIs + PCA embebido) */}
      {tab === 'panel' && (
        <>
          <div className="mt-6">
            <ProfessorKPIs />
          </div>
          <div className="mt-6">
            <PCAScatter data={dataset} />
          </div>
        </>
      )}

      {/* Clusters: tabla + leyenda + modal */}
      {tab === 'clusters' && (
        <>
          <div className="mt-6">
            <ProfessorKPIs />
          </div>
          <div className="mt-6">
            <StudentsTable data={filtered} />
          </div>
          <ClusterLegend />
          <StudentDetailModal allData={dataset} />
        </>
      )}

      {/* PCA: vista dedicada */}
      {tab === 'pca' && (
        <div className="mt-6">
          <PCAScatter data={dataset} />
        </div>
      )}

      {/* RNA (ahora con predicción Bayesiana Naive usando dataset) */}
      {tab === 'rna' && (
        <div className="mt-6">
          <RNA data={dataset} />
        </div>
      )}

      {/* Insights (placeholder) */}
      {tab === 'insights' && (
        <div className="mt-10 text-gray-500">Próximamente: Insights</div>
      )}
    </div>
  );
}
