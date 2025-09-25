import  { useEffect, useMemo } from "react";
import Landing from "../components/Landing";
import ProfessorFilters from "../components/ProfessorFilters";
import ProfessorKPIs from "../components/ProfessorKPIs";
import StudentsTable from "../components/StudentsTable";
import ClusterLegend from "../components/ClusterLegend";
import StudentDetailModal from "../components/StudentDetailModal";
import { useAppStore } from "../shared/store";
import { buildAnalytics } from "../shared/analytics";
import type { EnrichedStudent, SegmentLabel, Student } from "../shared/types";

export default function HomePage() {
  const {
    role, setRole,
    data, setData, setSelectedId,
    search, segmentFilter, genderFilter,
    attendanceRange, studyRange, orderBy
  } = useAppStore();

  useEffect(() => {
    fetch("/data/students.json")
      .then(r => r.json())
      .then((rows: Student[]) => {
        const enriched = buildAnalytics(rows, 4);
        setData(enriched);
        if (enriched.length) setSelectedId(enriched[0].id);
      })
      .catch(err => console.error("Error loading JSON:", err));
  }, [setData, setSelectedId]);

  const filtered: EnrichedStudent[] = useMemo(() => {
    const s = search.trim().toLowerCase();
    let arr = data
      .filter(d => (segmentFilter === "All" ? true : d.segment === (segmentFilter as SegmentLabel)))
      .filter(d => (genderFilter === "All" ? true : d.gender === genderFilter))
      .filter(d => d.attendance_percentage >= attendanceRange[0] && d.attendance_percentage <= attendanceRange[1])
      .filter(d => d.study_minutes_per_day >= studyRange[0] && d.study_minutes_per_day <= studyRange[1])
      .filter(d => (s ? d.name.toLowerCase().includes(s) || d.student_id.toLowerCase().includes(s) : true));

    switch (orderBy) {
      case "Nombre": arr = arr.sort((a,b)=>a.name.localeCompare(b.name)); break;
      case "Estudio": arr = arr.sort((a,b)=>b.study_minutes_per_day - a.study_minutes_per_day); break;
      case "Asistencia": arr = arr.sort((a,b)=>b.attendance_percentage - a.attendance_percentage); break;
      case "Score": arr = arr.sort((a,b)=>b.exam_score - a.exam_score); break;
    }
    return arr;
  }, [data, search, segmentFilter, genderFilter, attendanceRange, studyRange, orderBy]);

  if (role === "Landing") {
    return <Landing onAlumno={()=>setRole("Alumno")} onProfesor={()=>setRole("Profesor")} />;
  }

  if (role === "Alumno") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold">Modo Alumno</h2>
        <p className="text-gray-600">Próxima sección…</p>
        <div className="mt-6">
          <button className="text-sm underline" onClick={()=>setRole("Profesor")}>Ir a Vista Profesor</button>
        </div>
      </div>
    );
  }

  // ---- Vista Profesor ----
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 ">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Vista del Profesor <span className="text-gray-400 text-sm">○</span></h2>
        <div className="text-sm text-gray-400">Segmentación de Estudiantes</div>
      </div>

      <div className="mt-4">
        <ProfessorFilters />
      </div>

      <div className="mt-6">
        <ProfessorKPIs data={filtered} />
      </div>

      <div className="mt-6">
        <StudentsTable data={filtered} />
      </div>

      <ClusterLegend />

      <StudentDetailModal allData={filtered.length ? filtered : data} />
    </div>
  );
}
