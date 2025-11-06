// src/components/Profesor/ModalDetailTable.tsx
import  { useEffect, useMemo } from "react";

type Perf = "Insuficiente" | "Satisfactorio" | "Excelente";
type ProbTriple = { Insuficiente: number; Satisfactorio: number; Excelente: number };

type Scenario = {
  name: string;
  pred: Perf;
  probs: ProbTriple; // 0..1
};

type Props = {
  open: boolean;
  onClose: () => void;
  student: Record<string, any>;
  probs: ProbTriple; // 0..1
  pred: Perf;
  scenarios?: Scenario[]; // opcional: para inyectar escenarios externos
};

function chipClass(perf: Perf) {
  switch (perf) {
    case "Insuficiente":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "Satisfactorio":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Excelente":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
}

function Bar({
  value,
  className,
  ariaLabel,
}: {
  value: number;
  className: string;
  ariaLabel?: string;
}) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div
      className="w-full bg-slate-100 rounded h-2"
      role="progressbar"
      aria-valuenow={Number(width.toFixed(1))}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <div
        className={`h-2 rounded transition-[width] duration-300 ${className}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  colorBar,
  colorText,
}: {
  label: string;
  value: number; // 0..100
  colorBar: string;
  colorText: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm">
      <div className={`text-xs font-medium ${colorText} mb-1`}>{label}</div>
      <div className="flex items-center gap-3">
        <Bar value={value} className={colorBar} ariaLabel={label} />
        <span className="text-xs font-semibold text-slate-700 w-14 text-right">
          {value.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

// --------- helpers ---------
function dist(a: ProbTriple, b: ProbTriple) {
  // distancia euclidiana en el simplex I,S,E (trabajamos en 0..1)
  const dx = a.Insuficiente - b.Insuficiente;
  const dy = a.Satisfactorio - b.Satisfactorio;
  const dz = a.Excelente - b.Excelente;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
// ---------------------------

export default function ModalDetailTable({
  open,
  onClose,
  student,
  probs,
  pred,
  scenarios,
}: Props) {
  // 1) Hooks SIEMPRE arriba (para evitar "Rendered fewer hooks...")
  // Bloquea scroll y ESC para cerrar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", onKey);
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = original;
      };
    }
  }, [open, onClose]);

  // Probabilidades en %
  const pct = useMemo(
    () => ({
      I: probs.Insuficiente * 100,
      S: probs.Satisfactorio * 100,
      E: probs.Excelente * 100,
    }),
    [probs]
  );

  // Escenarios base si no vienen por props
  const baseScenarios: Scenario[] = useMemo(
    () => [
      {
        name: "Escenario Excelente (4 evidencias)",
        pred: "Excelente",
        probs: { Insuficiente: 0.0113, Satisfactorio: 0.1786, Excelente: 0.8101 },
      },
      {
        name:
          "Escenario Riesgo (motivación limitada, foco disperso, cortas, irregular, básico)",
        pred: "Insuficiente",
        probs: { Insuficiente: 0.8499, Satisfactorio: 0.1269, Excelente: 0.0232 },
      },
      {
        name: "Escenario Intermedio (regular/adecuadas/basico)",
        pred: "Satisfactorio",
        probs: { Insuficiente: 0.0132, Satisfactorio: 0.7142, Excelente: 0.2725 },
      },
      {
        name: "Escenario Mejora (adecuadas/regular/normal)",
        pred: "Satisfactorio",
        probs: { Insuficiente: 0.009, Satisfactorio: 0.4989, Excelente: 0.4921 },
      },
      {
        name: "Escenario Riesgo Mixto (insuficiente, cortas, regular, básico)",
        pred: "Satisfactorio",
        probs: { Insuficiente: 0.3086, Satisfactorio: 0.5049, Excelente: 0.1866 },
      },
    ],
    []
  );

  // Elegir 1 "caso asignado" más cercano a las probabilidades del alumno
  const assignedCase = useMemo(() => {
    const pool = scenarios && scenarios.length ? scenarios : baseScenarios;
    let best = pool[0];
    let bestD = Infinity;
    for (const sc of pool) {
      const d = dist(probs, sc.probs);
      if (d < bestD) {
        best = sc;
        bestD = d;
      }
    }
    return best;
  }, [probs, scenarios, baseScenarios]);

  // Avatar por iniciales
  const name = student.name ?? student.student_id ?? student.id ?? "Estudiante";
  const initials = String(name)
    .split(" ")
    .map((p: string) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // 2) Ahora sí puedes cortar si no está abierto (después de los hooks)
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
        className="relative z-10 w-full max-w-4xl mx-3 sm:mx-6 bg-white rounded-2xl shadow-2xl border overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-200 grid place-items-center font-semibold text-slate-700">
              {initials}
            </div>
            <div>
              <h3
                id="student-modal-title"
                className="text-base sm:text-lg font-semibold text-slate-900"
              >
                {String(name)}
              </h3>
              {student.student_id && (
                <div className="text-xs text-slate-500">ID: {student.student_id}</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs px-2 py-1 rounded-full border ${chipClass(pred)}`}
              title="Pronóstico actual"
            >
              {pred}
            </span>
            <button
              onClick={onClose}
              className="px-2 py-1 text-sm border rounded-lg bg-white hover:bg-slate-100 active:scale-[0.98] transition"
              aria-label="Cerrar"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Body (scroll interno) */}
        <div className="max-h-[90vh] overflow-y-auto px-4 sm:px-6 py-5 space-y-6">
          {/* Probabilidades actuales */}
          <section>
            <div className="text-sm font-semibold text-slate-800 mb-3">
              Probabilidades del alumno
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <StatCard
                label="Insuficiente"
                value={pct.I}
                colorBar="bg-rose-500"
                colorText="text-rose-700"
              />
              <StatCard
                label="Satisfactorio"
                value={pct.S}
                colorBar="bg-amber-500"
                colorText="text-amber-700"
              />
              <StatCard
                label="Excelente"
                value={pct.E}
                colorBar="bg-emerald-500"
                colorText="text-emerald-700"
              />
            </div>
          </section>

          {/* Datos del alumno */}
          <section>
            <div className="text-sm font-semibold text-slate-800 mb-3">
              Datos del alumno
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {"exam_score" in student && (
                <div className="p-3 rounded-xl border bg-white shadow-sm">
                  <div className="text-xs text-slate-500">Exam Score</div>
                  <div className="font-medium text-slate-800">{student.exam_score}</div>
                </div>
              )}
              {"attendance_percentage" in student && (
                <div className="p-3 rounded-xl border bg-white shadow-sm">
                  <div className="text-xs text-slate-500">Asistencia</div>
                  <div className="font-medium text-slate-800">
                    {student.attendance_percentage}%
                  </div>
                </div>
              )}
              {"sleep_hours" in student && (
                <div className="p-3 rounded-xl border bg-white shadow-sm">
                  <div className="text-xs text-slate-500">Horas de sueño</div>
                  <div className="font-medium text-slate-800">{student.sleep_hours}</div>
                </div>
              )}
              {"study_minutes_per_day" in student && (
                <div className="p-3 rounded-xl border bg-white shadow-sm">
                  <div className="text-xs text-slate-500">Estudio (min/día)</div>
                  <div className="font-medium text-slate-800">
                    {student.study_minutes_per_day}
                  </div>
                </div>
              )}
              {"social_media_minutes" in student && (
                <div className="p-3 rounded-xl border bg-white shadow-sm">
                  <div className="text-xs text-slate-500">Redes (min/día)</div>
                  <div className="font-medium text-slate-800">
                    {student.social_media_minutes}
                  </div>
                </div>
              )}
              {"netflix_minutes" in student && (
                <div className="p-3 rounded-xl border bg-white shadow-sm">
                  <div className="text-xs text-slate-500">Streaming (min/día)</div>
                  <div className="font-medium text-slate-800">
                    {student.netflix_minutes}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Caso asignado (1 solo) */}
          <section>
            <div className="text-sm font-semibold text-slate-800 mb-3">
              Caso asignado según probabilidades
            </div>
            <div className="rounded-2xl border bg-white p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Caso</div>
                  <div className="text-xs text-slate-600">{assignedCase.name}</div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full border ${chipClass(
                    assignedCase.pred
                  )}`}
                >
                  {assignedCase.pred}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-28 text-xs text-rose-700">
                    Insuficiente {(assignedCase.probs.Insuficiente * 100).toFixed(2)}%
                  </div>
                  <Bar
                    value={assignedCase.probs.Insuficiente * 100}
                    className="bg-rose-500"
                    ariaLabel="Insuficiente (caso asignado)"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-28 text-xs text-amber-700">
                    Satisfactorio {(assignedCase.probs.Satisfactorio * 100).toFixed(2)}%
                  </div>
                  <Bar
                    value={assignedCase.probs.Satisfactorio * 100}
                    className="bg-amber-500"
                    ariaLabel="Satisfactorio (caso asignado)"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-28 text-xs text-emerald-700">
                    Excelente {(assignedCase.probs.Excelente * 100).toFixed(2)}%
                  </div>
                  <Bar
                    value={assignedCase.probs.Excelente * 100}
                    className="bg-emerald-500"
                    ariaLabel="Excelente (caso asignado)"
                  />
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              * El caso se selecciona por cercanía (distancia euclidiana) entre las
              probabilidades del alumno (Insuficiente/Satisfactorio/Excelente) y
              los escenarios predefinidos.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
