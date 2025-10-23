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

  // datos
  data: EnrichedStudent[];
  setData: (d: EnrichedStudent[]) => void;

  // selección
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;

  // filtros globales
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
};

export const useAppStore = create<State>((set) => ({
  role: 'Landing',
  setRole: (r) => set({ role: r }),

  data: [],
  setData: (d) => set({ data: d }),

  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),

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

  isDetailOpen: false,
  setDetailOpen: (open) => set({ isDetailOpen: open }),
}));
