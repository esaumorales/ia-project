import  { useMemo } from "react";
import { useAppStore } from "../../shared/store";
import type { EnrichedStudent } from "../../shared/types";
import { Pill } from "./StudentList";
import { explainStudent } from "../../shared/analytics";

export default function StudentProfile({ data }: { data: EnrichedStudent[] }) {
  const { selectedId, role } = useAppStore();
  const item = useMemo(() => {
    if (!data.length) return undefined;
    if (role === "Alumno") return data[0];          // en real: alumno logueado
    return data.find(d => d.id === selectedId) ?? data[0];
  }, [data, role, selectedId]);

  if (!item) return null;

  return (
    <div className="bg-white border rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold">{item.name}</h3>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
            <span>{item.student_id} • {item.gender} • {item.age} años</span>
            <span>• Asistencia {item.attendance_percentage.toFixed(1)}%</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Pill label={item.segment} />
            <span className="text-xs uppercase text-gray-500">Clase {item.classLabel}</span>
            <span className="text-xs text-gray-500">Score: {item.exam_score}</span>
          </div>
        </div>
        <button className="rounded-xl bg-indigo-600 text-white px-4 py-2 text-sm hover:bg-indigo-700"
                onClick={()=>alert("Acción de intervención (placeholder)")}>
          Intervention
        </button>
      </div>

      <p className="text-sm text-gray-700 mt-3">{explainStudent(item)}</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        <Block title="Hábitos de Estudio" items={[
          ["Motivación", `${item.academic_motivation}/5`],
          ["Gestión del tiempo", `${item.time_management}/5`],
          ["Procrastinación", `${item.procrastination_level}/5`],
          ["Concentración", `${item.focus_level}/5`],
          ["Técnicas de estudio", `${item.study_techniques_usage}/5`],
        ]}/>
        <Block title="Bienestar" items={[
          ["Sueño", `${item.sleep_hours} h`],
          ["Ansiedad examen", `${item.test_anxiety_level}/10`],
          ["Autoeficacia", `${item.academic_self_efficacy}/10`],
          ["Salud mental", `${item.mental_health_rating}/10`],
          ["Ejercicio", `${item.exercise_frequency}/7 d`],
        ]}/>
        <Block title="Contexto" items={[
          ["Asistencia", `${item.attendance_percentage.toFixed(1)}%`],
          ["Trabajo parcial", item.part_time_job ? "Sí" : "No"],
          ["Educación padres", item.parental_education_level],
          ["Internet", item.internet_quality],
          ["Recursos", `${item.study_resources_availability}/5`],
        ]}/>
        <Block title="Entorno de Estudio" items={[
          ["Ambiente en casa", `${item.home_study_environment}/5`],
          ["Estrés financiero", `${item.financial_stress_level}/5`],
          ["Calidad de dieta", `${item.diet_quality}/5`],
        ]}/>
        <Block title="Distracciones / Tiempo" items={[
          ["Estudio", `${item.study_minutes_per_day} min/d`],
          ["Redes sociales", `${item.social_media_minutes} min/d`],
          ["Netflix/TV", `${item.netflix_minutes} min/d`],
        ]}/>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <strong>Ubicación PCA:</strong> ({item.pcaX.toFixed(2)}, {item.pcaY.toFixed(2)}) — punto en el plano 2D tras reducción de dimensiones.
      </div>
    </div>
  );
}

function Block({ title, items }: { title:string; items:[string,string][] }) {
  return (
    <div className="border rounded-xl p-3">
      <div className="text-xs text-gray-500 mb-2">{title}</div>
      <ul className="space-y-1 text-sm">
        {items.map(([k,v]) => <li key={k} className="flex justify-between"><span className="text-gray-600">{k}</span><span className="font-medium">{v}</span></li>)}
      </ul>
    </div>
  );
}
