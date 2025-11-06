// src/components/Profesor/RNA.tsx
import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card/card";
import ModalDetailTable from "./ModalDetailTable";

type AnyRecord = Record<string, any>;
type Perf = "Insuficiente" | "Satisfactorio" | "Excelente";

const DEFAULT_NUMERIC_FEATURES = [
  "attendance_percentage",
  "sleep_hours",
  "test_anxiety_level",
  "financial_stress_level",
  "time_management",
  "procrastination_level",
  "academic_motivation",
  "academic_self_efficacy",
  "focus_level",
  "study_minutes_per_day",
  "social_media_minutes",
  "netflix_minutes",
];

function isNum(v: any): v is number {
  return typeof v === "number" && Number.isFinite(v);
}
function makeDiscretizer(values: (number | null | undefined)[], k = 3) {
  const nums = values.filter(isNum) as number[];
  if (!nums.length) return { cuts: [] as number[], bin: (_: any) => "bin:NA" };
  const sorted = [...nums].sort((a, b) => a - b);
  const cuts: number[] = [];
  for (let i = 1; i < k; i++) {
    const idx = Math.floor((i * sorted.length) / k);
    cuts.push(sorted[Math.min(idx, sorted.length - 1)]);
  }
  const bin = (v: number | null | undefined) => {
    if (!isNum(v)) return "bin:NA";
    let b = 0;
    while (b < cuts.length && v > cuts[b]) b++;
    return `bin:${b}`;
  };
  return { cuts, bin };
}
function normalizeLabel(val: any): Perf | null {
  if (val == null) return null;
  const s = String(val).toLowerCase().trim();
  if (["low", "insuficiente"].includes(s)) return "Insuficiente";
  if (["mid", "medio", "satisfactorio", "satisfactoria"].includes(s))
    return "Satisfactorio";
  if (["high", "alto", "excelente"].includes(s)) return "Excelente";
  return null;
}
function labelFromScore(score?: number): Perf | null {
  if (!isNum(score)) return null;
  if (score < 60) return "Insuficiente";
  if (score <= 85) return "Satisfactorio";
  return "Excelente";
}
function chipClass(perf: Perf) {
  switch (perf) {
    case "Insuficiente":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "Satisfactorio":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "Excelente":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }
}

