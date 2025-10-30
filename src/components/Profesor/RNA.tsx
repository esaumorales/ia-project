// src/components/Profesor/RNA.tsx
import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card/card";

type AnyRecord = Record<string, any>;
type Perf = "Insuficiente" | "Satisfactorio" | "Excelente";
type PerfFilter = "Todos" | Perf;

type RNAProps = {
  data: AnyRecord[];
  // si tu data ya trae etiqueta: classLabel ("low"|"mid"|"high") o AcademicPerformance en español,
  // el modelo la usará; si no, derivamos por exam_score.
  labelKeyCandidates?: string[]; // default: ["AcademicPerformance","classLabel"]
};

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

// --- Discretización por cuantiles (k bins) ---
function makeDiscretizer(values: (number | null | undefined)[], k = 3) {
  const nums = values.filter(isNum) as number[];
  if (!nums.length) {
    return { cuts: [] as number[], bin: (_: number | null | undefined) => "bin:NA" };
  }
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
    return `bin:${b}`; // 0..k-1
  };
  return { cuts, bin };
}

// Normaliza cualquier etiqueta a nuestras 3 clases
function normalizeLabel(val: any): Perf | null {
  if (val == null) return null;
  const s = String(val).toLowerCase().trim();
  if (["low", "insuficiente"].includes(s)) return "Insuficiente";
  if (["mid", "medio", "satisfactorio", "satisfactoria"].includes(s)) return "Satisfactorio";
  if (["high", "alto", "excelente"].includes(s)) return "Excelente";
  return null;
}

// Deriva etiqueta por score cuando no exista
function labelFromScore(score?: number): Perf | null {
  if (!isNum(score)) return null;
  if (score < 60) return "Insuficiente";
  if (score <= 85) return "Satisfactorio";
  return "Excelente";
}

// badge
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

// bar simple
function bar(widthPct: number) {
  return (
    <div className="h-2 w-24 bg-slate-100 rounded">
      <div className="h-2 rounded" style={{ width: `${Math.max(0, Math.min(100, widthPct))}%`, background: "currentColor" }} />
    </div>
  );
}

