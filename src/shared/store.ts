import { create } from 'zustand';
import type { EnrichedStudent, SegmentLabel } from './types';

export type Role = 'Landing' | 'Alumno' | 'Profesor';
type GenderFilter = 'All' | 'Male' | 'Female' | 'Other';
type ViewMode = 'table' | 'cards';
type OrderBy = 'Nombre' | 'Estudio' | 'Asistencia' | 'Score';

type State = {
  // Rol / layout
  role: Role;
  setRole: (r: Role) => void;

  // Datos enriquecidos (resultado de buildAnalytics)
  data: EnrichedStudent[];
  setData: (d: EnrichedStudent[]) => void;

  // Selección
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;

  // Filtros globales
  search: string;
  setSearch: (s: string) => void;
  segmentFilter: 'All' | SegmentLabel;
  setSegmentFilter: (s: 'All' | SegmentLabel) => void;
  genderFilter: GenderFilter;
  setGenderFilter: (g: GenderFilter) => void;
  attendanceRange: [number, number]; // 0..100
  setAttendanceRange: (r: [number, number]) => void;
  studyRange: [number, number]; // 0..300 min/día
  setStudyRange: (r: [number, number]) => void;
  orderBy: OrderBy;
  setOrderBy: (o: OrderBy) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;

  // Modal detalle
  isDetailOpen: boolean;
  setDetailOpen: (open: boolean) => void;

  // ---------- NUEVO: parámetros del análisis (opcionales) ----------
  kClusters: number;        // p.ej. 3
  setKClusters: (k: number) => void;

  pcaComponents: number;    // p.ej. 10
  setPcaComponents: (n: number) => void;

  seed: number;             // para reproducibilidad en KMeans
  setSeed: (s: number) => void;

  // ---------- NUEVO: controles de UX del scatter ----------
  // Permite resaltar/filtrar visualmente un cluster en el gráfico
  selectedCluster: number | 'All';
  setSelectedCluster: (c: number | 'All') => void;

  // Escala del plano PCA (para “juntar/separar” puntos en UI)
  pcaScale: number;   // 1 = normal, <1 comprime, >1 expande
  setPcaScale: (v: number) => void;

  // Pequeño jitter visual para evitar solapamiento (no afecta datos)
  pcaJitter: number;  // 0..1 típico
  setPcaJitter: (v: number) => void;
};

export const useAppStore = create<State>((set) => ({
  // Rol / layout
  role: 'Landing',
  setRole: (r) => set({ role: r }),

  // Datos
  data: [],
  setData: (d) => set({ data: d }),

  // Selección
  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),

  // Filtros globales
  search: '',
  setSearch: (s) => set({ search: s }),

  segmentFilter: 'All',
  setSegmentFilter: (s) => set({ segmentFilter: s }),

  genderFilter: 'All',
  setGenderFilter: (g) => set({ genderFilter: g }),

  attendanceRange: [0, 100],
  setAttendanceRange: (r) => set({ attendanceRange: r }),

  studyRange: [0, 300],
  setStudyRange: (r) => set({ studyRange: r }),

  orderBy: 'Nombre',
  setOrderBy: (o) => set({ orderBy: o }),

  viewMode: 'table',
  setViewMode: (v) => set({ viewMode: v }),

  // Modal detalle
  isDetailOpen: false,
  setDetailOpen: (open) => set({ isDetailOpen: open }),

  // ---------- NUEVO: parámetros del análisis ----------
  kClusters: 3,
  setKClusters: (k) => set({ kClusters: k }),

  pcaComponents: 10,
  setPcaComponents: (n) => set({ pcaComponents: n }),

  seed: 42,
  setSeed: (s) => set({ seed: s }),

  // ---------- NUEVO: UX del scatter ----------
  selectedCluster: 'All',
  setSelectedCluster: (c) => set({ selectedCluster: c }),

  pcaScale: 1,
  setPcaScale: (v) => set({ pcaScale: v }),

  pcaJitter: 0,
  setPcaJitter: (v) => set({ pcaJitter: v }),
}));
