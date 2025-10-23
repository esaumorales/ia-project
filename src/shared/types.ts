// Tipos base
export type Gender = "Male" | "Female" | "Other";
export type ParentalEdu = "Primary" | "Secondary" | "Tertiary";
export type InternetQ = "Poor" | "Average" | "Good";

// Datos originales del estudiante
export type Student = {
  id: number;
  student_id: string;
  name: string;
  age: number;
  gender: Gender;
  part_time_job: boolean;

  attendance_percentage: number;
  sleep_hours: number;
  diet_quality: number;            // 1–5
  exercise_frequency: number;      // 0–7 (días/sem)
  parental_education_level: ParentalEdu;
  internet_quality: InternetQ;
  mental_health_rating: number;    // 1–10
  extracurricular_participation: number; // 0/1
  exam_score: number;              // 0–100

  academic_motivation: number;     // 1–5
  time_management: number;         // 1–5
  procrastination_level: number;   // 1–5
  focus_level: number;             // 1–5
  test_anxiety_level: number;      // 1–10
  academic_self_efficacy: number;  // 1–10
  study_techniques_usage: number;  // 1–5
  home_study_environment: number;  // 1–5
  study_resources_availability: number; // 1–5
  financial_stress_level: number;  // 1–5

  study_minutes_per_day: number;
  social_media_minutes: number;
  netflix_minutes: number;
};

// Clasificación del rendimiento y del segmento
export type ClassLabel = "low" | "mid" | "high";
export type SegmentLabel = "Good" | "Average" | "Needs Support";

// Datos enriquecidos tras análisis (PCA + Clustering)
export type EnrichedStudent = Student & {
  classLabel: ClassLabel;     // bajo, medio, alto según score
  cluster: number;            // índice del cluster (0..k-1)
  segment: SegmentLabel;      // nombre semántico (Good/Average/Needs Support)

  // Coordenadas principales del plano PCA
  pcaX: number;
  pcaY: number;

  // Para futuras expansiones (si quieres graficar otras componentes)
  pcaComponents?: number[];   // [c1, c2, ..., c10]
};

// Descripción de cluster (opción dinámica)
export type ClusterDescription = {
  title: string;
  text: string;
};

// Estadísticas agregadas por cluster (para badges o paneles)
export type ClusterStats = {
  cluster: number;
  n: number;
  avgScore: number;
  avgStudyH: number;
  avgSocialH: number;
  avgNetflixH: number;
  avgAttendance: number;
  avgSleep: number;
};