export default function RNA({
  data,
  labelKeyCandidates = ["AcademicPerformance", "classLabel"],
}: {
  data: AnyRecord[];
  labelKeyCandidates?: string[];
}) {
  // paginación
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  // modal
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<null | {
    row: AnyRecord;
    probs: { Insuficiente: number; Satisfactorio: number; Excelente: number };
    pred: Perf;
  }>(null);

  // escenarios demo (tus números)
  const scenarios = [
    {
      name: "Escenario Excelente (4 evidencias)",
      pred: "Excelente" as Perf,
      probs: { Insuficiente: 0.0113, Satisfactorio: 0.1786, Excelente: 0.8101 },
    },
    {
      name:
        "Escenario Riesgo (motivación limitada, foco disperso, cortas, irregular, básico)",
      pred: "Insuficiente" as Perf,
      probs: { Insuficiente: 0.8499, Satisfactorio: 0.1269, Excelente: 0.0232 },
    },
    {
      name: "Escenario Intermedio (regular/adecuadas/basico)",
      pred: "Satisfactorio" as Perf,
      probs: { Insuficiente: 0.0132, Satisfactorio: 0.7142, Excelente: 0.2725 },
    },
    {
      name: "Escenario Mejora (adecuadas/regular/normal)",
      pred: "Satisfactorio" as Perf,
      probs: { Insuficiente: 0.0090, Satisfactorio: 0.4989, Excelente: 0.4921 },
    },
    {
      name: "Escenario Riesgo Mixto (insuficiente, cortas, regular, básico)",
      pred: "Satisfactorio" as Perf,
      probs: { Insuficiente: 0.3086, Satisfactorio: 0.5049, Excelente: 0.1866 },
    },
  ];

  // columnas y etiqueta
  const features = useMemo(() => {
    if (!data?.length) return [] as string[];
    const present = new Set(Object.keys(data[0]));
    return DEFAULT_NUMERIC_FEATURES.filter((f) => present.has(f));
  }, [data]);
  const labelKey = useMemo(() => {
    if (!data?.length) return null as string | null;
    for (const k of labelKeyCandidates) if (k in data[0]) return k;
    return null;
  }, [data, labelKeyCandidates]);

  // entrenar NB
  const model = useMemo(() => {
    const rows = Array.isArray(data) ? data : [];
    const discretizers: Record<string, ReturnType<typeof makeDiscretizer>> = {};
    for (const f of features) {
      const vals = rows.map((r) => (isNum(r[f]) ? Number(r[f]) : null));
      discretizers[f] = makeDiscretizer(vals, 3);
    }
    const priorsCount = { Insuficiente: 1, Satisfactorio: 1, Excelente: 1 };
    const like: Record<
      string,
      Record<string, { Insuficiente: number; Satisfactorio: number; Excelente: number }>
    > = {};
    for (const f of features) like[f] = {};

    for (const r of rows) {
      let y: Perf | null = null;
      if (labelKey) y = normalizeLabel(r[labelKey]);
      if (!y) y = labelFromScore(r.exam_score);
      const cls: Perf = y ?? "Satisfactorio";
      priorsCount[cls] += 1;
      for (const f of features) {
        const v = r[f];
        const bin = discretizers[f].bin(isNum(v) ? v : null);
        like[f][bin] = like[f][bin] || {
          Insuficiente: 1,
          Satisfactorio: 1,
          Excelente: 1,
        };
        like[f][bin][cls] += 1;
      }
    }
    const total =
      priorsCount.Insuficiente + priorsCount.Satisfactorio + priorsCount.Excelente;
    const priors = {
      Insuficiente: priorsCount.Insuficiente / total,
      Satisfactorio: priorsCount.Satisfactorio / total,
      Excelente: priorsCount.Excelente / total,
    };
    return { priors, like, discretizers };
  }, [data, features, labelKey]);

  // predicción
  const scored = useMemo(() => {
    const rows = Array.isArray(data) ? data : [];
    return rows.map((r, idx) => {
      let logI = Math.log(model.priors.Insuficiente);
      let logS = Math.log(model.priors.Satisfactorio);
      let logE = Math.log(model.priors.Excelente);
      for (const f of features) {
        const v = r[f];
        const bin = model.discretizers[f].bin(isNum(v) ? v : null);
        const c =
          model.like[f][bin] || {
            Insuficiente: 1,
            Satisfactorio: 1,
            Excelente: 1,
          };
        logI += Math.log(c.Insuficiente);
        logS += Math.log(c.Satisfactorio);
        logE += Math.log(c.Excelente);
      }
      const maxLog = Math.max(logI, logS, logE);
      const eI = Math.exp(logI - maxLog);
      const eS = Math.exp(logS - maxLog);
      const eE = Math.exp(logE - maxLog);
      const Z = eI + eS + eE;
      const pI = eI / Z,
        pS = eS / Z,
        pE = eE / Z;

      let pred: Perf = "Insuficiente";
      if (pS >= pI && pS >= pE) pred = "Satisfactorio";
      if (pE >= pI && pE >= pS) pred = "Excelente";
      const conf = pred === "Insuficiente" ? pI : pred === "Satisfactorio" ? pS : pE;

      return { idx, row: r, pred, conf, probs: { Insuficiente: pI, Satisfactorio: pS, Excelente: pE } };
    });
  }, [data, features, model]);

  // paginación
  const total = scored.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const pageRows = scored.slice(startIdx, endIdx);

  // clave de identificación
  const idKey =
    data?.length &&
    ("name" in data[0]
      ? "name"
      : "student_id" in data[0]
      ? "student_id"
      : "id" in data[0]
      ? "id"
      : null);

  return (
    <div className="w-full py-6">
      <Card className="border-slate-200">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Predicción de rendimiento (Naive Bayes multiclase)</CardTitle>

          {/* Paginación */}
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span>Filas:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="border rounded px-2 py-1"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 border rounded disabled:opacity-50"
                onClick={() => setPage(1)}
                disabled={currentPage === 1}
              >
                «
              </button>
              <button
                className="px-2 py-1 border rounded disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              <span className="px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                className="px-2 py-1 border rounded disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </button>
              <button
                className="px-2 py-1 border rounded disabled:opacity-50"
                onClick={() => setPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                »
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-xs uppercase text-gray-500">
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">{idKey ?? "Estudiante"}</th>
                  <th className="px-3 py-2">Pronóstico</th>
                  <th className="px-3 py-2">% Confianza</th>
                  <th className="px-3 py-2">Acción</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((s, i) => (
                  <tr
                    key={s.idx}
                    className={`rounded-xl ${
                      s.pred === "Insuficiente"
                        ? "bg-rose-50"
                        : s.pred === "Satisfactorio"
                        ? "bg-amber-50"
                        : "bg-emerald-50/40"
                    } shadow-sm`}
                  >
                    <td className="px-3 py-2">{startIdx + i + 1}</td>
                    <td className="px-3 py-2 font-medium">
                      {idKey ? String(s.row[idKey]) : `estudiante_${s.idx}`}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${chipClass(
                          s.pred
                        )}`}
                      >
                        {s.pred}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-semibold">
                      {(s.conf * 100).toFixed(1)}%
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => {
                          setSelected(s);
                          setOpen(true);
                        }}
                        className="text-xs px-3 py-1 rounded border bg-white hover:bg-slate-50"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
            <span>
              Mostrando {startIdx + 1}-{endIdx} de {total}
            </span>
            <span>NB multiclase con discretización (k=3) y Laplace.</span>
          </div>
        </CardContent>
      </Card>

      {/* Modal con los 5 casos de ejemplo */}
      {selected && (
        <ModalDetailTable
          open={open}
          onClose={() => setOpen(false)}
          student={selected.row}
          probs={selected.probs}
          pred={selected.pred}
          scenarios={scenarios}
        />
      )}
    </div>
  );
}
