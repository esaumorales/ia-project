import  { useEffect, useMemo } from "react";

type Perf = "Insuficiente" | "Satisfactorio" | "Excelente";

type Scenario = {
  name: string;
  pred: Perf;
  probs: { Insuficiente: number; Satisfactorio: number; Excelente: number }; // 0..1
};

type Props = {
  open: boolean;
  onClose: () => void;
  student: Record<string, any>;
  probs: { Insuficiente: number; Satisfactorio: number; Excelente: number };
  pred: Perf;
  scenarios?: Scenario[];
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

export default function ModalDetailTable({
  open,
  onClose,
  student,
  probs,
  pred,
  scenarios = [],
}: Props) {
  // salir con ESC y bloquear scroll de fondo mientras está abierto
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [open, onClose]);

  if (!open) return null;

  const name =
    student.name ?? student.student_id ?? student.id ?? "Estudiante";

  const pct = useMemo(
    () => ({
      I: probs.Insuficiente * 100,
      S: probs.Satisfactorio * 100,
      E: probs.Excelente * 100,
    }),
    [probs]
  );

  // avatar por iniciales
  const initials = String(name)
    .split(" ")
    .map((p: string) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
              title="Pronóstico"
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
                  <div className="font-medium text-slate-800">
                    {student.exam_score}
                  </div>
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
                  <div className="font-medium text-slate-800">
                    {student.sleep_hours}
                  </div>
                </div>
              )}
              {"study_minutes_per_day" in student && (
                <div className="p-3 rounded-xl border bg-white shadow-sm">
                  <div className="text-xs text-slate-500">
                    Estudio (min/día)
                  </div>
                  <div className="font-medium text-slate-800">
                    {student.study_minutes_per_day}
                  </div>
                </div>
              )}
              {"social_media_minutes" in student && (
                <div className="p-3 rounded-xl border bg-white shadow-sm">
                  <div className="text-xs text-slate-500">
                    Redes (min/día)
                  </div>
                  <div className="font-medium text-slate-800">
                    {student.social_media_minutes}
                  </div>
                </div>
              )}
              {"netflix_minutes" in student && (
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

          {/* Escenarios (comparativa) */}
          {!!scenarios.length && (
            <section>
              <div className="text-sm font-semibold text-slate-800 mb-3">
                Escenarios (comparativa)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scenarios.map((sc, idx) => {
                  const pI = sc.probs.Insuficiente * 100;
                  const pS = sc.probs.Satisfactorio * 100;
                  const pE = sc.probs.Excelente * 100;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border bg-white p-4 shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            Caso {idx + 1}
                          </div>
                          <div className="text-xs text-slate-600">
                            {sc.name}
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full border ${chipClass(
                            sc.pred
                          )}`}
                        >
                          {sc.pred}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-28 text-xs text-rose-700">
                            Insuficiente {pI.toFixed(2)}%
                          </div>
                          <Bar
                            value={pI}
                            className="bg-rose-500"
                            ariaLabel={`Insuficiente caso ${idx + 1}`}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-28 text-xs text-amber-700">
                            Satisfactorio {pS.toFixed(2)}%
                          </div>
                          <Bar
                            value={pS}
                            className="bg-amber-500"
                            ariaLabel={`Satisfactorio caso ${idx + 1}`}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-28 text-xs text-emerald-700">
                            Excelente {pE.toFixed(2)}%
                          </div>
                          <Bar
                            value={pE}
                            className="bg-emerald-500"
                            ariaLabel={`Excelente caso ${idx + 1}`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                * Escenarios basados en tus resultados de laboratorio. Si luego
                expones un endpoint, puedes calcularlos en tiempo real y
                reemplazar esta sección.
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
