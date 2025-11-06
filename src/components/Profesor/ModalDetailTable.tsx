import { useEffect, useMemo } from 'react';

type Perf = 'Insuficiente' | 'Satisfactorio' | 'Excelente';

type Props = {
  open: boolean;
  onClose: () => void;
  student: Record<string, any>;
  pred: Perf;
  probs?: { Insuficiente: number; Satisfactorio: number; Excelente: number };
  scenarios?: {
    name: string;
    pred: Perf;
    probs: { Insuficiente: number; Satisfactorio: number; Excelente: number };
  }[];
};

/* ------------------ UI helpers ------------------ */
function chipClass(perf: Perf) {
  switch (perf) {
    case 'Insuficiente':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'Satisfactorio':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Excelente':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
}

/* ------------------ explicación heurística ------------------ */
function buildReport(student: Record<string, any>, pred: Perf) {
  const s = student;

  const strengths: string[] = [];
  const risks: string[] = [];
  const actions: string[] = [];

  const num = (v: any) =>
    typeof v === 'number' && Number.isFinite(v) ? v : undefined;

  const sleep = num(s.sleep_hours);
  const att = num(s.attendance_percentage);
  const study = num(s.study_minutes_per_day);
  const social = num(s.social_media_minutes);
  const netflix = num(s.netflix_minutes);
  const tm = num(s.time_management);
  const mot = num(s.academic_motivation);
  const eff = num(s.academic_self_efficacy);
  const anx = num(s.test_anxiety_level);
  const foc = num(s.focus_level);
  const procrast = num(s.procrastination_level);
  const mh = num(s.mental_health_rating);

  // Fortalezas
  if (att !== undefined && att >= 90)
    strengths.push('asistencia constante (≥ 90%)');
  if (sleep !== undefined && sleep >= 7)
    strengths.push('higiene del sueño adecuada (≥ 7 h)');
  if (study !== undefined && study >= 150)
    strengths.push('buen volumen de estudio (≥ 150 min/día)');
  if (tm !== undefined && tm >= 4) strengths.push('buena gestión del tiempo');
  if (mot !== undefined && mot >= 4)
    strengths.push('motivación académica alta');
  if (eff !== undefined && eff >= 7)
    strengths.push('autoeficacia académica elevada');
  if (foc !== undefined && foc >= 4)
    strengths.push('buen nivel de foco durante el estudio');
  if (mh !== undefined && mh >= 7)
    strengths.push('salud mental percibida como alta');

  // Riesgos
  if (att !== undefined && att < 75) risks.push('asistencia baja (< 75%)');
  if (sleep !== undefined && sleep < 6)
    risks.push('pocas horas de sueño (< 6 h)');
  if (study !== undefined && study < 90)
    risks.push('poco tiempo de estudio (< 90 min/día)');
  if (social !== undefined && social >= 180)
    risks.push('uso intensivo de redes (≥ 180 min/día)');
  if (netflix !== undefined && netflix >= 120)
    risks.push('mucho tiempo en streaming (≥ 120 min/día)');
  if (tm !== undefined && tm <= 2)
    risks.push('gestión del tiempo deficiente (≤ 2/5)');
  if (procrast !== undefined && procrast >= 4)
    risks.push('procrastinación elevada (≥ 4/5)');
  if (mot !== undefined && mot <= 2) risks.push('motivación limitada (≤ 2/5)');
  if (eff !== undefined && eff <= 4) risks.push('baja autoeficacia (≤ 4/10)');
  if (anx !== undefined && anx >= 7)
    risks.push('ansiedad ante exámenes alta (≥ 7/10)');
  if (foc !== undefined && foc <= 2)
    risks.push('dificultad para sostener el foco (≤ 2/5)');
  if (mh !== undefined && mh <= 4)
    risks.push('salud mental percibida como delicada (≤ 4/10)');

  // Acciones recomendadas
  if (sleep !== undefined && sleep < 7)
    actions.push(
      'Ajustar rutina de sueño hasta 7–8 h con hora fija de inicio.'
    );
  if (study !== undefined && study < 150)
    actions.push(
      'Planificar 2–3 bloques Pomodoro de 50 min/día con pausas activas.'
    );
  if (tm !== undefined && tm <= 3)
    actions.push(
      'Usar agenda visual (Trello/Google Calendar) y priorizar tareas por impacto.'
    );
  if (social !== undefined && social >= 180)
    actions.push('Limitar redes a 2×15 min/día (temporizador).');
  if (netflix !== undefined && netflix >= 120)
    actions.push('Reservar streaming para después del estudio (≤ 60 min/día).');
  if (procrast !== undefined && procrast >= 4)
    actions.push('Iniciar con ‘tarea mínima’ de 5 min para romper la inercia.');
  if (anx !== undefined && anx >= 7)
    actions.push('Respiración 4-7-8 y simulacros para regular la ansiedad.');
  if (mot !== undefined && mot <= 3)
    actions.push('Definir objetivo semanal medible y premiar el avance.');
  if (eff !== undefined && eff <= 6)
    actions.push('Llevar log de estudio para reforzar autoeficacia.');

  // Resumen según pred
  const headline =
    pred === 'Excelente'
      ? 'Perfil con hábitos sólidos y alta probabilidad de rendimiento excelente.'
      : pred === 'Satisfactorio'
      ? 'Perfil equilibrado: hay bases correctas y oportunidades claras de mejora.'
      : 'Perfil en riesgo: varios hábitos críticos están afectando el desempeño.';

  return { headline, strengths, risks, actions };
}

/* -------- contexto breve debajo del header -------- */
function buildContext(student: Record<string, any>, pred: Perf) {
  const s = student;
  const parts: string[] = [];

  const num = (v: any) =>
    typeof v === 'number' && Number.isFinite(v) ? v : undefined;
  const att = num(s.attendance_percentage);
  const sleep = num(s.sleep_hours);
  const study = num(s.study_minutes_per_day);
  const social = num(s.social_media_minutes);
  const anx = num(s.test_anxiety_level);
  const tm = num(s.time_management);
  const mot = num(s.academic_motivation);

  parts.push(`El/la estudiante presenta un pronóstico ${pred.toLowerCase()}`);

  const causes: string[] = [];
  if (att !== undefined) {
    if (att >= 90) causes.push('asistencia consistente');
    else if (att < 75) causes.push('asistencia irregular');
  }
  if (sleep !== undefined) {
    if (sleep >= 7) causes.push('sueño suficiente');
    else if (sleep < 6) causes.push('pocas horas de sueño');
  }
  if (study !== undefined) {
    if (study >= 150) causes.push('buen tiempo de estudio');
    else if (study < 90) causes.push('bajo tiempo de estudio');
  }
  if (tm !== undefined) {
    if (tm >= 4) causes.push('gestión del tiempo adecuada');
    else if (tm <= 2) causes.push('gestión del tiempo limitada');
  }
  if (mot !== undefined) {
    if (mot >= 4) causes.push('motivación alta');
    else if (mot <= 2) causes.push('motivación baja');
  }
  if (social !== undefined && social >= 180)
    causes.push('uso intensivo de redes');
  if (anx !== undefined && anx >= 7)
    causes.push('ansiedad elevada en exámenes');

  if (causes.length) {
    parts.push(`debido a ${causes.slice(0, 3).join(', ')}.`);
  } else {
    parts.push('en base a sus hábitos y señales recientes.');
  }

  return parts.join(', ') + (parts[parts.length - 1].endsWith('.') ? '' : '.');
}

/* ========================================================= */
export default function ModalDetailTable({
  open,
  onClose,
  student,
  pred,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', onKey);
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = original;
      };
    }
  }, [open, onClose]);

  const name = student.name ?? student.student_id ?? student.id ?? 'Estudiante';
  const initials = String(name)
    .split(' ')
    .map((p: string) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const report = useMemo(() => buildReport(student, pred), [student, pred]);
  const contextLine = useMemo(
    () => buildContext(student, pred),
    [student, pred]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
      />
      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-modal-title"
        className="relative z-10 w-full max-w-4xl mx-3 sm:mx-6 bg-white rounded-2xl shadow-2xl border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-200 grid place-items-center font-semibold text-slate-700">
              {initials}
            </div>
            <div>
              <h3
                id="student-modal-title"
                className="text-base sm:text-lg font-semibold text-slate-900">
                {String(name)}
              </h3>
              {student.student_id && (
                <div className="text-xs text-slate-500">
                  ID: {student.student_id}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs px-2 py-1 rounded-full border ${chipClass(
                pred
              )}`}
              title="Pronóstico actual">
              {pred}
            </span>
            <button
              onClick={onClose}
              className="px-2 py-1 text-sm border rounded-lg bg-white hover:bg-slate-100 active:scale-[0.98] transition"
              aria-label="Cerrar">
              Cerrar
            </button>
          </div>
        </div>

        {/* Contexto breve debajo del header */}
        <div className="px-4 sm:px-6 py-3 border-b bg-white">
          <p className="text-sm text-slate-700">{contextLine}</p>
        </div>

        {/* Body (scroll interno) */}
        <div className="max-h-[90vh] overflow-y-auto px-4 sm:px-6 py-5 space-y-6">
          {/* Datos del alumno */}
          <section>
            <div className="text-sm font-semibold text-slate-800 mb-1">
              Datos del alumno
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {'exam_score' in student && (
                <div className="p-3 rounded-xl border bg-white shadow-sm">
                  <div className="text-xs text-slate-500">Exam Score</div>
                  <div className="font-medium text-slate-800">
                    {student.exam_score}
                  </div>
                </div>
              )}
              {'attendance_percentage' in student && (
                <div className="p-3 rounded-xl border bg-white shadow-sm">
                  <div className="text-xs text-slate-500">Asistencia</div>
                  <div className="font-medium text-slate-800">
                    {student.attendance_percentage}%
                  </div>
                </div>
              )}
              {'sleep_hours' in student && (
                <div className="p-3 rounded-xl border bg-white shadow-sm">
                  <div className="text-xs text-slate-500">Horas de sueño</div>
                  <div className="font-medium text-slate-800">
                    {student.sleep_hours}
                  </div>
                </div>
              )}
              {'study_minutes_per_day' in student && (
                <div className="p-3 rounded-xl border bg-white shadow-sm">
                  <div className="text-xs text-slate-500">
                    Estudio (min/día)
                  </div>
                  <div className="font-medium text-slate-800">
                    {student.study_minutes_per_day}
                  </div>
                </div>
              )}
              {'social_media_minutes' in student && (
                <div className="p-3 rounded-xl border bg-white shadow-sm">
                  <div className="text-xs text-slate-500">Redes (min/día)</div>
                  <div className="font-medium text-slate-800">
                    {student.social_media_minutes}
                  </div>
                </div>
              )}
              {'netflix_minutes' in student && (
                <div className="p-3 rounded-xl border bg-white shadow-sm">
                  <div className="text-xs text-slate-500">
                    Streaming (min/día)
                  </div>
                  <div className="font-medium text-slate-800">
                    {student.netflix_minutes}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Reporte narrativo */}
          <section>
            <div className="text-sm font-semibold text-slate-800 mb-2">
              Reporte
            </div>
            <div className="rounded-2xl border bg-white p-4 shadow-sm space-y-4l">
              <p className="text-sm text-slate-800">{report.headline}</p>
              <div className="flex justify-between my-2">
                <div>
                  {!!report.strengths.length && (
                    <div>
                      <div className="text-xs font-semibold text-emerald-700 mb-1">
                        Fortalezas
                      </div>
                      <ul className="list-disc pl-5 text-sm text-slate-800 space-y-1">
                        {report.strengths.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div>
                  {!!report.risks.length && (
                    <div>
                      <div className="text-xs font-semibold text-rose-700 mb-1">
                        Riesgos / señales a vigilar
                      </div>
                      <ul className="list-disc pl-5 text-sm text-slate-800 space-y-1">
                        {report.risks.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div>
                  {!!report.actions.length && (
                    <div>
                      <div className="text-xs font-semibold text-sky-700 mb-1">
                        Acciones recomendadas (7–14 días)
                      </div>
                      <ul className="list-disc pl-5 text-sm text-slate-800 space-y-1">
                        {report.actions.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
