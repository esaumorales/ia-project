import { useMemo } from 'react';
import type { EnrichedStudent } from '../shared/types';
import { useAppStore } from '../shared/store';
import { explainStudent } from '../shared/analytics';
import { Icon } from '@iconify/react';

export default function StudentDetailModal({
  allData,
}: {
  allData: EnrichedStudent[];
}) {
  const { isDetailOpen, setDetailOpen, selectedId } = useAppStore();
  const student = allData.find((s) => s.id === selectedId);

  const averages = useMemo(() => {
    if (!allData.length) return null;
    const f = <K extends keyof EnrichedStudent>(k: K) =>
      allData.reduce((acc, r) => acc + (r[k] as number), 0) / allData.length;

    return {
      study: f('study_minutes_per_day'),
      social: f('social_media_minutes'),
      netflix: f('netflix_minutes'),
      attendance: f('attendance_percentage'),
      sleep: f('sleep_hours'),
    };
  }, [allData]);

  if (!isDetailOpen || !student) return null;

  const trendText = (label: string, v: number, avg: number, unit: string) => {
    const diff = v - avg;
    const abs = Math.abs(diff);
    let tag = '≈';
    if (abs >= (unit.includes('%') ? 5 : unit.includes('h') ? 0.5 : 20)) {
      tag = diff > 0 ? '↑' : '↓';
    }
    const fmt = unit.includes('h')
      ? v.toFixed(1)
      : unit.includes('%')
      ? v.toFixed(1)
      : v.toFixed(0);
    return `${label} ${fmt} ${unit} (${tag} vs media)`;
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setDetailOpen(false)}
      />
      {/* modal */}
      <div className="absolute inset-0 flex items-start justify-center overflow-auto p-4">
        <div className="w-full max-w-3xl bg-white rounded-[8px] shadow-xl border border-gray-300 mt-8">
          <div className="flex items-center justify-between px-5 py-4 border-b-gray-300 border-b">
            <div>
              <div className="text-xl font-semibold">{student.name}</div>
              <div className="text-xs text-gray-500">
                {student.student_id} • {student.gender} • {student.age} años
              </div>
            </div>
            <button
              className="hover:shadow-gray-100 hover:shadow-sm animate-spin"
              onClick={() => setDetailOpen(false)}
              aria-label="Cerrar">
              <Icon
                icon="material-symbols-light:close-rounded"
                width="24"
                height="24"
              />
            </button>
          </div>

          <div className="p-5">
            <div className="inline-flex items-center gap-2 mb-3">
              <span
                className={`text-xs px-2 py-1 rounded-full ${badgeForSegment(
                  student.segment
                )}`}>
                {humanSegment(student)}
              </span>
              <span className="text-xs text-gray-500">
                Score: {student.exam_score}
              </span>
            </div>

            <p className="text-sm text-gray-700 mb-4">
              {explainStudent(student)}
            </p>

            {/* Bloques de detalle */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Block
                title="Académicas"
                items={[
                  ['Punt. Examen', student.exam_score.toFixed(1)],
                  [
                    'Asistencia',
                    `${student.attendance_percentage.toFixed(1)}%`,
                  ],
                  ['Motivación', `${student.academic_motivation}/5`],
                  ['Autoeficacia', `${student.academic_self_efficacy}/10`],
                ]}
              />
              <Block
                title="Hábitos"
                items={[
                  ['Estudio', `${student.study_minutes_per_day} min/d`],
                  ['Tiempo', `${student.time_management}/5`],
                  ['Concentración', `${student.focus_level}/5`],
                  ['Técnicas', `${student.study_techniques_usage}/5`],
                ]}
              />
              <Block
                title="Bienestar"
                items={[
                  ['Sueño', `${student.sleep_hours} h`],
                  ['Ansiedad', `${student.test_anxiety_level}/10`],
                  ['Salud mental', `${student.mental_health_rating}/10`],
                  ['Ejercicio', `${student.exercise_frequency}/7`],
                ]}
              />
              <Block
                title="Contexto"
                items={[
                  ['Trabajo parcial', student.part_time_job ? 'Sí' : 'No'],
                  ['Educación padres', student.parental_education_level],
                  ['Internet', student.internet_quality],
                  ['Recursos', `${student.study_resources_availability}/5`],
                ]}
              />
              <Block
                title="Entorno"
                items={[
                  ['Casa', `${student.home_study_environment}/5`],
                  ['Estrés fin.', `${student.financial_stress_level}/5`],
                  ['Dieta', `${student.diet_quality}/5`],
                ]}
              />
              <Block
                title="Distracciones"
                items={[
                  ['Redes', `${student.social_media_minutes} min/d`],
                  ['Netflix', `${student.netflix_minutes} min/d`],
                  ['Procrastinación', `${student.procrastination_level}/5`],
                ]}
              />
            </div>

            {/* Resumen textual */}
            {averages && (
              <div className="mt-5 rounded-[4px] bg-gray-30  p-4 shadow-sm">
                <div className="font-medium mb-2">Resumen del Perfil</div>
                <p className="text-sm text-gray-700">
                  {trendText(
                    'Estudio',
                    student.study_minutes_per_day,
                    averages.study,
                    'min/día'
                  )}
                  ,{' '}
                  {trendText(
                    'asistencia',
                    student.attendance_percentage,
                    averages.attendance,
                    '%'
                  )}
                  ,{' '}
                  {trendText(
                    'distracciones',
                    student.social_media_minutes + student.netflix_minutes,
                    averages.social + averages.netflix,
                    'min/día'
                  )}
                  ,{' '}
                  {trendText('sueño', student.sleep_hours, averages.sleep, 'h')}
                  . Categoría: {humanSegment(student)}.
                </p>
              </div>
            )}
          </div>

          <div className="px-5 pb-5 flex justify-end">
            <button
              className="rounded-xl bg-indigo-600 text-white px-4 py-2 text-sm hover:bg-indigo-700"
              onClick={() => alert('Intervention (placeholder)')}>
              Intervention
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Block({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div className=" border-gray-300 shadow-sm p-3">
      <div className="text-xs text-gray-500 mb-2">{title}</div>
      <ul className="space-y-1 text-sm">
        {items.map(([k, v]) => (
          <li key={k} className="flex justify-between">
            <span className="text-gray-600">{k}</span>
            <span className="font-medium">{v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function badgeForSegment(seg: EnrichedStudent['segment']) {
  return seg === 'Good'
    ? 'bg-emerald-100 text-emerald-700'
    : seg === 'Average'
    ? 'bg-amber-100 text-amber-700'
    : 'bg-rose-100 text-rose-700';
}

function humanSegment(s: EnrichedStudent) {
  // Descripciones breves, sin “Cluster”
  return s.segment === 'Good'
    ? 'Estudiantes comprometidos y activos'
    : s.segment === 'Average'
    ? 'Estudiantes con participación intermitente'
    : 'Estudiantes con menor dedicación actual';
}