export default function RNA({
  data,
  labelKeyCandidates = ["AcademicPerformance", "classLabel"],
}: RNAProps) {
  const [perfFilter, setPerfFilter] = useState<PerfFilter>("Todos");
  const [pageSize, ] = useState<number>(10);

  // columnas disponibles
  const features = useMemo(() => {
    if (!data?.length) return [] as string[];
    const present = new Set(Object.keys(data[0]));
    return DEFAULT_NUMERIC_FEATURES.filter((f) => present.has(f));
  }, [data]);

  // elegir etiqueta existente (si alguna)
  const labelKey = useMemo(() => {
    if (!data?.length) return null as string | null;
    for (const k of labelKeyCandidates) if (k in data[0]) return k;
    return null;
  }, [data, labelKeyCandidates]);

  // Entrenar NB multiclase
  const model = useMemo(() => {
    const rows = Array.isArray(data) ? data : [];

    const classes: Perf[] = ["Insuficiente", "Satisfactorio", "Excelente"];

    // discretizadores
    const discretizers: Record<string, ReturnType<typeof makeDiscretizer>> = {};
    for (const f of features) {
      const vals = rows.map((r) => (isNum(r[f]) ? Number(r[f]) : null));
      discretizers[f] = makeDiscretizer(vals, 3);
    }

    // priors y likelihoods
    const priorCounts: Record<Perf, number> = {
      Insuficiente: 1, // Laplace
      Satisfactorio: 1,
      Excelente: 1,
    };

    const like: Record<string, Record<string, Record<Perf, number>>> = {};
    for (const f of features) like[f] = {};

    for (const r of rows) {
      // determina etiqueta
      let y: Perf | null = null;
      if (labelKey) y = normalizeLabel(r[labelKey]);
      if (!y) y = labelFromScore(r.exam_score);

      // si no se puede inferir, asumimos Satisfactorio como neutro (suavizado ya evita sesgo grande)
      const cls: Perf = y ?? "Satisfactorio";
      priorCounts[cls] = (priorCounts[cls] ?? 1) + 1;

      for (const f of features) {
        const v = r[f];
        const bin = discretizers[f].bin(isNum(v) ? v : null);
        like[f][bin] = like[f][bin] || { Insuficiente: 1, Satisfactorio: 1, Excelente: 1 };
        like[f][bin][cls] += 1;
      }
    }

    const total = priorCounts.Insuficiente + priorCounts.Satisfactorio + priorCounts.Excelente;
    const priors: Record<Perf, number> = {
      Insuficiente: priorCounts.Insuficiente / total,
      Satisfactorio: priorCounts.Satisfactorio / total,
      Excelente: priorCounts.Excelente / total,
    };

    return { classes, priors, like, discretizers };
  }, [data, features, labelKey]);

  // Predicción multiclase + probs
  const scored = useMemo(() => {
    const rows = Array.isArray(data) ? data : [];

    return rows
      .map((r, idx) => {
        let logP: Record<Perf, number> = {
          Insuficiente: Math.log(model.priors.Insuficiente),
          Satisfactorio: Math.log(model.priors.Satisfactorio),
          Excelente: Math.log(model.priors.Excelente),
        };

        for (const f of features) {
          const v = r[f];
          const bin = model.discretizers[f].bin(isNum(v) ? v : null);
          const counts = model.like[f][bin] || { Insuficiente: 1, Satisfactorio: 1, Excelente: 1 };
          logP.Insuficiente += Math.log(counts.Insuficiente);
          logP.Satisfactorio += Math.log(counts.Satisfactorio);
          logP.Excelente += Math.log(counts.Excelente);
        }

        // softmax estable
        const maxLog = Math.max(logP.Insuficiente, logP.Satisfactorio, logP.Excelente);
        const eI = Math.exp(logP.Insuficiente - maxLog);
        const eS = Math.exp(logP.Satisfactorio - maxLog);
        const eE = Math.exp(logP.Excelente - maxLog);
        const Z = eI + eS + eE;

        const pI = eI / Z;
        const pS = eS / Z;
        const pE = eE / Z;

        // clase predicha
        let pred: Perf = "Insuficiente";
        if (pS >= pI && pS >= pE) pred = "Satisfactorio";
        if (pE >= pI && pE >= pS) pred = "Excelente";

        return {
          idx,
          row: r,
          probs: { Insuficiente: pI, Satisfactorio: pS, Excelente: pE },
          pred,
        };
      })
      .sort((a, b) => b.probs.Insuficiente - a.probs.Insuficiente); // orden por riesgo si te sirve
  }, [data, features, model]);

  // filtro y paginación
  const filtered = useMemo(() => {
    if (perfFilter === "Todos") return scored;
    return scored.filter((s) => s.pred === perfFilter);
  }, [scored, perfFilter]);

  const [page, setPageLocal] = useState(1);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const pageRows = filtered.slice(startIdx, endIdx);
  useMemo(() => setPageLocal(1), [perfFilter, pageSize]); // reset al cambiar filtro/tamaño
  const setPage = (n: number) => setPageLocal(Math.max(1, Math.min(totalPages, n)));

  // clave visible
  const idKey =
    data?.length &&
    ("name" in data[0]
      ? "name"
      : "student_id" in data[0]
      ? "student_id"
      : "id" in data[0]
      ? "id"
      : null);

  const cycleFilter = () => {
    setPerfFilter((prev) =>
      prev === "Todos" ? "Insuficiente" : prev === "Insuficiente" ? "Satisfactorio" : prev === "Satisfactorio" ? "Excelente" : "Todos"
    );
  };

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
                onChange={(e) => setPage(Number(e.target.value))}
                className="border rounded px-2 py-1"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-2 py-1 border rounded disabled:opacity-50" onClick={() => setPage(1)} disabled={currentPage === 1}>
                «
              </button>
              <button className="px-2 py-1 border rounded disabled:opacity-50" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}>
                Anterior
              </button>
              <span className="px-2">
                {currentPage} / {totalPages}
              </span>
              <button className="px-2 py-1 border rounded disabled:opacity-50" onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages}>
                Siguiente
              </button>
              <button className="px-2 py-1 border rounded disabled:opacity-50" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages}>
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
                  <th className="px-3 py-2">{idKey ?? "estudiante"}</th>
                  <th className="px-3 py-2">Prob. Insuf.</th>
                  <th className="px-3 py-2">Prob. Satisf.</th>
                  <th className="px-3 py-2">Prob. Excel.</th>
                  <th className="px-3 py-2">
                    <button
                      onClick={cycleFilter}
                      className="text-xs px-2 py-1 rounded-full border bg-slate-50 hover:bg-slate-100"
                      title="Click para alternar filtro: Todos → Insuficiente → Satisfactorio → Excelente → Todos"
                    >
                      Predicción: {perfFilter}
                    </button>
                  </th>
                </tr>
              </thead>

              <tbody>
                {pageRows.map((s, i) => {
                  const pI = s.probs.Insuficiente * 100;
                  const pS = s.probs.Satisfactorio * 100;
                  const pE = s.probs.Excelente * 100;
                  return (
                    <tr
                      key={s.idx}
                      className={`rounded-xl ${
                        s.pred === "Insuficiente" ? "bg-rose-50" : s.pred === "Satisfactorio" ? "bg-amber-50" : "bg-emerald-50/40"
                      } shadow-sm`}
                    >
                      <td className="px-3 py-2">{(currentPage - 1) * pageSize + i + 1}</td>
                      <td className="px-3 py-2 font-medium">{idKey ? String(s.row[idKey]) : `estudiante_${s.idx}`}</td>

                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2 text-rose-700">
                          {bar(pI)}
                          <span className="text-xs font-medium">{pI.toFixed(1)}%</span>
                        </div>
                      </td>

                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2 text-amber-700">
                          {bar(pS)}
                          <span className="text-xs font-medium">{pS.toFixed(1)}%</span>
                        </div>
                      </td>

                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2 text-emerald-700">
                          {bar(pE)}
                          <span className="text-xs font-medium">{pE.toFixed(1)}%</span>
                        </div>
                      </td>

                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-1 rounded-full border ${chipClass(s.pred)}`}>{s.pred}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
            <span>
              Mostrando {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)} de {filtered.length}
            </span>
            <span>NB multiclase con discretización (k=3) y Laplace. La clase predicha muestra el máximo de las 3 probabilidades.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
