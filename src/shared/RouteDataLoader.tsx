import { useEffect } from 'react';
import { useAppStore } from './store';
import { buildAnalytics } from './analytics';
import type { Student } from './types';

/**
 * Componente "silencioso" que solo se encarga de:
 * - cargar /data/students.json
 * - enriquecer con buildAnalytics
 * - hacer setData y seleccionar el primero
 *
 * Equivale al useEffect que tenías en HomePage.
 * Se monta una sola vez en App.
 */
export default function RouteDataLoader() {
  const { setData, setSelectedId } = useAppStore();

  useEffect(() => {
    fetch('/data/students.json')
      .then((r) => r.json())
      .then((rows: Student[]) => {
        const enriched = buildAnalytics(rows, 4);
        setData(enriched);
        if (enriched.length) setSelectedId(enriched[0].id);
      })
      .catch((err) => console.error('Error loading JSON:', err));
  }, [setData, setSelectedId]);

  return null;
}
