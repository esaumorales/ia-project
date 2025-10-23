// clusterText.ts
import type { EnrichedStudent, SegmentLabel } from "./types";

/**
 * Construye textos de descripción por cluster calculando promedios reales.
 * Evita “desalineos” por depender del índice crudo de KMeans.
 */
export function makeClusterTextMap(data: EnrichedStudent[]): Record<number, { title: string; text: string }> {
  if (!data.length) return {};

  // Agrupa por cluster
  const groups = new Map<number, EnrichedStudent[]>();
  for (const s of data) {
    const g = groups.get(s.cluster) ?? [];
    g.push(s);
    groups.set(s.cluster, g);
  }

  // Utilidad: promedio seguro
  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

  // Ordenamos clusters por promedio de exam_score (alto → bajo)
  const ordered = [...groups.entries()]
    .map(([c, arr]) => {
      const studyH = avg(arr.map(x => x.study_minutes_per_day)) / 60;
      const socialH = avg(arr.map(x => x.social_media_minutes)) / 60;
      const netflixH = avg(arr.map(x => x.netflix_minutes)) / 60;
      const att = avg(arr.map(x => x.attendance_percentage));
      const sleep = avg(arr.map(x => x.sleep_hours));
      const mh = avg(arr.map(x => x.mental_health_rating));
      const score = avg(arr.map(x => x.exam_score));
      const procrast = avg(arr.map(x => x.procrastination_level));
      const tm = avg(arr.map(x => x.time_management));
      const seg = arr[0]?.segment as SegmentLabel | undefined;

      return {
        cluster: c,
        n: arr.length,
        studyH,
        socialH,
        netflixH,
        att,
        sleep,
        mh,
        score,
        procrast,
        tm,
        seg,
      };
    })
    .sort((a, b) => b.score - a.score);

  // Asigna títulos coherentes con el mapa conceptual según rendimiento
  return ordered.reduce<Record<number, { title: string; text: string }>>((acc, d, rank) => {
    let title: string;
    if (rank === 0) title = `C${d.cluster} — Dedicados con buen manejo del tiempo`;
    else if (rank === ordered.length - 1) title = `C${d.cluster} — Alta procrastinación y estrés`;
    else title = `C${d.cluster} — Saludables con buen entorno de estudio`;

    const text =
      `n=${d.n}. Estudio ~${d.studyH.toFixed(1)} h/día, redes ~${d.socialH.toFixed(2)} h, ` +
      `Netflix ~${d.netflixH.toFixed(2)} h, asistencia ~${d.att.toFixed(1)}%, ` +
      `sueño ~${d.sleep.toFixed(1)} h, salud mental ~${d.mh.toFixed(1)}/10, ` +
      `gestión del tiempo ~${d.tm.toFixed(1)}/5, procrastinación ~${d.procrast.toFixed(1)}/5, ` +
      `exam_score ~${d.score.toFixed(1)}.`;

    acc[d.cluster] = { title, text };
    return acc;
  }, {});
}
