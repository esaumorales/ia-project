import { kmeans } from 'ml-kmeans';
import type { EnrichedStudent, Student, ClassLabel, SegmentLabel, Gender, ParentalEdu, InternetQ } from "./types";
import { PCA } from 'ml-pca';

// 1) Selección de features para clustering/PCA (numéricas + codificadas)
const NUMERIC_KEYS: (keyof Student)[] = [
  "attendance_percentage",
  "sleep_hours",
  "diet_quality",
  "exercise_frequency",
  "mental_health_rating",
  "extracurricular_participation",
  "academic_motivation",
  "time_management",
  "procrastination_level",
  "focus_level",
  "test_anxiety_level",
  "academic_self_efficacy",
  "study_techniques_usage",
  "home_study_environment",
  "study_resources_availability",
  "financial_stress_level",
  "study_minutes_per_day",
  "social_media_minutes",
  "netflix_minutes",
  "age"
  // NOTA: dejamos fuera exam_score para no "hacer trampa" en clustering;
  // el score sí lo usamos para nombrar segmentos y para classLabel.
];

// 2) Codificadores simples para categóricas (ordinales razonables)
function encodeGender(g: Gender) {
  return g === "Male" ? 0 : g === "Female" ? 1 : 0.5;
}
function encodeParentalEdu(p: ParentalEdu) {
  return p === "Primary" ? 0 : p === "Secondary" ? 1 : 2;
}
function encodeInternet(q: InternetQ) {
  return q === "Poor" ? 0 : q === "Average" ? 1 : 2;
}

function scoreToClass(score: number): ClassLabel {
  if (score < 60) return "low";
  if (score <= 85) return "mid";
  return "high";
}

function standardize(matrix: number[][]): { X: number[][]; mean: number[]; std: number[] } {
  const cols = matrix[0].length;
  const mean = Array(cols).fill(0);
  const std = Array(cols).fill(0);
  for (let j = 0; j < cols; j++) mean[j] = matrix.reduce((a, r) => a + r[j], 0) / matrix.length;
  for (let j = 0; j < cols; j++) {
    const v = matrix.reduce((a, r) => a + (r[j] - mean[j]) ** 2, 0) / matrix.length;
    std[j] = Math.sqrt(v) || 1;
  }
  const X = matrix.map(row => row.map((v, j) => (v - mean[j]) / std[j]));
  return { X, mean, std };
}

export function buildAnalytics(raw: Student[], k = 3): EnrichedStudent[] {
  // 3) Construye matriz de features (numéricas + categóricas codificadas)
  const M = raw.map(r => {
    const base = NUMERIC_KEYS.map(key => r[key] as number);
    const cats = [
      encodeGender(r.gender),
      encodeParentalEdu(r.parental_education_level),
      encodeInternet(r.internet_quality),
      r.part_time_job ? 1 : 0
    ];
    return base.concat(cats);
  });

  // 4) Estandarización
  const { X } = standardize(M);

  // 5) PCA (2D)
  const pca = new PCA(X, { center: false, scale: false });
  const coords = pca.predict(X, { nComponents: 2 }).to2DArray();

  // 6) KMeans
  const km = kmeans(X, k, { seed: 42, initialization: "kmeans++" });

  // 7) Nombrar segmentos por promedio de exam_score en cada cluster
  const clusterStats: Record<number, { sum: number; n: number }> = {};
  km.clusters.forEach((c, i) => {
    clusterStats[c] ??= { sum: 0, n: 0 };
    clusterStats[c].sum += raw[i].exam_score;
    clusterStats[c].n += 1;
  });
  const ranked = Object.keys(clusterStats)
    .map(c => ({ c: Number(c), avg: clusterStats[Number(c)].sum / clusterStats[Number(c)].n }))
    .sort((a, b) => b.avg - a.avg);

  const labelMap = new Map<number, SegmentLabel>();
  ranked.forEach((d, idx) => {
    let label: SegmentLabel = "Average";
    if (idx === 0) label = "Good";
    else if (idx === ranked.length - 1) label = "Needs Support";
    labelMap.set(d.c, label);
  });

  // 8) Salida enriquecida
  return raw.map((r, i) => ({
    ...r,
    classLabel: scoreToClass(r.exam_score),
    cluster: km.clusters[i],
    segment: labelMap.get(km.clusters[i]) ?? "Average",
    pcaX: coords[i][0],
    pcaY: coords[i][1],
  }));
}

// Mini explicación textual para un alumno según su segmento y variables clave:
export function explainStudent(s: EnrichedStudent): string {
  const positives: string[] = [];
  const risks: string[] = [];

  if (s.academic_motivation >= 4) positives.push("alta motivación");
  if (s.time_management >= 4) positives.push("buena gestión del tiempo");
  if (s.study_techniques_usage >= 4) positives.push("uso sólido de técnicas de estudio");
  if (s.attendance_percentage >= 85) positives.push("asistencia alta");
  if (s.academic_self_efficacy >= 7) positives.push("autoeficacia elevada");

  if (s.procrastination_level >= 4) risks.push("procrastinación alta");
  if (s.test_anxiety_level >= 7) risks.push("ansiedad en exámenes elevada");
  if (s.social_media_minutes >= 180) risks.push("mucho tiempo en redes");
  if (s.netflix_minutes >= 120) risks.push("mucha TV/streaming");
  if (s.sleep_hours < 6) risks.push("pocas horas de sueño");

  const segText = {
    "Good": "perfil con hábitos consistentes y rendimiento alto.",
    "Average": "perfil intermedio con oportunidades de mejora específicas.",
    "Needs Support": "perfil con señales de riesgo que requieren acompañamiento cercano."
  }[s.segment];

  const p = positives.length ? `Fortalezas: ${positives.join(", ")}.` : "";
  const r = risks.length ? `Riesgos: ${risks.join(", ")}.` : "";
  return `Pertenece al segmento ${s.segment}: ${segText} ${p} ${r}`.trim();
}
