import { useMemo } from 'react';
import { useAppStore } from './store';
import type { EnrichedStudent, SegmentLabel } from './types';

/**
 * Extrae la misma lógica de filtrado/ordenado que tenías en HomePage
 * para que pueda reutilizarse en cualquier página.
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
        segmentFilter === 'All'
          ? true
          : d.segment === (segmentFilter as SegmentLabel),
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
        s ? d.name.toLowerCase().includes(s) || d.student_id.toLowerCase().includes(s) : true,
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
