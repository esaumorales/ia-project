import { useMemo } from 'react';
import { useAppStore } from './store';
import type { EnrichedStudent, SegmentLabel } from './types';
import { makeClusterTextMap } from './clusterTexts';

/**
 * Hook principal de filtrado/ordenado para listas de alumnos.
 */
export function useFilteredStudents(): EnrichedStudent[] {
  const {
    data,
    search,
    segmentFilter,
    genderFilter,
    attendanceRange,
    studyRange,
    orderBy,
  } = useAppStore();

  return useMemo(() => {
    const s = search.trim().toLowerCase();

    let arr = data
      .filter((d) =>
        segmentFilter === 'All' ? true : d.segment === (segmentFilter as SegmentLabel),
      )
      .filter((d) => (genderFilter === 'All' ? true : d.gender === genderFilter))
      .filter(
        (d) =>
          d.attendance_percentage >= attendanceRange[0] &&
          d.attendance_percentage <= attendanceRange[1],
      )
      .filter(
        (d) =>
          d.study_minutes_per_day >= studyRange[0] &&
          d.study_minutes_per_day <= studyRange[1],
      )
      .filter((d) =>
        s
          ? d.name.toLowerCase().includes(s) ||
            d.student_id.toLowerCase().includes(s)
          : true,
      );

    switch (orderBy) {
      case 'Nombre':
        arr = arr.slice().sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'Estudio':
        arr = arr.slice().sort((a, b) => b.study_minutes_per_day - a.study_minutes_per_day);
        break;
      case 'Asistencia':
        arr = arr.slice().sort((a, b) => b.attendance_percentage - a.attendance_percentage);
        break;
      case 'Score':
        arr = arr.slice().sort((a, b) => b.exam_score - a.exam_score);
        break;
    }
    return arr;
  }, [data, search, segmentFilter, genderFilter, attendanceRange, studyRange, orderBy]);
}

/**
 * Genera el texto/título por cluster en base a los promedios REALES.
 * Ideal para cards, tooltips o modales de “resumen de cluster”.
 */
export function useClusterTextMap(): Record<number, { title: string; text: string }> {
  const { data } = useAppStore();
  return useMemo(() => makeClusterTextMap(data), [data]);
}

/**
 * Si quieres pintar chips con estadísticas por cluster (n, score, etc.)
 * lo tienes listo aquí — evita recalcular en cada render.
 */
export function useClusterStats(): Array<{
  cluster: number;
  n: number;
  avgScore: number;
  avgStudyH: number;
  avgSocialH: number;
  avgNetflixH: number;
  avgAttendance: number;
  avgSleep: number;
}> {
  const { data } = useAppStore();

  return useMemo(() => {
    if (!data.length) return [];

    const groups = new Map<number, EnrichedStudent[]>();
    for (const s of data) {
      const arr = groups.get(s.cluster) ?? [];
      arr.push(s);
      groups.set(s.cluster, arr);
    }

    const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

    const rows = [...groups.entries()].map(([cluster, arr]) => ({
      cluster,
      n: arr.length,
      avgScore: avg(arr.map(x => x.exam_score)),
      avgStudyH: avg(arr.map(x => x.study_minutes_per_day)) / 60,
      avgSocialH: avg(arr.map(x => x.social_media_minutes)) / 60,
      avgNetflixH: avg(arr.map(x => x.netflix_minutes)) / 60,
      avgAttendance: avg(arr.map(x => x.attendance_percentage)),
      avgSleep: avg(arr.map(x => x.sleep_hours)),
    }));

    // Útil si quieres orden por rendimiento
    rows.sort((a, b) => b.avgScore - a.avgScore);
    return rows;
  }, [data]);
}
