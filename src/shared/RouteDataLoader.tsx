import { useEffect } from 'react';
import { useAppStore } from './store';
import { buildAnalytics } from './analytics';
import type { Student } from './types';

/**
 * Carga inicial de datos:
 * - Lee /data/students.json
 * - Aplica buildAnalytics
 * - Guarda en el store global
 */
export default function RouteDataLoader() {
  const { setData, setSelectedId } = useAppStore();

  useEffect(() => {
    fetch('/data/students.json')
      .then((r) => r.json())
      .then((rows: Student[]) => {
        // FIX: buildAnalytics solo recibe un argumento
        const enriched = buildAnalytics(rows);
        setData(enriched);
        if (enriched.length) setSelectedId(enriched[0].id);
      })
      .catch((err) => console.error('Error loading JSON:', err));
  }, [setData, setSelectedId]);

  return null;
}
