import ProfessorFilters from '../components/ProfessorFilters';
import ProfessorKPIs from '../components/ProfessorKPIs';
import StudentsTable from '../components/StudentsTable';
import ClusterLegend from '../components/ClusterLegend';
import StudentDetailModal from '../components/StudentDetailModal';
import PCAScatter from '../components/PCAScatter';
import { useFilteredStudents } from '../shared/hooks';
import { useAppStore } from '../shared/store';

export default function ProfessorPage() {
  const filtered = useFilteredStudents();
  const { data } = useAppStore();

  const dataset = filtered.length ? filtered : data;

  return (
    <div className="max-w-[1880px] mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          Vista del Profesor <span className="text-gray-400 text-sm" title="PCA">○</span>
        </h2>
        <div className="text-sm text-gray-400">Segmentación de Estudiantes</div>
      </div>

      <div className="mt-4">
        <ProfessorFilters />
      </div>

      <div className="mt-6">
        <ProfessorKPIs data={filtered} />
      </div>

      <div className="mt-6">
        <PCAScatter data={dataset} />
      </div>

      <div className="mt-6">
        <StudentsTable data={filtered} />
      </div>

      <ClusterLegend />

      <StudentDetailModal allData={dataset} />
    </div>
  );
}
