import { useMemo, useState } from 'react';
import type { EnrichedStudent } from '../../shared/types';
import { useAppStore } from '../../shared/store';
import { explainStudent } from '../../shared/analytics';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';

// Colores para CLUSTERS (0..2) consistentes con la leyenda
const clusterColor = (c: number) =>
  c === 0 ? 'bg-indigo-100 text-indigo-700 ring-indigo-200'
  : c === 1 ? 'bg-rose-100 text-rose-700 ring-rose-200'
  :          'bg-amber-100 text-amber-800 ring-amber-200';

// Colores para SEGMENTOS (Good / Average / Needs Support)
function badgeForSegment(seg: EnrichedStudent['segment']) {
  return seg === 'Good'
    ? 'bg-emerald-100 text-emerald-700'
    : seg === 'Average'
    ? 'bg-amber-100 text-amber-700'
    : 'bg-rose-100 text-rose-700'; // Needs Support
}

function humanSegment(s: EnrichedStudent) {
  return s.segment === 'Good'
    ? 'Estudiantes comprometidos y activos'
    : s.segment === 'Average'
    ? 'Estudiantes con participación intermitente'
    : 'Estudiantes con menor dedicación actual'; // Needs Support
}

export default function StudentDetailModal({
  allData,
}: {
  allData: EnrichedStudent[];
}) {
  const { isDetailOpen, setDetailOpen, selectedId } = useAppStore();
  const [showConfirm, setShowConfirm] = useState(false);

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
    const th = unit.includes('%') ? 5 : unit.includes('h') ? 0.5 : 20;
    const tag = abs >= th ? (diff > 0 ? '↑' : '↓') : '≈';
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
      <button
        className="absolute inset-0 bg-black/40"
        onClick={() => setDetailOpen(false)}
        aria-label="Cerrar modal"
      />
      {/* modal */}
      <div className="absolute inset-0 flex items-start justify-center overflow-auto p-4">
        <div className="mt-8 w-full max-w-3xl rounded-[8px] border border-gray-300 bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-300 px-5 py-4">
            <div>
              <div className="text-xl font-semibold">{student.name}</div>
              <div className="text-xs text-gray-500">
                {student.student_id} • {student.gender} • {student.age} años
              </div>
            </div>
            <button
              className="rounded-md p-1 hover:bg-gray-50"
              onClick={() => setDetailOpen(false)}
              aria-label="Cerrar"
            >
              <Icon icon="material-symbols-light:close-rounded" width="24" height="24" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5">
            {/* Chips: Segmento + Cluster + Score */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${badgeForSegment(student.segment)}`}>
                {humanSegment(student)}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full ring-1 ${clusterColor(student.cluster)}`}
                title="Cluster asignado (k=3)"
              >
                Cluster {student.cluster}
              </span>
              <span className="text-xs text-gray-500">
                Score: {student.exam_score.toFixed(1)}
              </span>
            </div>

            <p className="mb-4 text-sm text-gray-700">
              {explainStudent(student)}
            </p>

            {/* Bloques de detalle */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Block
                title="Académicas"
                items={[
                  ['Punt. Examen', student.exam_score.toFixed(1)],
                  ['Asistencia', `${student.attendance_percentage.toFixed(1)}%`],
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
                  ['Sueño', `${student.sleep_hours.toFixed(1)} h`],
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

            {/* Resumen comparado con el promedio */}
            {averages && (
              <div className="mt-5 rounded-[4px] bg-gray-50 p-4 shadow-sm">
                <div className="mb-2 font-medium">Resumen del Perfil</div>
                <p className="text-sm text-gray-700">
                  {trendText('Estudio', student.study_minutes_per_day, averages.study, 'min/día')}
                  ,{' '}
                  {trendText('asistencia', student.attendance_percentage, averages.attendance, '%')}
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

          {/* Footer */}
          <div className="flex justify-end px-5 pb-5">
            <button
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white transition hover:bg-indigo-700"
              onClick={() => setShowConfirm(true)}
            >
              Intervention
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      <ConfirmModal open={showConfirm} onClose={() => setShowConfirm(false)} />
    </div>
  );
}

function ConfirmModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="mx-4 w-full max-w-sm rounded-2xl border bg-white p-6 text-center shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.35 }}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <Icon icon="mdi:check" className="text-emerald-600" width="24" height="24" />
            </div>
            <h3 className="mt-3 text-lg font-semibold text-gray-800">Intervención aceptada</h3>
            <p className="mt-1 text-sm text-gray-600">
              Se registró la intervención para este estudiante. Puedes hacer seguimiento en la
              sección de reportes.
            </p>
            <div className="mt-5 flex justify-center">
              <button
                onClick={onClose}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white transition hover:bg-indigo-700"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Block({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div className="rounded-md border border-gray-300 p-3 shadow-sm">
      <div className="mb-2 text-xs text-gray-500">{title}</div>
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
