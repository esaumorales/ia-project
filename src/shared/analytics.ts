// analytics.ts
import { kmeans } from 'ml-kmeans';
import { PCA } from 'ml-pca';
import type {
  EnrichedStudent,
  Student,
  ClassLabel,
  SegmentLabel,
  Gender,
  ParentalEdu,
  InternetQ,
} from './types';

// ------------------------------
// 1) Variables cuantitativas
// ------------------------------
const NUMERIC_KEYS: (keyof Student)[] = [
  'attendance_percentage',
  'sleep_hours',
  'diet_quality',
  'exercise_frequency',
  'mental_health_rating',
  'extracurricular_participation',
  'academic_motivation',
  'time_management',
  'procrastination_level',
  'focus_level',
  'test_anxiety_level',
  'academic_self_efficacy',
  'study_techniques_usage',
  'home_study_environment',
  'study_resources_availability',
  'financial_stress_level',
  'study_minutes_per_day',
  'social_media_minutes',
  'netflix_minutes',
  'age',
];

// ------------------------------
// 2) Codificación categóricas
// ------------------------------
function encodeGender(g: Gender) {
  return g === 'Male' ? 0 : g === 'Female' ? 1 : 0.5;
}
function encodeParentalEdu(p: ParentalEdu) {
  return p === 'Primary' ? 0 : p === 'Secondary' ? 1 : 2;
}
function encodeInternet(q: InternetQ) {
  return q === 'Poor' ? 0 : q === 'Average' ? 1 : 2;
}

// ------------------------------
// 3) Clase por score
// ------------------------------
function scoreToClass(score: number): ClassLabel {
  if (score < 60) return 'low';
  if (score <= 85) return 'mid';
  return 'high';
}

// ------------------------------
// 4) Estandarización
// ------------------------------
function standardize(matrix: number[][]): { X: number[][]; mean: number[]; std: number[] } {
  const cols = matrix[0].length;
  const mean = Array(cols).fill(0);
  const std = Array(cols).fill(0);

  for (let j = 0; j < cols; j++) mean[j] = matrix.reduce((a, r) => a + r[j], 0) / matrix.length;

  for (let j = 0; j < cols; j++) {
    const v = matrix.reduce((a, r) => a + (r[j] - mean[j]) ** 2, 0) / matrix.length;
    std[j] = Math.sqrt(v) || 1;
  }

  const X = matrix.map((row) => row.map((v, j) => (v - mean[j]) / std[j]));
  return { X, mean, std };
}

// ------------------------------
// 5) Principal: PCA(10) + KMeans(k=3)
// ------------------------------
export function buildAnalytics(raw: Student[]): EnrichedStudent[] {
  // Construye matriz de features (numéricas + categóricas codificadas)
  const M = raw.map((r) => {
    const base = NUMERIC_KEYS.map((key) => r[key] as number);
    const cats = [
      encodeGender(r.gender),
      encodeParentalEdu(r.parental_education_level),
      encodeInternet(r.internet_quality),
      r.part_time_job ? 1 : 0,
    ];
    return base.concat(cats);
  });

  // Estandariza
  const { X } = standardize(M);

  // PCA (10 componentes)
  const pca = new PCA(X, { center: false, scale: false });
  const coords10D = pca.predict(X, { nComponents: 10 }).to2DArray();

  // Coordenadas 2D para visualización (PC1, PC2)
  const coords2D = coords10D.map((c) => [c[0], c[1]]);

  // KMeans — FORZADO a 3 clusters para cumplir especificación
  const K = 3;
  const km = kmeans(coords10D, K, { seed: 42, initialization: 'kmeans++' });

  // Sanity check
  const uniq = Array.from(new Set(km.clusters));
  if (uniq.length !== 3) {
    console.warn('Aviso: número de clusters resultante ≠ 3:', uniq);
  }

  // Promedios de score por cluster para nombrar segmentos
  const clusterStats: Record<number, { sum: number; n: number }> = {};
  km.clusters.forEach((c, i) => {
    clusterStats[c] ??= { sum: 0, n: 0 };
    clusterStats[c].sum += raw[i].exam_score;
    clusterStats[c].n += 1;
  });

  const ranked = Object.keys(clusterStats)
    .map((c) => ({ c: Number(c), avg: clusterStats[Number(c)].sum / clusterStats[Number(c)].n }))
    .sort((a, b) => b.avg - a.avg);

  // Etiquetas de segmento coherentes con el mapa conceptual
  const labelMap = new Map<number, SegmentLabel>();
  ranked.forEach((d, idx) => {
    let label: SegmentLabel = 'Average';
    if (idx === 0) label = 'Good';            // dedicados / buen manejo del tiempo
    else if (idx === ranked.length - 1) label = 'Needs Support'; // estrés/procrastinación
    labelMap.set(d.c, label);
  });

  // Salida enriquecida
  return raw.map((r, i) => ({
    ...r,
    classLabel: scoreToClass(r.exam_score),
    cluster: km.clusters[i],
    segment: labelMap.get(km.clusters[i]) ?? 'Average',
    pcaX: coords2D[i][0],
    pcaY: coords2D[i][1],
  }));
}

// ------------------------------
// 6) Explicación individual
// ------------------------------
export function explainStudent(s: EnrichedStudent): string {
  const positives: string[] = [];
  const risks: string[] = [];

  if (s.academic_motivation >= 4) positives.push('alta motivación');
  if (s.time_management >= 4) positives.push('buena gestión del tiempo');
  if (s.study_techniques_usage >= 4) positives.push('uso sólido de técnicas de estudio');
  if (s.attendance_percentage >= 85) positives.push('asistencia alta');
  if (s.academic_self_efficacy >= 7) positives.push('autoeficacia elevada');

  if (s.procrastination_level >= 4) risks.push('procrastinación alta');
  if (s.test_anxiety_level >= 7) risks.push('ansiedad elevada');
  if (s.social_media_minutes >= 180) risks.push('uso excesivo de redes');
  if (s.netflix_minutes >= 120) risks.push('mucho tiempo en streaming');
  if (s.sleep_hours < 6) risks.push('pocas horas de sueño');

  const segText = {
    Good: 'perfil con hábitos consistentes, buena organización y alto rendimiento.',
    Average: 'perfil equilibrado con oportunidades de mejora específicas.',
    'Needs Support': 'perfil con señales de riesgo o desorganización que requieren apoyo.',
  }[s.segment];

  const p = positives.length ? `Fortalezas: ${positives.join(', ')}.` : '';
  const r = risks.length ? `Riesgos: ${risks.join(', ')}.` : '';

  return `Pertenece al segmento ${s.segment}: ${segText} ${p} ${r}`.trim();
}
